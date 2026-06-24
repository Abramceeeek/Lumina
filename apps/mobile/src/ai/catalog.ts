// BYOK provider catalog. Claude is recommended (best quality); the rest have free
// tiers so testing costs nothing. Keys live only in the device keychain.
export type ProviderId = 'anthropic' | 'groq' | 'gemini' | 'openrouter';

export type AiConfig = { provider: ProviderId; key: string; model?: string };

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  defaultModel: string;
  baseUrl?: string; // set for OpenAI-compatible providers (groq, openrouter)
  keyUrl: string; // where to get a key
  free: boolean;
  recommended?: boolean;
  hint: string; // key-format placeholder
};

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'anthropic',
    label: 'Claude',
    defaultModel: 'claude-haiku-4-5-20251001',
    keyUrl: 'console.anthropic.com',
    free: false,
    recommended: true,
    hint: 'sk-ant-…',
  },
  {
    id: 'groq',
    label: 'Groq',
    defaultModel: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyUrl: 'console.groq.com/keys',
    free: true,
    hint: 'gsk_…',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    defaultModel: 'gemini-2.0-flash',
    keyUrl: 'aistudio.google.com/apikey',
    free: true,
    hint: 'AIza…',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyUrl: 'openrouter.ai/keys',
    free: true,
    hint: 'sk-or-…',
  },
];

export function providerInfo(id: ProviderId): ProviderInfo {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}
