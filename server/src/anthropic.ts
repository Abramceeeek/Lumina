// Server-side Claude call (the research/synthesis model). Uses ANTHROPIC_API_KEY
// from the environment (local .env or a GitHub Actions secret).

const MODEL = 'claude-haiku-4-5-20251001';

export async function callClaude(prompt: string, maxTokens = 1600): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Set ANTHROPIC_API_KEY to run synthesis.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = (await res.json()) as { content?: { text?: string }[] };
  return data?.content?.[0]?.text ?? '';
}

export function extractJson(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]);
    return o && typeof o === 'object' ? o : null;
  } catch {
    return null;
  }
}
