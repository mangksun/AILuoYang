import jwt from 'jsonwebtoken';
import { MiniappJwtPayload } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function signMiniappToken(payload: MiniappJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN as any });
}
