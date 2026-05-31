import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function sync(req: Request, res: Response, next: NextFunction) {
  try {
    const { channelId, orderId, action, localStatus } = req.body;

    if (!channelId || !action) {
      res.status(400).json({ code: 400, message: '参数不完整，需要 channelId、action', data: null });
      return;
    }

    // 验证渠道存在
    const channel = await prisma.otaChannel.findUnique({ where: { id: channelId } });
    if (!channel) {
      res.status(400).json({ code: 400, message: 'OTA渠道不存在', data: null });
      return;
    }

    // 模拟同步核销状态到 OTA 平台，创建同步日志
    const syncLog = await prisma.otaSyncLog.create({
      data: {
        channelId,
        orderId: orderId || null,
        action,
        localStatus: localStatus || 'verified',
        remoteStatus: 'synced',
      },
    });

    res.json({
      code: 0,
      message: '同步成功',
      data: syncLog,
    });
  } catch (err) {
    next(err);
  }
}
