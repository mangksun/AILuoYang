import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface MiniappJwtPayload {
  userId: number;
  userType: 'miniapp';
  openid: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: MiniappJwtPayload;
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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MiniappJwtPayload;
    if (decoded.userType !== 'miniapp') {
      res.status(401).json({ code: 401, message: '令牌类型无效', data: null });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ code: 401, message: '令牌无效或已过期', data: null });
  }
}
