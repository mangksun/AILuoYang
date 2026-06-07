import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, apiConfigJson, status } = req.body;

    const channel = await prisma.otaChannel.create({
      data: {
        name,
        apiConfigJson: apiConfigJson ? JSON.stringify(apiConfigJson) : null,
        status: status || 'active',
      },
    });

    res.json({ code: 0, message: '渠道创建成功', data: channel });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, pageSize = 20, status, keyword } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSizeNumber = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNumber - 1) * pageSizeNumber;

    const where: any = {};
    if (status) where.status = status;
    if (keyword) where.name = { contains: String(keyword) };

    const [list, total] = await Promise.all([
      prisma.otaChannel.findMany({
        where,
        skip,
        take: pageSizeNumber,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.otaChannel.count({ where }),
    ]);

    res.json({
      code: 0,
      message: 'success',
      data: { list, total, page: pageNumber, pageSize: pageSizeNumber },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const channel = await prisma.otaChannel.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!channel) {
      res.status(404).json({ code: 404, message: '渠道不存在', data: null });
      return;
    }

    res.json({ code: 0, message: 'success', data: channel });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, apiConfigJson, status } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (apiConfigJson !== undefined) data.apiConfigJson = JSON.stringify(apiConfigJson);
    if (status !== undefined) data.status = status;

    const channel = await prisma.otaChannel.update({
      where: { id: Number(id) },
      data,
    });

    res.json({ code: 0, message: '渠道更新成功', data: channel });
  } catch (err) {
    next(err);
  }
}
