import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      groupId, name, price, validDays, usableDays, totalUses, gateUses,
      projectLimits, expireDate, purchaseLimit, needReservation, needApproval, description,
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
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (groupId) where.groupId = Number(groupId);
    if (status) where.status = status;
    if (keyword) where.name = { contains: String(keyword) };

    const [list, total] = await Promise.all([
      prisma.ticketType.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: { group: true },
      }),
      prisma.ticketType.count({ where }),
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
