import type { Personalizer, Generator } from './types';
import { getApiKey } from './keyStore';
import { isSupabaseConfigured } from '@/data/supabase';
import { mockPersonalizer, mockGenerator } from './providers/mock';
import { anthropicPersonalizer, anthropicGenerator } from './providers/anthropic';
import { hostedPersonalizer, hostedGenerator } from './providers/hosted';

// Resolution order (CLAUDE.md §6): BYOK key → hosted (server key) → mock demo.
export async function resolvePersonalizer(): Promise<Personalizer> {
  const key = await getApiKey();
  if (key) return anthropicPersonalizer(key);
  if (isSupabaseConfigured) return hostedPersonalizer();
  return mockPersonalizer;
}

export async function resolveGenerator(): Promise<Generator> {
  const key = await getApiKey();
  if (key) return anthropicGenerator(key);
  if (isSupabaseConfigured) return hostedGenerator();
  return mockGenerator;
}
