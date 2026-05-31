import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, merchantId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (merchantId) where.merchantId = Number(merchantId);

    const users = await prisma.adminUser.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        role: true,
        merchantId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ code: 0, message: 'success', data: users });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { username, password, role, merchantId, status } = req.body;

    const data: any = {};
    if (username !== undefined) data.username = username;
    if (role !== undefined) data.role = role;
    if (merchantId !== undefined) data.merchantId = Number(merchantId);
    if (status !== undefined) data.status = status;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.adminUser.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        merchantId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ code: 0, message: '用户更新成功', data: user });
  } catch (err) {
    next(err);
  }
}
