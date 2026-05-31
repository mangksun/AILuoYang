import express from 'express';
import dotenv from 'dotenv';
import orderRoutes from './routes/order';
import reconciliationRoutes from './routes/reconciliation';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.ORDER_SVC_PORT || 3002;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-svc', timestamp: new Date().toISOString() });
});

app.use('/api/orders', orderRoutes);
app.use('/api/reconciliation', reconciliationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});

export default app;
