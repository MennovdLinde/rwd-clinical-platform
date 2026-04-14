import { Router, Response } from 'express';
import { getAuditLog } from '../db/store';
import { requireAuth, audit, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/audit — full audit trail (admin/auditor only)
router.get('/', requireAuth('admin'), async (req: AuthRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const log = getAuditLog(limit);
  await audit(req, 'READ_AUDIT_LOG', 'audit');
  res.json(log);
});

export default router;
