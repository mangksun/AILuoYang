import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
      return;
    }

    const user = await prisma.adminUser.findUnique({ where: { username } });

    if (!user) {
      res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ code: 403, message: '账号已被禁用', data: null });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, merchantId: user.merchantId },
      JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRES_IN as any },
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          merchantId: user.merchantId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
