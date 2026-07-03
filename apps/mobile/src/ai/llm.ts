import { sanitizeQuiz, sanitizeVocab, sanitizeBranches } from './sanitize';
import { providerInfo, type AiConfig } from './catalog';
import type { GenerateInput, Generated, PersonalizeInput, Personalized, Personalizer, Generator } from '@lumina/shared';

// Provider-agnostic core: one set of prompts + parsers, swappable HTTP call. Lets
// Claude / Groq / Gemini / OpenRouter share the exact same generation behaviour.

// ── prompts + parsing ───────────────────────────────────────────────────────

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

function buildPersonalizePrompt(i: PersonalizeInput): string {
  return `You are helping someone learn ${i.language} by reading about a topic they care about.
Rewrite the article below for a "${i.difficulty}" reading level, about ${i.targetMinutes} minutes long.
${focusLine(i.focus, i.languageLevel, i.fieldLevel)}
Keep the meaning and key facts; adjust vocabulary and sentence complexity to the level.
Return ONLY the rewritten article as plain paragraphs separated by blank lines — no preamble, no title.

Title: ${i.title}

${i.body.join('\n\n')}`;
}

function buildGeneratePrompt(i: GenerateInput): string {
  const words = i.targetMinutes >= 15 ? 900 : 500;
  return `Write an engaging, factual ~${words}-word article for a ${i.difficulty}-level ${i.language} learner about: ${i.topic}.
${focusLine(i.focus, i.languageLevel, i.fieldLevel)}
Adjust vocabulary and sentence complexity appropriately. Make it genuinely interesting and self-contained.
Then add learning scaffolding drawn from THIS article.
Respond with ONLY a JSON object (no markdown fences, no preamble):
{"title": string, "body": string[], "vocabulary": [{"word": string, "definition": string}], "quiz": [{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number,"explanation":string},{"type":"mc","q":string,"opts":[string,string,string,string],"correct":number,"explanation":string},{"type":"open","q":string,"placeholder":string}], "branches": [{"title":string,"description":string}]}
"vocabulary": 4-6 key terms from the article. "quiz": exactly two multiple-choice then one open reflection; "correct" is the 0-based index of the right option; "explanation" is one short sentence saying why the correct option is right (so the reader learns from it). "branches": 4-5 related next topics to explore.`;
}

function parseGenerated(text: string, topic: string): Generated {
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
}

// ── per-provider HTTP calls ─────────────────────────────────────────────────

type LlmCall = (prompt: string, maxTokens: number) => Promise<string>;

async function callAnthropic(key: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  return data?.content?.[0]?.text ?? '';
}

// Groq + OpenRouter speak the OpenAI chat-completions shape.
async function callOpenAiCompat(baseUrl: string, key: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`${model} API ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callGemini(key: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function makeCall(cfg: AiConfig, model: string): LlmCall {
  const info = providerInfo(cfg.provider);
  switch (cfg.provider) {
    case 'anthropic':
      return (p, m) => callAnthropic(cfg.key, model, p, m);
    case 'gemini':
      return (p, m) => callGemini(cfg.key, model, p, m);
    default: // groq, openrouter — OpenAI-compatible
      return (p, m) => callOpenAiCompat(info.baseUrl!, cfg.key, model, p, m);
  }
}

// Validate a BYOK key/model with a tiny request. Resolves if the provider accepts
// the credentials; throws (with the provider's HTTP error) otherwise. Used by the
// Profile "Test key" button so users learn a key is bad before relying on it.
export async function testProviderKey(cfg: AiConfig): Promise<void> {
  const info = providerInfo(cfg.provider);
  const model = (cfg.model && cfg.model.trim()) || info.defaultModel;
  const call = makeCall(cfg, model);
  await call('Reply with the single word OK.', 8);
}

// ── factory ─────────────────────────────────────────────────────────────────

export function createProvider(cfg: AiConfig): { personalizer: Personalizer; generator: Generator } {
  const info = providerInfo(cfg.provider);
  const model = (cfg.model && cfg.model.trim()) || info.defaultModel;
  const call = makeCall(cfg, model);
  return {
    personalizer: {
      id: cfg.provider,
      async personalize(input) {
        const text = await call(buildPersonalizePrompt(input), 1500);
        const paras = paragraphs(text);
        return {
          body: paras.length ? paras : input.body,
          note: `Personalized by ${info.label} · ${input.language} · ${input.difficulty}${input.focus ? ` · ${input.focus}` : ''}`,
        };
      },
    },
    generator: {
      id: cfg.provider,
      async generate(input) {
        const text = await call(buildGeneratePrompt(input), 2800);
        return parseGenerated(text, input.topic);
      },
    },
  };
}
