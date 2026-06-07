import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      groupId, name, price, validDays, usableDays, totalUses, gateUses,
      projectLimits, expireDate, purchaseLimit, needReservation, needApproval, totalStock, description,
    } = req.body;

    const ticket = await prisma.ticketType.create({
      data: {
        groupId,
        name,
        price,
        validDays: validDays || 0,
        usableDays: usableDays || 1,
        totalUses: totalUses || 1,
        gateUses: gateUses || 1,
        projectLimits: projectLimits ? JSON.stringify(projectLimits) : null,
        expireDate: expireDate ? new Date(expireDate) : null,
        purchaseLimit,
        needReservation: needReservation || false,
        needApproval: needApproval || false,
        totalStock: totalStock ?? null,
        description,
      },
    });

    res.json({ code: 0, message: '票种创建成功', data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, groupId, status, keyword } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSizeNumber = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNumber - 1) * pageSizeNumber;

    const where: any = {};
    if (groupId) where.groupId = Number(groupId);
    if (status) where.status = status;
    if (keyword) where.name = { contains: String(keyword) };

    const [list, total] = await Promise.all([
      prisma.ticketType.findMany({
        where,
        skip,
        take: pageSizeNumber,
        orderBy: { createdAt: 'desc' },
        include: { group: true },
      }),
      prisma.ticketType.count({ where }),
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

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await prisma.ticketType.findUnique({
      where: { id: Number(req.params.id) },
      include: { group: true },
    });

    if (!ticket) {
      res.status(404).json({ code: 404, message: '票种不存在', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.projectLimits) {
      data.projectLimits = JSON.stringify(data.projectLimits);
    }
    if (data.expireDate) {
      data.expireDate = new Date(data.expireDate);
    }

    const ticket = await prisma.ticketType.update({
      where: { id: Number(id) },
      data,
    });

    res.json({ code: 0, message: '票种更新成功', data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function reserveStock(req: Request, res: Response, next: NextFunction) {
  try {
    const ticketId = Number(req.params.id);
    const quantity = Math.max(1, Number(req.body.quantity) || 1);

    const ticket = await prisma.ticketType.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.status !== 'active') {
      res.status(400).json({ code: 400, message: '票种不可售', data: null });
      return;
    }

    const totalStock = ticket.totalStock;
    const soldStock = ticket.soldStock || 0;
    if (totalStock !== null && soldStock + quantity > totalStock) {
      res.status(400).json({ code: 400, message: '库存不足', data: null });
      return;
    }

    const updated = await prisma.ticketType.update({
      where: { id: ticketId },
      data: { soldStock: { increment: quantity } },
    });

    res.json({ code: 0, message: '库存已锁定', data: updated });
  } catch (err) {
    next(err);
  }
}

// 停用票种（不删除，防止历史订单丢失）
export async function disable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticketType.update({
      where: { id: Number(id) },
      data: { status: 'disabled' },
    });

    res.json({ code: 0, message: '票种已停用', data: ticket });
  } catch (err) {
    next(err);
  }
}
