import { Router, Response } from 'express';
import { trials } from '../db/store';
import { generateQualityReport, getAllTrialsReport } from '../services/qualityReport';
import { requireAuth, audit, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/trials
router.get('/', requireAuth('read'), async (req: AuthRequest, res: Response) => {
  await audit(req, 'LIST_TRIALS', 'trials');
  res.json([...trials.values()]);
});

// GET /api/trials/:id
router.get('/:id', requireAuth('read'), async (req: AuthRequest, res: Response) => {
  const trial = trials.get(req.params.id);
  if (!trial) { res.status(404).json({ error: 'Trial not found' }); return; }
  await audit(req, 'READ_TRIAL', `trial:${req.params.id}`, req.params.id);
  res.json(trial);
});

// GET /api/trials/:id/quality
router.get('/:id/quality', requireAuth('read'), async (req: AuthRequest, res: Response) => {
  if (!trials.has(req.params.id)) { res.status(404).json({ error: 'Trial not found' }); return; }
  await audit(req, 'READ_QUALITY_REPORT', `trial:${req.params.id}`, req.params.id);
  res.json(generateQualityReport(req.params.id));
});

// GET /api/trials/quality/all
router.get('/quality/all', requireAuth('read'), async (req: AuthRequest, res: Response) => {
  await audit(req, 'READ_ALL_QUALITY_REPORTS', 'trials');
  res.json(getAllTrialsReport());
});

export default router;
