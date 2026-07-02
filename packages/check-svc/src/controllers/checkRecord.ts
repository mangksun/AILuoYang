import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { getOrder } from '../services/orderClient';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, orderId, projectId, gateId, checkType, result } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSizeNumber = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNumber - 1) * pageSizeNumber;

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
        take: pageSizeNumber,
        orderBy: { checkedAt: 'desc' },
      }),
      prisma.checkRecord.count({ where }),
    ]);

    // 批量获取订单号
    const orderIds = [...new Set(list.map((r: any) => r.orderId))];
    const orderMap = new Map<number, string>();
    await Promise.all(
      orderIds.map(async (id) => {
        const order = await getOrder(id);
        if (order?.orderNo) orderMap.set(id, order.orderNo);
      }),
    );

    const enriched = list.map((r: any) => ({
      ...r,
      orderNo: orderMap.get(r.orderId) || null,
    }));

    res.json({
      code: 0,
      message: 'success',
      data: { list: enriched, total, page: pageNumber, pageSize: pageSizeNumber },
    });
  } catch (err) {
    next(err);
  }
}
