import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, channelId, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    if (channelId) where.channelId = Number(channelId);
    if (startDate || endDate) {
      where.syncedAt = {};
      if (startDate) where.syncedAt.gte = new Date(String(startDate));
      if (endDate) where.syncedAt.lte = new Date(String(endDate));
    }

    const [list, total] = await Promise.all([
      prisma.otaSyncLog.findMany({
        where,
        skip,
        take: Number(pageSize),
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

    // 补充渠道名称
    const channelIds = stats.map((s) => s.channelId);
    const channels = await prisma.otaChannel.findMany({
      where: { id: { in: channelIds } },
    });
    const channelMap = new Map(channels.map((c) => [c.id, c.name]));

    const channelStats = stats.map((s) => ({
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
        page: Number(page),
        pageSize: Number(pageSize),
        channelStats,
      },
    });
  } catch (err) {
    next(err);
  }
}
