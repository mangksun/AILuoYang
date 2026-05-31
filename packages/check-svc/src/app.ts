import express from 'express';
import dotenv from 'dotenv';
import checkRoutes from './routes/check';
import checkRecordRoutes from './routes/checkRecord';
import verificationRoutes from './routes/verification';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.CHECK_SVC_PORT || 3004;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'check-svc', timestamp: new Date().toISOString() });
});

app.use('/api/check', checkRoutes);
app.use('/api/check-records', checkRecordRoutes);
app.use('/api/verifications', verificationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Check service running on port ${PORT}`);
});

export default app;
