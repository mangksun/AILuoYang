import { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== 景点 =====

export async function listAttractions(req: Request, res: Response) {
  const { category } = req.query;
  const where = category ? { category: String(category) } : {};
  const items = await prisma.attraction.findMany({ where, orderBy: { createdAt: 'asc' } });
  res.json({
    success: true,
    data: items.map((item) => ({
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
      facilities: item.facilities ? JSON.parse(item.facilities) : [],
      traffic: item.traffic ? JSON.parse(item.traffic) : null,
      images: item.images ? JSON.parse(item.images) : [],
    })),
  });
}

export async function getAttraction(req: Request, res: Response) {
  const { id } = req.params;
  const item = await prisma.attraction.findUnique({ where: { id } });
  if (!item) {
    res.status(404).json({ success: false, message: '景点不存在' });
    return;
  }
  res.json({
    success: true,
    data: {
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
      facilities: item.facilities ? JSON.parse(item.facilities) : [],
      traffic: item.traffic ? JSON.parse(item.traffic) : null,
      images: item.images ? JSON.parse(item.images) : [],
    },
  });
}

// ===== 美食 =====

export async function listFoods(req: Request, res: Response) {
  const { category } = req.query;
  const where = category ? { category: String(category) } : {};
  const items = await prisma.food.findMany({ where, orderBy: { createdAt: 'asc' } });
  res.json({
    success: true,
    data: items.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    })),
  });
}

export async function getFood(req: Request, res: Response) {
  const { id } = req.params;
  const item = await prisma.food.findUnique({ where: { id } });
  if (!item) {
    res.status(404).json({ success: false, message: '美食不存在' });
    return;
  }
  res.json({
    success: true,
    data: {
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    },
  });
}

// ===== 非遗 =====

export async function listHeritages(req: Request, res: Response) {
  const items = await prisma.heritage.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({
    success: true,
    data: items.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    })),
  });
}

// ===== 天气 =====
// 使用 Open-Meteo 免费API，无需注册
export async function getWeather(req: Request, res: Response) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    res.status(400).json({ success: false, message: '缺少经纬度参数' });
    return;
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=3`;
    const { data } = await axios.get(url, { timeout: 10000 });

    // 映射天气代码到中文描述和图标
    const weatherCodes: Record<number, { label: string; icon: string }> = {
      0: { label: '晴', icon: 'sun' },
      1: { label: '多云', icon: 'cloud' },
      2: { label: '多云', icon: 'cloud' },
      3: { label: '阴', icon: 'cloud' },
      45: { label: '雾', icon: 'cloud' },
      48: { label: '雾凇', icon: 'cloud' },
      51: { label: '小雨', icon: 'rain' },
      53: { label: '中雨', icon: 'rain' },
      55: { label: '大雨', icon: 'rain' },
      61: { label: '小雨', icon: 'rain' },
      63: { label: '中雨', icon: 'rain' },
      65: { label: '大雨', icon: 'rain' },
      71: { label: '小雪', icon: 'rain' },
      73: { label: '中雪', icon: 'rain' },
      75: { label: '大雪', icon: 'rain' },
      95: { label: '雷雨', icon: 'rain' },
    };

    const current = data.current_weather;
    const daily = data.daily;

    const weather = {
      current: {
        temp: `${Math.round(current.temperature)}°C`,
        ...weatherCodes[current.weathercode] || { label: '晴', icon: 'sun' },
      },
      forecast: daily.time.slice(0, 3).map((date: string, idx: number) => {
        const code = daily.weathercode[idx];
        const info = weatherCodes[code] || { label: '晴', icon: 'sun' };
        const max = Math.round(daily.temperature_2m_max[idx]);
        const min = Math.round(daily.temperature_2m_min[idx]);
        const labels = ['今天', '明天', '后天'];
        return {
          date,
          label: labels[idx] || date,
          icon: info.icon,
          temp: `${info.label} ${min}~${max}°C`,
        };
      }),
    };

    res.json({ success: true, data: weather });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '获取天气失败', error: err.message });
  }
}
