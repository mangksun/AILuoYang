import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      channelId, localTicketId, remoteProductId, remoteProductName,
      retailPrice, settlementPrice,
    } = req.body;

    // 验证渠道存在
    const channel = await prisma.otaChannel.findUnique({ where: { id: channelId } });
    if (!channel) {
      res.status(400).json({ code: 400, message: 'OTA渠道不存在', data: null });
      return;
    }

    // 验证 local_ticket_id 对应的票种存在（跨库查询 ticket-svc 的 ticket_type 表）
    const ticketType = await prisma.$queryRaw<any[]>`SELECT id FROM ticket_type WHERE id = ${localTicketId} AND status = 'active'`;
    if (!ticketType || ticketType.length === 0) {
      res.status(400).json({ code: 400, message: '对应的票种不存在或已停用', data: null });
      return;
    }

    const mapping = await prisma.otaProductMapping.create({
      data: {
        channelId,
        localTicketId,
        remoteProductId,
        remoteProductName,
        retailPrice,
        settlementPrice,
      },
    });

    res.json({ code: 0, message: '产品映射创建成功', data: mapping });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, channelId, status, keyword } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (channelId) where.channelId = Number(channelId);
    if (status) where.status = status;
    if (keyword) where.remoteProductName = { contains: String(keyword) };

    const [list, total] = await Promise.all([
      prisma.otaProductMapping.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: { channel: true },
      }),
      prisma.otaProductMapping.count({ where }),
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

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const mapping = await prisma.otaProductMapping.findUnique({
      where: { id: Number(req.params.id) },
      include: { channel: true },
    });

    if (!mapping) {
      res.status(404).json({ code: 404, message: '产品映射不存在', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: mapping });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const {
      remoteProductId, remoteProductName,
      retailPrice, settlementPrice, status,
    } = req.body;

    const data: any = {};
    if (remoteProductId !== undefined) data.remoteProductId = remoteProductId;
    if (remoteProductName !== undefined) data.remoteProductName = remoteProductName;
    if (retailPrice !== undefined) data.retailPrice = retailPrice;
    if (settlementPrice !== undefined) data.settlementPrice = settlementPrice;
    if (status !== undefined) data.status = status;

    const mapping = await prisma.otaProductMapping.update({
      where: { id: Number(id) },
      data,
    });

    res.json({ code: 0, message: '产品映射更新成功', data: mapping });
  } catch (err) {
    next(err);
  }
}
