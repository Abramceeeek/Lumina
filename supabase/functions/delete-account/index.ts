// Supabase Edge Function: permanently delete the calling user's account.
// Every user table cascades from profiles -> auth.users (see migrations), so
// removing the auth user wipes articles, highlights, trail, quiz responses,
// spaced-rep schedules and settings in one operation.
//
// Deploy:  supabase functions deploy delete-account
// Auth:    verify_jwt is on by default, so only signed-in users can call it;
//          the user id comes from the caller's own JWT (no body input).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anonKey || !serviceKey) return json({ error: 'Server not configured' }, 500);

    // Resolve the caller from their own JWT — a user can only delete themselves.
    const asCaller = createClient(url, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data, error } = await asCaller.auth.getUser();
    if (error || !data.user) return json({ error: 'Not signed in' }, 401);

    const admin = createClient(url, serviceKey);
    const { error: delErr } = await admin.auth.admin.deleteUser(data.user.id);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 400);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...cors, 'content-type': 'application/json' } });
}
