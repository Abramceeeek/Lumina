// Supabase Edge Function: personalize an article server-side with the project's
// own Claude key, so app users don't each need to paste one.
//
// Deploy:  supabase functions deploy personalize
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Auth:    verify_jwt is on by default, so only signed-in users can call it.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'claude-haiku-4-5-20251001';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { title, body, language, difficulty, targetMinutes } = await req.json();
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return json({ error: 'Server AI key not configured' }, 500);
    }

    const prompt = `You are helping someone learn ${language} by reading about a topic they care about.
Rewrite the article below for a "${difficulty}" reading level, about ${targetMinutes} minutes long.
Keep the meaning and key facts; adjust vocabulary and sentence complexity to the level.
Return ONLY the rewritten article as plain paragraphs separated by blank lines — no preamble, no title.

Title: ${title}

${(body ?? []).join('\n\n')}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) return json({ error: `Anthropic ${res.status}` }, 502);

    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '';
    const paras = String(text)
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return json({ body: paras.length ? paras : body, note: `Personalized by Claude (hosted) · ${language} · ${difficulty}` });
  } catch (e) {
    return json({ error: String(e) }, 400);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...cors, 'content-type': 'application/json' } });
}
