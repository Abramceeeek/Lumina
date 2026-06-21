import type { Personalizer, Generator } from '../types';

const MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap for per-read work

async function callAnthropic(apiKey: string, prompt: string, maxTokens = 1500): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  return data?.content?.[0]?.text ?? '';
}

function extractJson(text: string): { title?: string; body?: string[] } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    return obj && typeof obj === 'object' ? obj : null;
  } catch {
    return null;
  }
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// BYOK Claude — the user's own key, sent only to Anthropic (CLAUDE.md §6).
export function anthropicPersonalizer(apiKey: string): Personalizer {
  return {
    id: 'anthropic',
    async personalize({ title, body, language, difficulty, targetMinutes }) {
      const prompt = `You are helping someone learn ${language} by reading about a topic they care about.
Rewrite the article below for a "${difficulty}" reading level, about ${targetMinutes} minutes long.
Keep the meaning and key facts; adjust vocabulary and sentence complexity to the level.
Return ONLY the rewritten article as plain paragraphs separated by blank lines — no preamble, no title.

Title: ${title}

${body.join('\n\n')}`;
      const text = await callAnthropic(apiKey, prompt);
      const paras = paragraphs(text);
      return { body: paras.length ? paras : body, note: `Personalized by Claude · ${language} · ${difficulty}` };
    },
  };
}

export function anthropicGenerator(apiKey: string): Generator {
  return {
    id: 'anthropic',
    async generate({ topic, difficulty, language, targetMinutes }) {
      const words = targetMinutes >= 15 ? 900 : 500;
      const prompt = `Write an engaging, factual ~${words}-word article for a ${difficulty}-level ${language} learner about: ${topic}.
Adjust vocabulary and sentence complexity to the level. Make it genuinely interesting and self-contained.
Respond with ONLY a JSON object: {"title": string, "body": string[]} where "body" is an array of paragraph strings. No markdown fences, no preamble.`;
      const text = await callAnthropic(apiKey, prompt, 2000);
      const obj = extractJson(text);
      if (obj && Array.isArray(obj.body) && obj.body.length) {
        return { title: String(obj.title ?? topic), topic, body: obj.body.map(String) };
      }
      const paras = paragraphs(text);
      return { title: topic, topic, body: paras.length ? paras : [text] };
    },
  };
}
