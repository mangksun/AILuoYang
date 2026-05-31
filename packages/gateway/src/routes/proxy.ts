import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export function createProxy(serviceName: string, target: string) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const url = `${target}${req.originalUrl}`;

      const headers: Record<string, string> = {
        'Content-Type': req.headers['content-type'] || 'application/json',
      };

      if ((req as any).user) {
        headers['X-User-Id'] = String((req as any).user.userId);
        headers['X-User-Role'] = (req as any).user.role;
        headers['X-Merchant-Id'] = String((req as any).user.merchantId);
      }

      const response = await axios({
        method: req.method as any,
        url,
        headers,
        data: req.body,
        timeout: 10000,
      });

      res.status(response.status).json(response.data);
    } catch (err: any) {
      if (err.response) {
        res.status(err.response.status).json(err.response.data);
      } else {
        console.error(`Proxy error for ${serviceName}:`, err.message);
        res.status(502).json({
          code: 502,
          message: `服务 ${serviceName} 暂时不可用`,
          data: null,
        });
      }
    }
  };
}
