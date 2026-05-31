import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../prisma/client';

function generateOrderNo(): string {
  const now = new Date();
  const date = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(100000 + Math.random() * 900000));
  return `ORD${date}${random}`;
}

const createSchema = Joi.object({
  userId: Joi.number().integer().required(),
  ticketTypeId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  totalAmount: Joi.number().precision(2).required(),
  payAmount: Joi.number().precision(2).required(),
  payMethod: Joi.string().max(20).required(),
  channel: Joi.string().max(20).required(),
});

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  channel: Joi.string().max(20).optional(),
  status: Joi.string().max(20).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

const refundSchema = Joi.object({
  amount: Joi.number().precision(2).positive().required(),
  method: Joi.string().max(20).required(),
  reason: Joi.string().optional(),
  operatorId: Joi.number().integer().required(),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: value.userId,
        ticketTypeId: value.ticketTypeId,
        quantity: value.quantity,
        totalAmount: value.totalAmount,
        payAmount: value.payAmount,
        payMethod: value.payMethod,
        payStatus: 'unpaid',
        channel: value.channel,
        status: 'pending',
      },
    });

    res.json({ code: 0, message: '订单创建成功', data: order });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = listSchema.validate(req.query);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const { page, pageSize, channel, status, startDate, endDate } = value;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list, total, page, pageSize },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { refunds: true },
    });

    if (!order) {
      res.status(404).json({ code: 404, message: '订单不存在', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function refund(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = refundSchema.validate(req.body);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const orderId = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ code: 404, message: '订单不存在', data: null });
      return;
    }

    if (order.status === 'refunded' || order.status === 'cancelled') {
      res.status(400).json({ code: 400, message: '订单已退款或已取消，无法退款', data: null });
      return;
    }

    const newRefundAmount = Number(order.refundAmount) + value.amount;
    if (newRefundAmount > Number(order.payAmount)) {
      res.status(400).json({ code: 400, message: '退款金额超过支付金额', data: null });
      return;
    }

    const refundNo = `RFD${Date.now()}${String(Math.floor(1000 + Math.random() * 9000))}`;
    const isFullRefund = newRefundAmount >= Number(order.payAmount);

    const [refundRecord, updatedOrder] = await prisma.$transaction([
      prisma.refund.create({
        data: {
          orderId,
          refundNo,
          amount: value.amount,
          method: value.method,
          status: 'pending',
          reason: value.reason || null,
          operatorId: value.operatorId,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          refundAmount: newRefundAmount,
          status: isFullRefund ? 'refunded' : 'partial_refunded',
          refundedAt: new Date(),
        },
      }),
    ]);

    res.json({ code: 0, message: '退款申请已提交', data: { refund: refundRecord, order: updatedOrder } });
  } catch (err) {
    next(err);
  }
}
