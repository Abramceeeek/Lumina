# Lumina — Roadmap

Phased build plan. See [CLAUDE.md](CLAUDE.md) for stack, architecture, schema, tokens,
and the leveling model; see [STATUS.md](STATUS.md) for the test/QA guide.

**Vision:** learn a language by reading short, personalized, real-world articles about
the field you care about — difficulty rising as you improve. A **server agent finds &
synthesizes** world news per field; the **phone app personalizes** it to your language,
level, and reading time.

**Two parallel tracks** — **A (client)** and **B (server)** — wired together at
**sync points (S)**. The client stays unblocked by generating/mocking articles until
the server exposes a serving API.

**Status:** ⬜ not started · 🟡 in progress/partial · ✅ done. Reflects `main` after ~40 merged PRs.

---

## Where we are today

**Works end-to-end (on generated/mock or hosted AI):** sign up → cloud-persisted
onboarding (fields + starting level) → a daily article about your topic at your level
→ timer-gated read with highlight + glossable vocab → quiz → choose a branch that
seeds tomorrow → Trail/Notes/Social/Profile screens → spaced-repetition "Memory Check"
→ dual ladders advance. Multi-provider BYOK AI (Claude/Groq/Gemini/OpenRouter) with a
hosted Edge-Function fallback and an offline mock. CI (typecheck + tests + web bundle +
repo checks) gates every PR; Android APK and iOS→TestFlight build pipelines exist.

**The one gap that matters most:** the **server pipeline synthesizes real briefs and
writes baseline `articles`, but there is no ranking + HTTP serving API**, so the running
app still *generates* the daily article rather than *pulling* a real server baseline.
Closing that (sync-point **S2**) is the headline next step — see B4.

**Not started:** on-device AI (A5/S3), pipeline hardening/monitoring (B5), a 2nd/3rd
language and external beta (Phase D).

---

## Track A — Mobile client (Expo)

### A0 · Scaffold & design system  ✅
Expo + TS + Expo Router; prototype copied to `design-reference/`; `tokens.ts`
(colors, type, fields, accent themes); primitives (Button/Card/Pill/Input/Logo/Header/
Divider); Inter loaded; **custom `BottomNav`** (not NativeTabs). *(pnpm/NativeWind from
the original plan were dropped: it's npm-per-package + `StyleSheet`.)*

### A1 · Onboarding + Auth  ✅  (+ S1)
Register → choose fields + starting level. Supabase Auth (email/password). Persists to
`profiles` + `user_interests` + `user_field_levels` + `user_language_levels`; cloud and
local modes both work.

### A2 · Today flow  ✅
Reader (timer-gated, highlight-to-save, glossable vocabulary) → Quiz (2 MC + 1 open) →
Choose branch, with a 3-step progress bar. Runs against AI-generated/mock content
(there is no `seed/` dir; the server serving API is still pending — see B4).

### A3 · Trail / Notes / Social / Profile  ✅
All five tabs implemented. Trail: linear timeline + draggable knowledge graph
(`react-native-svg` + gestures). Notes: searchable highlights (cloud-synced). Social:
real leaderboard via `get_leaderboard()` + earned badges. Profile: dual-ladder progress,
settings, AI key entry.

### A4 · Client AI personalization  ✅  (enables S2)
`Personalizer`/`Generator` interfaces + `resolve.ts`. **BYOK** (Anthropic/Groq/Gemini/
OpenRouter) via secure store; **hosted fallback** (Supabase Edge Function); **offline
mock**. Rewrites to language + level + reading time + focus.

### A5 · On-device AI  ⬜  (dev build)
`expo prebuild`/EAS. Apple Foundation Models (iOS 26+) + Gemini Nano (Android) modules;
capability detection; graceful degrade. Not started (needs a prebuild; see CLAUDE.md §3/§13).

### A6 · Vocabulary & spaced repetition  ✅
Per-article recall schedule (`spaced_rep.stage`: 1d→3d→7d→30d); "Memory Check" overlay;
recall performance feeds ladder promotion.

---

## Track B — Server news-agent

### B0 · Backend foundation  ✅
Supabase + 8 migrations + **RLS on all 19 tables**; 12-field taxonomy + finance
sub-fields seeded; pgvector extension enabled.

### B1 · Ingestion  🟡
`ingest.ts` pulls headlines from **GDELT only** into `raw_items` (deduped by URL),
scheduled daily by `ingest.yml`. **Remaining:** NewsAPI/NewsData/RSS connectors;
enforce `sources.terms_ok`.

### B2 · Research & synthesis agent  🟡
`synthesize.ts` writes one Claude neutral brief per field per day into `stories` (+
attribution/concepts/vocab). **Remaining:** cross-item clustering, world-importance
ranking, embedding-based dedup (the `stories.embedding` column is unused).

### B3 · Classification & enrichment  🟡
Concepts + target vocabulary are extracted during synthesis. **Remaining:** sub-field
tagging, base-difficulty estimation, populating embeddings.

### B4 · Baseline articles, ranking & serving API  🟡  (enables S2)
`baseline.ts` turns each story into an `articles` row with a generated quiz + branches.
**Remaining (the S2 blocker):** "best-per-field-per-day" ranking and an **HTTP serving
API** the client pulls from.

### B5 · Scheduling, dedup & monitoring  ⬜
Harden the daily pipeline: dedup windows, failure alerts, an ops view. Only the naive
daily cron exists today.

---

## Sync points

- **S1** (A1 + B0) ✅ — client auth/profile writes to real Supabase; two devices on one account stay in sync.
- **S2** (A4 + B4) 🟡 — client *can* personalize a baseline, but no serving/ranking API means it isn't wired into the daily loop yet. **This is the priority.**
- **S3** (A5) ⬜ — on-device personalization works offline on supported hardware.

---

## Phase C — Integration  🟡
Full loop works on generated/mock data (branching seeds the next day; dual ladders
advance; trail/graph grow from real choices). **Remaining:** run the same loop on **real
server-synthesized data** across multiple fields once B4's serving API lands.

## Phase D — Beta & expand  ⬜
Add a 2nd & 3rd language; tune leveling; crash/analytics. *(Build/release plumbing —
EAS, Android APK, iOS→TestFlight via Fastlane — already exists; external testing does not.)*

---

## CI/CD & infra  ✅  *(not in the original roadmap, shipped anyway)*
`ci.yml` gates every PR (app/server/shared typecheck + tests + web bundle + repo-invariants
+ actionlint + edge-fn `deno check`; advisory `npm audit`). Manual `build-apk.yml` and
`ios-testflight.yml`; scheduled `ingest.yml`. Branch protection requires the deterministic checks.

---

## Next up (priority order)
1. **B4 → S2:** ranking + a serving API, and have the client pull a real baseline into the daily loop (the "magic moment").
2. **B2/B3 depth:** clustering + importance ranking + embeddings so "today's best story" is actually the best.
3. **B1 breadth:** add RSS/NewsAPI sources and enforce `terms_ok`.
4. **B5:** pipeline monitoring + dedup windows before relying on it unattended.
5. **A5/S3:** on-device AI (requires the prebuild).

## Open questions (revisit)
- Pricing / premium scope (Career paths were flagged Premium in the design).
- Which languages after English, and in what order.
- Hosted-fallback rate limits & cost ceiling before requiring BYOK.
- When to switch the daily loop from client-generated to server-served (S2 cutover).
