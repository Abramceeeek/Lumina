import type { Personalizer } from './types';
import { getApiKey } from './keyStore';
import { isSupabaseConfigured } from '@/data/supabase';
import { mockPersonalizer } from './providers/mock';
import { anthropicPersonalizer } from './providers/anthropic';
import { hostedPersonalizer } from './providers/hosted';

// Resolution order (CLAUDE.md §6): BYOK key → hosted (server key) → mock demo.
export async function resolvePersonalizer(): Promise<Personalizer> {
  const key = await getApiKey();
  if (key) return anthropicPersonalizer(key);
  if (isSupabaseConfigured) return hostedPersonalizer();
  return mockPersonalizer;
}
