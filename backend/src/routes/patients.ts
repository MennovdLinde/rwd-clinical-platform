import { Router, Response } from 'express';
import { patients } from '../db/store';
import { requireAuth, audit, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/patients?trialId=xxx&quality=complete&consent=granted
router.get('/', requireAuth('read'), async (req: AuthRequest, res: Response) => {
  let result = [...patients.values()];

  if (req.query.trialId) result = result.filter((p) => p.trialId === req.query.trialId);
  if (req.query.quality)  result = result.filter((p) => p.dataQuality === req.query.quality);
  if (req.query.consent)  result = result.filter((p) => p.consentStatus === req.query.consent);

  // Never return visits in list view — reduce payload + enforce data minimisation
  const minimised = result.map(({ visits: _v, ...p }) => p);

  await audit(req, 'LIST_PATIENTS', 'patients', req.query.trialId as string);
  res.json(minimised);
});

// GET /api/patients/:id — full record including visits
router.get('/:id', requireAuth('read'), async (req: AuthRequest, res: Response) => {
  const patient = [...patients.values()].find((p) => p.id === req.params.id);
  if (!patient) { res.status(404).json({ error: 'Patient not found' }); return; }
  await audit(req, 'READ_PATIENT', `patient:${req.params.id}`, patient.trialId);
  res.json(patient);
});

// PATCH /api/patients/:id/consent — update consent status (GDPR right to withdraw)
router.patch('/:id/consent', requireAuth('write'), async (req: AuthRequest, res: Response) => {
  const patient = [...patients.values()].find((p) => p.id === req.params.id);
  if (!patient) { res.status(404).json({ error: 'Patient not found' }); return; }

  const { status } = req.body as { status: 'granted' | 'withdrawn' | 'pending' };
  if (!['granted', 'withdrawn', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Invalid consent status' }); return;
  }

  patient.consentStatus = status;
  patients.set(patient.id, patient);

  await audit(req, 'UPDATE_CONSENT', `patient:${req.params.id}`, patient.trialId);
  res.json({ id: patient.id, consentStatus: patient.consentStatus });
});

export default router;
