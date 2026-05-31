import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name, type, price, validityDays, totalUses, projectLimits,
      antiFraudInterval, swipePurchaseEnabled,
    } = req.body;

    const cardType = await prisma.memberCardType.create({
      data: {
        name,
        type,
        price,
        validityDays,
        totalUses,
        projectLimits: projectLimits ? JSON.stringify(projectLimits) : null,
        antiFraudInterval: antiFraudInterval || 0,
        swipePurchaseEnabled: swipePurchaseEnabled || false,
      },
    });

    res.json({ code: 0, message: '会员卡类型创建成功', data: cardType });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const cardTypes = await prisma.memberCardType.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { cards: true } } },
    });

    res.json({ code: 0, message: 'success', data: cardTypes });
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

    const cardType = await prisma.memberCardType.update({
      where: { id: Number(id) },
      data,
    });

    res.json({ code: 0, message: '会员卡类型更新成功', data: cardType });
  } catch (err) {
    next(err);
  }
}
