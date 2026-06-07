import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimit';
import { createProxy } from './routes/proxy';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// 基础中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 限流
app.use(rateLimiter);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway', timestamp: new Date().toISOString() });
});

// 公开路由（无需鉴权）
app.use('/api/auth', createProxy('user-svc', process.env.USER_SVC_URL || 'http://localhost:3003'));
app.use('/api/miniapp', createProxy('miniapp-svc', process.env.MINIAPP_SVC_URL || 'http://localhost:3006'));
app.use('/api/ai/admin', authMiddleware, createProxy('ai-svc', process.env.AI_SVC_URL || 'http://localhost:3010'));
app.use('/api/ai', createProxy('ai-svc', process.env.AI_SVC_URL || 'http://localhost:3010'));

// 需要鉴权的路由
app.use('/api/ticket-types', authMiddleware, createProxy('ticket-svc', process.env.TICKET_SVC_URL || 'http://localhost:3001'));
app.use('/api/ticket-groups', authMiddleware, createProxy('ticket-svc', process.env.TICKET_SVC_URL || 'http://localhost:3001'));
app.use('/api/projects', authMiddleware, createProxy('ticket-svc', process.env.TICKET_SVC_URL || 'http://localhost:3001'));
app.use('/api/member-card-types', authMiddleware, createProxy('ticket-svc', process.env.TICKET_SVC_URL || 'http://localhost:3001'));
app.use('/api/member-cards', authMiddleware, createProxy('ticket-svc', process.env.TICKET_SVC_URL || 'http://localhost:3001'));

app.use('/api/orders', authMiddleware, createProxy('order-svc', process.env.ORDER_SVC_URL || 'http://localhost:3002'));
app.use('/api/reconciliation', authMiddleware, createProxy('order-svc', process.env.ORDER_SVC_URL || 'http://localhost:3002'));
app.use('/api/refunds', authMiddleware, createProxy('order-svc', process.env.ORDER_SVC_URL || 'http://localhost:3002'));

app.use('/api/users', authMiddleware, createProxy('user-svc', process.env.USER_SVC_URL || 'http://localhost:3003'));
app.use('/api/merchants', authMiddleware, createProxy('user-svc', process.env.USER_SVC_URL || 'http://localhost:3003'));

app.use('/api/check', authMiddleware, createProxy('check-svc', process.env.CHECK_SVC_URL || 'http://localhost:3004'));
app.use('/api/check-records', authMiddleware, createProxy('check-svc', process.env.CHECK_SVC_URL || 'http://localhost:3004'));
app.use('/api/verifications', authMiddleware, createProxy('check-svc', process.env.CHECK_SVC_URL || 'http://localhost:3004'));

app.use('/api/ota', authMiddleware, createProxy('ota-svc', process.env.OTA_SVC_URL || 'http://localhost:3005'));

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

export default app;
