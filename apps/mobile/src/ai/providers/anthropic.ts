import type { Personalizer } from '../types';

const MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap for per-read rewriting

// BYOK Claude provider. The user's own key, sent only to Anthropic (CLAUDE.md §6).
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

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
      const data = await res.json();
      const text: string = data?.content?.[0]?.text ?? '';
      const paras = text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      return {
        body: paras.length ? paras : body,
        note: `Personalized by Claude · ${language} · ${difficulty}`,
      };
    },
  };
}
