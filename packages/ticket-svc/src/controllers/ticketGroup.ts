import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, sortOrder } = req.body;

    const group = await prisma.ticketGroup.create({
      data: { name, sortOrder: sortOrder || 0 },
    });

    res.json({ code: 0, message: '分组创建成功', data: group });
  } catch (err) {
    next(err);
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await prisma.ticketGroup.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { tickets: true } } },
    });

    res.json({ code: 0, message: 'success', data: groups });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, sortOrder, status } = req.body;

    const group = await prisma.ticketGroup.update({
      where: { id: Number(id) },
      data: { name, sortOrder, status },
    });

    res.json({ code: 0, message: '分组更新成功', data: group });
  } catch (err) {
    next(err);
  }
}
