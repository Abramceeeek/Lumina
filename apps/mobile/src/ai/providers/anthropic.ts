import type { Personalizer, Generator } from '../types';
import { sanitizeQuiz, sanitizeVocab, sanitizeBranches } from '../sanitize';

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

function extractJson(text: string): Record<string, unknown> | null {
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

// Alternating-focus instruction (CLAUDE.md §7): one ladder is pushed, the other held.
function focusLine(focus?: string, languageLevel?: string, fieldLevel?: number): string {
  if (focus === 'language') {
    return `Focus on LANGUAGE: keep the subject approachable, but deliberately stretch vocabulary and sentence structure toward CEFR ${languageLevel ?? 'A2'}.`;
  }
  if (focus === 'field') {
    return `Focus on FIELD: keep the language simple and familiar, but go deeper into the subject — introduce and explain more specialized concepts (depth ${fieldLevel ?? 2} of 5).`;
  }
  return '';
}

// BYOK Claude — the user's own key, sent only to Anthropic (CLAUDE.md §6).
export function anthropicPersonalizer(apiKey: string): Personalizer {
  return {
    id: 'anthropic',
    async personalize({ title, body, language, difficulty, targetMinutes, languageLevel, fieldLevel, focus }) {
      const prompt = `You are helping someone learn ${language} by reading about a topic they care about.
Rewrite the article below for a "${difficulty}" reading level, about ${targetMinutes} minutes long.
${focusLine(focus, languageLevel, fieldLevel)}
Keep the meaning and key facts; adjust vocabulary and sentence complexity to the level.
Return ONLY the rewritten article as plain paragraphs separated by blank lines — no preamble, no title.

Title: ${title}

${body.join('\n\n')}`;
      const text = await callAnthropic(apiKey, prompt);
      const paras = paragraphs(text);
      return { body: paras.length ? paras : body, note: `Personalized by Claude · ${language} · ${difficulty}${focus ? ` · ${focus}` : ''}` };
    },
  };
}

export function anthropicGenerator(apiKey: string): Generator {
  return {
    id: 'anthropic',
    async generate({ topic, difficulty, language, targetMinutes, languageLevel, fieldLevel, focus }) {
      const words = targetMinutes >= 15 ? 900 : 500;
      const prompt = `Write an engaging, factual ~${words}-word article for a ${difficulty}-level ${language} learner about: ${topic}.
${focusLine(focus, languageLevel, fieldLevel)}
Adjust vocabulary and sentence complexity appropriately. Make it genuinely interesting and self-contained.
Then add learning scaffolding drawn from THIS article.
Respond with ONLY a JSON object (no markdown fences, no preamble):
{"title": string, "body": string[], "vocabulary": [{"word": string, "definition": string}], "quiz": [{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number},{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number},{"type":"open","q":string,"placeholder":string}], "branches": [{"title":string,"description":string}]}
"vocabulary": 4-6 key terms from the article. "quiz": exactly two multiple-choice then one open reflection; "correct" is the 0-based index of the right option. "branches": 4-5 related next topics to explore.`;
      const text = await callAnthropic(apiKey, prompt, 2800);
      const obj = extractJson(text);
      if (obj && Array.isArray(obj.body) && obj.body.length) {
        return {
          title: String(obj.title ?? topic),
          topic,
          body: obj.body.map(String),
          quiz: sanitizeQuiz(obj.quiz),
          vocabulary: sanitizeVocab(obj.vocabulary),
          branches: sanitizeBranches(obj.branches),
        };
      }
      const paras = paragraphs(text);
      return { title: topic, topic, body: paras.length ? paras : [text] };
    },
  };
}
