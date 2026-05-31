import express from 'express';
import dotenv from 'dotenv';
import ticketTypeRoutes from './routes/ticketType';
import ticketGroupRoutes from './routes/ticketGroup';
import projectRoutes from './routes/project';
import memberCardTypeRoutes from './routes/memberCardType';
import memberCardRoutes from './routes/memberCard';
import { errorHandler } from './middleware/errorHandler';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.TICKET_SVC_PORT || 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ticket-svc', timestamp: new Date().toISOString() });
});

app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/ticket-groups', ticketGroupRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/member-card-types', memberCardTypeRoutes);
app.use('/api/member-cards', memberCardRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Ticket service running on port ${PORT}`);
});

export default app;
