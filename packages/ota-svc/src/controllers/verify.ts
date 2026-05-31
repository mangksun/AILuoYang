import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const { channel, remoteProductId, verifyCode } = req.body;

    if (!channel || !remoteProductId || !verifyCode) {
      res.status(400).json({ code: 400, message: '参数不完整，需要 channel、remoteProductId、verifyCode', data: null });
      return;
    }

    // 查找渠道
    const otaChannel = await prisma.otaChannel.findFirst({
      where: { name: channel, status: 'active' },
    });
    if (!otaChannel) {
      res.status(400).json({ code: 400, message: `OTA渠道 ${channel} 不存在或已停用`, data: null });
      return;
    }

    // 通过 channel + remoteProductId 查找产品映射
    const mapping = await prisma.otaProductMapping.findFirst({
      where: {
        channelId: otaChannel.id,
        remoteProductId,
        status: 'active',
      },
    });
    if (!mapping) {
      // 记录失败的核销日志
      await prisma.otaSyncLog.create({
        data: {
          channelId: otaChannel.id,
          action: 'verify',
          localStatus: 'failed',
          remoteStatus: 'unknown',
        },
      });

      res.status(404).json({ code: 404, message: '产品映射不存在，请先配置映射关系', data: null });
      return;
    }

    // 创建核销日志
    const syncLog = await prisma.otaSyncLog.create({
      data: {
        channelId: otaChannel.id,
        action: 'verify',
        localStatus: 'verified',
        remoteStatus: 'pending',
      },
    });

    res.json({
      code: 0,
      message: '核销成功',
      data: {
        success: true,
        localTicketId: mapping.localTicketId,
        message: `已映射到本地票种 ID: ${mapping.localTicketId}`,
        syncLogId: syncLog.id,
      },
    });
  } catch (err) {
    next(err);
  }
}
