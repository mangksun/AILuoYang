import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { cardNo, cardTypeId, userId } = req.body;

    const cardType = await prisma.memberCardType.findUnique({
      where: { id: cardTypeId },
    });

    if (!cardType) {
      res.status(400).json({ code: 400, message: '会员卡类型不存在', data: null });
      return;
    }

    const now = new Date();
    const expireAt = new Date(now.getTime() + cardType.validityDays * 24 * 60 * 60 * 1000);

    const card = await prisma.memberCard.create({
      data: {
        cardNo,
        cardTypeId,
        userId,
        balance: cardType.type === 'stored' ? cardType.price : 0,
        remainingUses: cardType.totalUses || 0,
        expireAt,
      },
    });

    res.json({ code: 0, message: '会员卡创建成功', data: card });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, cardTypeId, status, userId } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (cardTypeId) where.cardTypeId = Number(cardTypeId);
    if (status) where.status = status;
    if (userId) where.userId = Number(userId);

    const [list, total] = await Promise.all([
      prisma.memberCard.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: { cardType: true },
      }),
      prisma.memberCard.count({ where }),
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
    const card = await prisma.memberCard.findUnique({
      where: { id: Number(req.params.id) },
      include: { cardType: true },
    });

    if (!card) {
      res.status(404).json({ code: 404, message: '会员卡不存在', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: card });
  } catch (err) {
    next(err);
  }
}

export async function freeze(req: Request, res: Response, next: NextFunction) {
  try {
    const card = await prisma.memberCard.update({
      where: { id: Number(req.params.id) },
      data: { status: 'frozen' },
    });

    res.json({ code: 0, message: '会员卡已冻结', data: card });
  } catch (err) {
    next(err);
  }
}

export async function activate(req: Request, res: Response, next: NextFunction) {
  try {
    const card = await prisma.memberCard.update({
      where: { id: Number(req.params.id) },
      data: { status: 'active', activatedAt: new Date() },
    });

    res.json({ code: 0, message: '会员卡已激活', data: card });
  } catch (err) {
    next(err);
  }
}
