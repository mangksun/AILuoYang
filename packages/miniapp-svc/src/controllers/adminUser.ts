import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const where: any = {};

    if (req.query.role) where.role = req.query.role;
    if (req.query.status) where.status = req.query.status;
    if (req.query.keyword) {
      where.OR = [
        { nickname: { contains: req.query.keyword } },
        { phone: { contains: req.query.keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      prisma.miniappUser.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.miniappUser.count({ where }),
    ]);

    res.json({ code: 0, message: 'success', data: { list, total, page, pageSize } });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { role, status } = req.body;

    const user = await prisma.miniappUser.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ code: 404, message: '用户不存在', data: null });
      return;
    }

    const updated = await prisma.miniappUser.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
      },
    });

    res.json({ code: 0, message: '更新成功', data: updated });
  } catch (err) {
    next(err);
  }
}
