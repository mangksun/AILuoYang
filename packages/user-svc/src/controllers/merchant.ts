import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, config, status } = req.body;

    if (!name) {
      res.status(400).json({ code: 400, message: '商户名称不能为空', data: null });
      return;
    }

    const merchant = await prisma.merchant.create({
      data: {
        name,
        configJson: config ? JSON.stringify(config) : null,
        status,
      },
    });

    res.json({
      code: 0,
      message: '商户创建成功',
      data: { ...merchant, configJson: merchant.configJson ? JSON.parse(merchant.configJson) : null },
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const merchants = await prisma.merchant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const data = merchants.map((m: any) => ({
      ...m,
      configJson: m.configJson ? JSON.parse(m.configJson) : null,
    }));

    res.json({ code: 0, message: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { config } = req.body;

    const merchant = await prisma.merchant.update({
      where: { id: Number(id) },
      data: { configJson: config ? JSON.stringify(config) : null },
    });

    res.json({
      code: 0,
      message: '商户配置更新成功',
      data: { ...merchant, configJson: merchant.configJson ? JSON.parse(merchant.configJson) : null },
    });
  } catch (err) {
    next(err);
  }
}
