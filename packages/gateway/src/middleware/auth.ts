import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: number;
  username: string;
  role: string;
  merchantId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, message: '未提供认证令牌', data: null });
    return;
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || 'default-secret';

  try {
    const payload = jwt.verify(token, secret as jwt.Secret) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ code: 401, message: '令牌无效或已过期', data: null });
  }
}
