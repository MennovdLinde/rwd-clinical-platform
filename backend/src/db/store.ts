// In-memory store with Supabase passthrough
// Works fully without Supabase credentials (demo mode)
// Add SUPABASE_URL + SUPABASE_SERVICE_KEY to env for persistence

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Patient, Trial, Researcher, AuditEntry } from '../types';

dotenv.config();

let supabase: SupabaseClient | null = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

export const useSupabase = supabase !== null;

// ─── In-memory stores (used when Supabase not configured) ───────────────────
export const patients = new Map<string, Patient>();
export const trials = new Map<string, Trial>();
export const researchers = new Map<string, Researcher>();
export const auditLog: AuditEntry[] = [];

// ─── Audit log (always written to memory; Supabase when available) ───────────
export async function writeAudit(entry: AuditEntry): Promise<void> {
  auditLog.unshift(entry); // newest first
  if (auditLog.length > 1000) auditLog.pop();

  if (supabase) {
    await supabase.from('audit_log').insert({
      id: entry.id,
      timestamp: entry.timestamp,
      researcher_id: entry.researcherId,
      researcher_name: entry.researcherName,
      action: entry.action,
      resource: entry.resource,
      trial_id: entry.trialId ?? null,
      ip_address: entry.ipAddress,
      success: entry.success,
      gdpr_basis: entry.gdprBasis ?? null,
    });
  }
}

export function getAuditLog(limit = 100): AuditEntry[] {
  return auditLog.slice(0, limit);
}
