# Supabase setup (S1)

The app runs on local sample data until you connect a Supabase project. ~5 minutes.

## 1. Create the project
1. Go to https://supabase.com → **New project** (free tier is fine).
2. Pick a name/region, set a database password, create.

## 2. Apply the schema
In the project's **SQL Editor**, run these in order (contents of this repo):
1. `migrations/0001_init.sql` — tables (taxonomy, profiles, articles, per-user data)
2. `migrations/0002_rls.sql` — row-level security
3. `seed.sql` — the 12 fields + finance sub-fields

(Or, with the Supabase CLI: `supabase db push` after `supabase link`.)

## 3. Wire the client
1. Project **Settings → API** → copy the **Project URL** and the **anon public** key.
2. `cp apps/mobile/.env.example apps/mobile/.env` and paste both values in.
3. Restart the dev server. `isSupabaseConfigured` (src/data/supabase.ts) flips to `true`.

## 4. Auth (Google)
Settings → **Authentication → Providers → Google** → enable and add OAuth credentials
(matches the onboarding "Continue with Google" button).

> The **service_role** key is a server secret — never put it in the app or `.env.example`.
> It belongs only in server-side Edge Functions.

## Hosted AI (optional — so users don't paste their own key)

`functions/personalize/` rewrites articles using the project's own Claude key.

```
supabase functions deploy personalize
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Once deployed, the app uses it automatically. Resolution order: a user's own key
(Profile) → this hosted function → offline demo. Until you deploy it, the app
silently falls back to the demo, so nothing breaks in the meantime.
