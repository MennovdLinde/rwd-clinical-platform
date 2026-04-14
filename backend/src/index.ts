import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import trialsRouter from './routes/trials';
import patientsRouter from './routes/patients';
import auditRouter from './routes/audit';
import { seedData } from './db/seed';
import { useSupabase } from './db/store';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'rwd-clinical-platform',
    persistence: useSupabase ? 'supabase' : 'in-memory',
    gdprCompliant: true,
  });
});

app.use('/api/trials', trialsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/audit', auditRouter);

// Seed mock data on startup
seedData();

app.listen(PORT, () => {
  console.log(`RWD Clinical Platform backend running on http://localhost:${PORT}`);
  console.log(`Persistence: ${useSupabase ? 'Supabase' : 'in-memory (add SUPABASE_URL to persist)'}`);
});
