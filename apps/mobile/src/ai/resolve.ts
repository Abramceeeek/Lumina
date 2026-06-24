import type { Personalizer, Generator } from './types';
import { getAiConfig } from './keyStore';
import { createProvider } from './llm';
import { isSupabaseConfigured } from '@/data/supabase';
import { mockPersonalizer, mockGenerator } from './providers/mock';
import { hostedPersonalizer, hostedGenerator } from './providers/hosted';

// Resolution order (CLAUDE.md §6): the user's BYOK provider → hosted (server key)
// → offline mock demo.
export async function resolvePersonalizer(): Promise<Personalizer> {
  const cfg = await getAiConfig();
  if (cfg) return createProvider(cfg).personalizer;
  if (isSupabaseConfigured) return hostedPersonalizer();
  return mockPersonalizer;
}

export async function resolveGenerator(): Promise<Generator> {
  const cfg = await getAiConfig();
  if (cfg) return createProvider(cfg).generator;
  if (isSupabaseConfigured) return hostedGenerator();
  return mockGenerator;
}
