import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = Number(req.body.orderId);

    if (!orderId) {
      res.status(400).json({ code: 400, message: 'orderId 不能为空', data: null });
      return;
    }

    const verification = await prisma.verification.upsert({
      where: { orderId },
      update: {},
      create: {
        orderId,
        status: 'unused',
      },
    });

    res.json({ code: 0, message: '核销凭证创建成功', data: verification });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, orderId, status } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSizeNumber = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNumber - 1) * pageSizeNumber;

    const where: any = {};
    if (orderId) where.orderId = Number(orderId);
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        skip,
        take: pageSizeNumber,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.verification.count({ where }),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list, total, page: pageNumber, pageSize: pageSizeNumber },
    });
  } catch (err) {
    next(err);
  }
}
