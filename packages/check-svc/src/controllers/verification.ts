import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, orderId, status } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (orderId) where.orderId = Number(orderId);
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.verification.count({ where }),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list, total, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) {
    next(err);
  }
}
