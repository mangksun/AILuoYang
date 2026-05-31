import express from 'express';
import dotenv from 'dotenv';
import channelRoutes from './routes/channel';
import mappingRoutes from './routes/mapping';
import verifyRoutes from './routes/verify';
import reconciliationRoutes from './routes/reconciliation';
import syncRoutes from './routes/sync';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.OTA_SVC_PORT || 3005;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ota-svc', timestamp: new Date().toISOString() });
});

app.use('/api/ota/channels', channelRoutes);
app.use('/api/ota/mappings', mappingRoutes);
app.use('/api/ota/verify', verifyRoutes);
app.use('/api/ota/reconciliation', reconciliationRoutes);
app.use('/api/ota/sync', syncRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`OTA service running on port ${PORT}`);
});

export default app;
