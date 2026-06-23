import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client — bypasses RLS so the pipeline can write the
// server-only Track B tables. This key must NEVER ship in the app or the repo;
// it is provided via env (locally) or a GitHub Actions secret (scheduled runs).
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
}

export const db = createClient(url, serviceKey, { auth: { persistSession: false } });
