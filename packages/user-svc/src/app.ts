import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import merchantRoutes from './routes/merchant';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.USER_SVC_PORT || 3003;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-svc', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

export default app;
