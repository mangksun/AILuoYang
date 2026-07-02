import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import ticketRoutes from './routes/ticket';
import orderRoutes from './routes/order';
import paymentRoutes from './routes/payment';
import cityMapRoutes from './routes/cityMap';
import adminUserRoutes from './routes/adminUser';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.MINIAPP_SVC_PORT || 3006;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'miniapp-svc', timestamp: new Date().toISOString() });
});

app.use('/api/miniapp/auth', authRoutes);
app.use('/api/miniapp/tickets', ticketRoutes);
app.use('/api/miniapp/orders', orderRoutes);
app.use('/api/miniapp/payments', paymentRoutes);
app.use('/api/miniapp/city-map', cityMapRoutes);
app.use('/api/miniapp/admin/users', adminUserRoutes);
app.use('/api/miniapp/upload', uploadRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Miniapp service running on port ${PORT}`);
});

export default app;
