import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../prisma/client';

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  channel: Joi.string().max(20).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

const exportSchema = Joi.object({
  channel: Joi.string().max(20).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = listSchema.validate(req.query);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const { page, pageSize, channel, startDate, endDate } = value;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (channel) where.channel = channel;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      prisma.reconciliation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.reconciliation.count({ where }),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list, total, page, pageSize },
    });
  } catch (err) {
    next(err);
  }
}

export async function exportData(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = exportSchema.validate(req.query);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const { channel, startDate, endDate } = value;

    const where: any = {};
    if (channel) where.channel = channel;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await prisma.reconciliation.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const headers = ['ID', '渠道', '日期', '订单数', '金额', '本地金额', '平台金额', '差异', '状态', '创建时间'];
    const rows = records.map((r: typeof records[number]) => [
      r.id,
      r.channel,
      r.date.toISOString().slice(0, 10),
      r.orderCount,
      r.amount.toString(),
      r.localAmount.toString(),
      r.platformAmount.toString(),
      r.diff.toString(),
      r.status,
      r.createdAt.toISOString(),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { headers, rows },
    });
  } catch (err) {
    next(err);
  }
}
