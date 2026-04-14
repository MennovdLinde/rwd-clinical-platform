// Role-based access control middleware
// Validates API key from Authorization header or ?apiKey= query param

import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { researchers, writeAudit } from '../db/store';
import { Researcher } from '../types';

export interface AuthRequest extends Request {
  researcher?: Researcher;
}

export function requireAuth(minAccessLevel: 'read' | 'write' | 'admin' = 'read') {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const apiKey =
      (req.headers.authorization?.replace('Bearer ', '') ?? '') ||
      (req.query.apiKey as string) ||
      '';

    const researcher = researchers.get(apiKey);

    if (!researcher) {
      await writeAudit({
        id: uuid(),
        timestamp: new Date().toISOString(),
        researcherId: 'unknown',
        researcherName: 'unknown',
        action: 'AUTH_FAILED',
        resource: req.path,
        ipAddress: req.ip ?? 'unknown',
        success: false,
        gdprBasis: undefined,
      });
      res.status(401).json({ error: 'Invalid or missing API key' });
      return;
    }

    const levels = { read: 0, write: 1, admin: 2 };
    if (levels[researcher.accessLevel] < levels[minAccessLevel]) {
      res.status(403).json({ error: `Requires ${minAccessLevel} access` });
      return;
    }

    req.researcher = researcher;
    next();
  };
}

export async function audit(
  req: AuthRequest,
  action: string,
  resource: string,
  trialId?: string
): Promise<void> {
  if (!req.researcher) return;
  await writeAudit({
    id: uuid(),
    timestamp: new Date().toISOString(),
    researcherId: req.researcher.id,
    researcherName: req.researcher.name,
    action,
    resource,
    trialId,
    ipAddress: req.ip ?? 'unknown',
    success: true,
    gdprBasis: 'Scientific research (GDPR Art. 89)',
  });
}
