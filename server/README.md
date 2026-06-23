# Lumina server — news pipeline (Track B)

Finds real world news and turns it into neutral, synthesized baseline articles the
client personalizes. **Legal:** we synthesize from permitted sources and attribute
them (`story_sources`); we never republish source copy. Only `sources.terms_ok =
true` rows are synthesized.

Pipeline (built in slices): **ingest** → synthesize → classify → rank → serve.

## Run ingest locally

Prereq: run `supabase/migrations/0007_track_b.sql` in the Supabase SQL editor.

```
cd server
cp .env.example .env      # fill in SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm install
npm run ingest
```

You should see `Ingest complete — fetched N, inserted M` and rows appear in the
`raw_items` table.

## Scheduled runs

`.github/workflows/ingest.yml` runs ingest daily (and on demand). It needs two repo
secrets: `EXPO_PUBLIC_SUPABASE_URL` (already set for the app build) and
`SUPABASE_SERVICE_ROLE_KEY` (add this — Settings → Secrets and variables → Actions).

## Where the service-role key lives

Local `.env` (gitignored) or the `SUPABASE_SERVICE_ROLE_KEY` GitHub Actions secret.
Never in the mobile app, the repo, or `.env.example`.
