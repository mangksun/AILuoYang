import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Redis from 'ioredis';
import prisma from '../prisma/client';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const checkSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  projectId: Joi.number().integer().required(),
  gateId: Joi.number().integer().required(),
  checkType: Joi.string().valid('entry', 'project').required(),
});

const identityVerifySchema = Joi.object({
  idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/).required()
    .messages({ 'string.pattern.base': '身份证号格式不正确' }),
  name: Joi.string().max(50).required(),
});

export async function check(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = checkSchema.validate(req.body);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const { orderId, projectId, gateId, checkType } = value;

    // 查找核销记录
    const verification = await prisma.verification.findUnique({
      where: { orderId },
    });

    if (!verification) {
      const record = await prisma.checkRecord.create({
        data: {
          orderId,
          projectId,
          gateId,
          checkType,
          result: 'failed',
          failReason: '订单不存在或未支付',
        },
      });
      res.json({ code: 0, message: '检票失败：订单不存在或未支付', data: { success: false, checkRecord: record } });
      return;
    }

    // 检查核销状态
    if (verification.status === 'used') {
      const record = await prisma.checkRecord.create({
        data: {
          orderId,
          projectId,
          gateId,
          checkType,
          result: 'failed',
          failReason: '订单已核销',
        },
      });
      res.json({ code: 0, message: '检票失败：订单已核销', data: { success: false, checkRecord: record } });
      return;
    }

    // 检查项目可用次数（Redis 原子递增）
    const projectKey = `ticket:${orderId}:project:${projectId}`;
    const projectCount = await redis.incr(projectKey);
    if (projectCount === 1) {
      // 首次设置，过期 24 小时
      await redis.expire(projectKey, 86400);
    }

    // 项目限次默认为 1（可通过配置扩展）
    const projectLimit = 1;
    if (projectCount > projectLimit) {
      await redis.decr(projectKey); // 回滚
      const record = await prisma.checkRecord.create({
        data: {
          orderId,
          projectId,
          gateId,
          checkType,
          result: 'failed',
          failReason: '该项目可用次数已用完',
        },
      });
      res.json({ code: 0, message: '检票失败：该项目可用次数已用完', data: { success: false, checkRecord: record } });
      return;
    }

    // 检查总可用次数（Redis 原子递增）
    const totalKey = `ticket:${orderId}:total`;
    const totalCount = await redis.incr(totalKey);
    if (totalCount === 1) {
      await redis.expire(totalKey, 86400);
    }

    // 总次数限制默认为 1（可通过配置扩展）
    const totalLimit = 1;
    if (totalCount > totalLimit) {
      await redis.decr(totalKey); // 回滚
      await redis.decr(projectKey); // 回滚
      const record = await prisma.checkRecord.create({
        data: {
          orderId,
          projectId,
          gateId,
          checkType,
          result: 'failed',
          failReason: '总可用次数已用完',
        },
      });
      res.json({ code: 0, message: '检票失败：总可用次数已用完', data: { success: false, checkRecord: record } });
      return;
    }

    // 创建检票记录
    const checkRecord = await prisma.checkRecord.create({
      data: {
        orderId,
        projectId,
        gateId,
        checkType,
        result: 'success',
      },
    });

    // 首次检票，更新 verification 状态
    if (verification.status === 'unused') {
      await prisma.verification.update({
        where: { orderId },
        data: {
          status: 'used',
          firstVerifiedAt: new Date(),
        },
      });
    }

    res.json({
      code: 0,
      message: '检票成功',
      data: { success: true, checkRecord },
    });
  } catch (err) {
    next(err);
  }
}

export async function identityVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = identityVerifySchema.validate(req.body);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const { idCard, name } = value;

    // 简化版身份证免票验证：检查身份证号格式通过即可放行
    // 实际场景可对接公安系统或景区免票名单
    res.json({
      code: 0,
      message: '身份证验证通过',
      data: {
        allowed: true,
        idCard: idCard.replace(/^(.{6})(.+)(.{4})$/, '$1****$3'),
        name,
      },
    });
  } catch (err) {
    next(err);
  }
}
