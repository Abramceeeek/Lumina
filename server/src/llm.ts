// Server-side LLM call for synthesis. Prefers ANTHROPIC_API_KEY (Claude, best
// quality); falls back to GROQ_API_KEY (llama-3.3-70b-versatile, free tier) —
// mirrors the hosted personalize edge function's provider order.

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function callModel(prompt: string, maxTokens = 1600): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data?.content?.[0]?.text ?? '';
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({ model: GROQ_MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? '';
  }
  throw new Error('Set ANTHROPIC_API_KEY or GROQ_API_KEY to run synthesis.');
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
