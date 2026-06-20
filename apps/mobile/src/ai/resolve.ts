import type { Personalizer } from './types';
import { getApiKey } from './keyStore';
import { mockPersonalizer } from './providers/mock';
import { anthropicPersonalizer } from './providers/anthropic';

// Resolution order (CLAUDE.md §6): BYOK key → (on-device, future) → mock fallback.
export async function resolvePersonalizer(): Promise<Personalizer> {
  const key = await getApiKey();
  return key ? anthropicPersonalizer(key) : mockPersonalizer;
}
