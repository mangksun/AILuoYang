import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, orderId, projectId, gateId, checkType, result } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (orderId) where.orderId = Number(orderId);
    if (projectId) where.projectId = Number(projectId);
    if (gateId) where.gateId = Number(gateId);
    if (checkType) where.checkType = checkType;
    if (result) where.result = result;

    const [list, total] = await Promise.all([
      prisma.checkRecord.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { checkedAt: 'desc' },
      }),
      prisma.checkRecord.count({ where }),
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
