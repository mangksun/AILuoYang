import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, channelId, channel, startDate, endDate } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSizeNumber = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNumber - 1) * pageSizeNumber;

    const where: any = {};
    if (channelId) where.channelId = Number(channelId);
    if (channel) where.channel = { name: String(channel) };
    if (startDate || endDate) {
      where.syncedAt = {};
      if (startDate) where.syncedAt.gte = new Date(String(startDate));
      if (endDate) where.syncedAt.lte = new Date(String(endDate));
    }

    const [list, total] = await Promise.all([
      prisma.otaSyncLog.findMany({
        where,
        skip,
        take: pageSizeNumber,
        orderBy: { syncedAt: 'desc' },
        include: { channel: true },
      }),
      prisma.otaSyncLog.count({ where }),
    ]);

    // 统计每个渠道的核销张数
    const stats = await prisma.otaSyncLog.groupBy({
      by: ['channelId'],
      where: {
        ...where,
        action: 'verify',
      },
      _count: { id: true },
    });

    const channelIds = stats.map((s: any) => s.channelId);
    const channels = channelIds.length
      ? await prisma.otaChannel.findMany({ where: { id: { in: channelIds } } })
      : [];
    const channelMap = new Map(channels.map((c: any) => [c.id, c.name]));

    const channelStats = stats.map((s: any) => ({
      channelId: s.channelId,
      channelName: channelMap.get(s.channelId) || 'unknown',
      verifyCount: s._count.id,
    }));

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total,
        page: pageNumber,
        pageSize: pageSizeNumber,
        channelStats,
      },
    });
  } catch (err) {
    next(err);
  }
}
