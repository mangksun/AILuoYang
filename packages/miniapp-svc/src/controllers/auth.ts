import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../prisma/client';
import { code2Session } from '../services/wxAuth';
import { signMiniappToken } from '../utils/jwt';

const loginSchema = Joi.object({
  code: Joi.string().required(),
  nickname: Joi.string().max(100).allow('', null).optional(),
  avatarUrl: Joi.string().max(500).allow('', null).optional(),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const session = await code2Session(value.code);

    const user = await prisma.miniappUser.upsert({
      where: { openid: session.openid },
      update: {
        unionid: session.unionid || undefined,
        nickname: value.nickname || undefined,
        avatarUrl: value.avatarUrl || undefined,
        lastLoginAt: new Date(),
      },
      create: {
        openid: session.openid,
        unionid: session.unionid || null,
        nickname: value.nickname || null,
        avatarUrl: value.avatarUrl || null,
        lastLoginAt: new Date(),
      },
    });

    const token = signMiniappToken({
      userId: user.id,
      userType: 'miniapp',
      openid: user.openid,
    });

    res.json({
      code: 0,
      message: '登录成功',
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.miniappUser.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      res.status(404).json({ code: 404, message: '用户不存在', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: user });
  } catch (err) {
    next(err);
  }
}
