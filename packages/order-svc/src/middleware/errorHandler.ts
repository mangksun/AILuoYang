import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Order Service Error:', err.message);
  res.status(500).json({
    code: 500,
    message: err.message || '服务内部错误',
    data: null,
  });
}
