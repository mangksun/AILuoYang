import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import * as checkClient from '../services/checkClient';
import * as orderClient from '../services/orderClient';
import * as wxPay from '../services/wxPay';

export async function wechatCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = await wxPay.verifyAndDecryptCallback(req.body);

    if (payload.trade_state !== 'SUCCESS') {
      res.json({ code: 'SUCCESS', message: '成功' });
      return;
    }

    const payment = await prisma.miniappPayment.findFirst({
      where: { orderNo: payload.out_trade_no },
    });

    if (!payment) {
      res.status(404).json({ code: 'FAIL', message: '订单不存在' });
      return;
    }

    if (payment.status === 'paid') {
      res.json({ code: 'SUCCESS', message: '成功' });
      return;
    }

    await prisma.miniappPayment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        transactionId: payload.transaction_id,
        callbackPayload: JSON.stringify(payload),
        paidAt: new Date(),
      },
    });

    await Promise.all([
      orderClient.markPaid(payment.orderId, {
        transactionId: payload.transaction_id,
        paidAt: new Date(),
      }),
      checkClient.createVerification({ orderId: payment.orderId }),
    ]);

    res.json({ code: 'SUCCESS', message: '成功' });
  } catch (err) {
    next(err);
  }
}
