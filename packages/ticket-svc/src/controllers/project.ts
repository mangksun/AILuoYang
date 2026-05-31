import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, location } = req.body;

    const project = await prisma.project.create({
      data: { name, location },
    });

    res.json({ code: 0, message: '项目创建成功', data: project });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ code: 0, message: 'success', data: projects });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: { name, location, status },
    });

    res.json({ code: 0, message: '项目更新成功', data: project });
  } catch (err) {
    next(err);
  }
}
