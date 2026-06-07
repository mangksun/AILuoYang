import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import prisma from '../prisma/client';
import * as checkClient from '../services/checkClient';
import * as orderClient from '../services/orderClient';
import * as ticketClient from '../services/ticketClient';
import * as wxPay from '../services/wxPay';

const createSchema = Joi.object({
  ticketTypeId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  visitDate: Joi.date().iso().optional(),
  visitorCategory: Joi.string().valid('adult', 'child', 'senior', 'student').default('adult'),
  contactName: Joi.string().max(50).allow('', null).optional(),
  contactPhone: Joi.string().max(20).allow('', null).optional(),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      res.status(400).json({ code: 400, message: error.details[0].message, data: null });
      return;
    }

    const userId = req.user!.userId;
    const ticket = await ticketClient.getTicketType(value.ticketTypeId);

    if (!ticket || ticket.status !== 'active') {
      res.status(400).json({ code: 400, message: '票种不可售', data: null });
      return;
    }

    if (ticket.expireDate && new Date(ticket.expireDate) < new Date()) {
      res.status(400).json({ code: 400, message: '票种已过期', data: null });
      return;
    }

    if (ticket.purchaseLimit && value.quantity > ticket.purchaseLimit) {
      res.status(400).json({ code: 400, message: '超过限购数量', data: null });
      return;
    }

    const totalAmount = Number(ticket.price) * value.quantity;
    await ticketClient.reserveTicketStock(value.ticketTypeId, value.quantity);

    const order = await orderClient.createOrder({
      userId,
      ticketTypeId: value.ticketTypeId,
      quantity: value.quantity,
      visitDate: value.visitDate || null,
      visitorCategory: value.visitorCategory,
      contactName: value.contactName || null,
      contactPhone: value.contactPhone || null,
      totalAmount,
      payAmount: totalAmount,
      payMethod: 'wechat',
      channel: 'miniapp',
    });

    const paymentParams = await wxPay.createPrepay({
      orderNo: order.orderNo,
      description: ticket.name,
      amount: totalAmount,
      openid: req.user!.openid,
    });

    await prisma.miniappPayment.create({
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        userId,
        prepayId: paymentParams.prepayId,
        payAmount: totalAmount,
        status: 'pending',
      },
    });

    res.json({
      code: 0,
      message: '订单创建成功',
      data: {
        order,
        payment: paymentParams.wxClientParams,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderClient.listOrders({
      userId: req.user!.userId,
      channel: 'miniapp',
      status: req.query.status,
      page: req.query.page || 1,
      pageSize: req.query.pageSize || 20,
    });

    res.json({ code: 0, message: 'success', data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderClient.getOrder(Number(req.params.id));

    if (order.userId !== req.user!.userId || order.channel !== 'miniapp') {
      res.status(404).json({ code: 404, message: '订单不存在', data: null });
      return;
    }

    const verifications = await checkClient.listVerifications({ orderId: order.id, page: 1, pageSize: 1 });
    const verification = verifications.list?.[0] || null;

    res.json({
      code: 0,
      message: 'success',
      data: {
        ...order,
        verification,
        qrcodePayload: {
          type: 'order',
          orderId: order.id,
          orderNo: order.orderNo,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
