import * as SecureStore from 'expo-secure-store';
import type { AiConfig } from './catalog';

// BYOK config (provider + key + optional model) lives in the device keychain —
// never the DB, never logs (CLAUDE.md §6). Keys are sent only to that provider.
const CONFIG_KEY = 'lumina_ai_config';
const LEGACY_KEY = 'lumina_anthropic_key'; // pre-multi-provider: a bare Claude key

export async function getAiConfig(): Promise<AiConfig | null> {
  try {
    const raw = await SecureStore.getItemAsync(CONFIG_KEY);
    if (raw) {
      const c = JSON.parse(raw);
      if (c && typeof c.provider === 'string' && typeof c.key === 'string') return c as AiConfig;
    }
    const legacy = await SecureStore.getItemAsync(LEGACY_KEY);
    if (legacy) return { provider: 'anthropic', key: legacy };
  } catch {
    // fall through
  }
  return null;
}

export async function setAiConfig(c: AiConfig): Promise<void> {
  await SecureStore.setItemAsync(CONFIG_KEY, JSON.stringify(c));
}

export async function clearAiConfig(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CONFIG_KEY);
  } catch {
    // ignore
  }
  try {
    await SecureStore.deleteItemAsync(LEGACY_KEY);
  } catch {
    // ignore
  }
}
