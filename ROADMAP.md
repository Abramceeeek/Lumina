# Lumina — Roadmap

Phased build plan. See [CLAUDE.md](CLAUDE.md) for stack, architecture, tokens, and the leveling model.

**Vision:** learn a language by reading short, personalized, real-world articles about the field you care about — difficulty rising as you improve. A **server agent finds & synthesizes** world news per field; the **phone app personalizes** it to your language, level, and reading time.

**Two parallel tracks** — **A (client)** and **B (server)** — wired together at **sync points (S)**. The client develops against `seed/` baseline articles so it's never blocked on the server.

**Status:** ⬜ not started · 🟡 in progress · ✅ done — *everything is ⬜ today.*

---

## Track A — Mobile client (Expo)

### A0 · Scaffold & design system  ⬜
Monorepo (pnpm) + Expo + TS + Expo Router + NativeWind. Copy prototype → `design-reference/`. `tokens.ts` (colors, type, fields, accent themes). Port primitives (Button/Card/Pill/Input/Logo/Header/Divider). Load Inter. Bottom-tab skeleton with the prototype's SVG icons.
**Verify:** boots in Expo Go; tabs switch; a primitives gallery matches the prototype.

### A1 · Onboarding + Auth  ⬜
Register → choose **language** + 3–5 **fields** → set starting **level**. Supabase Auth (email + Google). Persist to `profiles` + `interests` (incl. `language_level`, `field_levels`, `target_read_time`). → **needs S1**
**Verify:** new user finishes all steps, lands on Today, stays signed in; `profiles` row exists.

### A2 · Today flow (vs `seed/`)  ⬜
Reader (timer-gated, highlight-to-save, glossable vocabulary) → Quiz (2 MC + 1 open) → Choose branch. Today sub-progress bar.
**Verify:** full Read→Quiz→Choose loop on seed content; timer gates; highlight + a vocab word are captured.

### A3 · Trail / Notes / Social / Profile  ⬜
Linear trail + draggable knowledge graph (`react-native-svg` + gestures). Notes (search + filter, vocab). Social (leaderboard, badges). Profile with **dual-ladder progress UI** + settings (language, reminder, theme, AI key entry).
**Verify:** every prototype screen has a pixel-close RN counterpart; theme switching live-updates accent.

### A4 · Client AI personalization  ⬜
`PersonalizerProvider` interface + `resolveProvider()`. BYOK (Anthropic/OpenAI/Gemini) via secure store; **hosted fallback** (Supabase Edge Fn). Rewrite a baseline article to language + level + reading time + focus; loading/streaming states; pre-personalize next on branch pick. → **enables S2**
**Verify:** with no key, hosted fallback personalizes a seed baseline; adding a key switches provider; changing level/language visibly changes the text.

### A5 · On-device AI  ⬜ (dev build)
`expo prebuild`/EAS. Apple Foundation Models (iOS 26+) + Gemini Nano (AICore Android) modules; capability detection; graceful degrade.
**Verify:** on a supported device, an article personalizes fully **offline** on-device.

### A6 · Vocabulary & spaced repetition  ⬜
Per-word vocab store; spaced-recall of words + concepts; "Memory Check" overlay; ladder promotion from recall.
**Verify:** a due check fires a notification and advances the correct ladder.

---

## Track B — Server news-agent

### B0 · Backend foundation  ⬜
Supabase project + migrations + **RLS** for all tables (CLAUDE.md §). Seed the **field/sub-field taxonomy** (12 fields from the prototype). Enable **pgvector**.
**Verify:** schema applies clean; RLS blocks cross-user reads; taxonomy queryable.

### B1 · Ingestion  ⬜
Connectors for licensed sources (NewsAPI / NewsData / GDELT / RSS) into `raw_items` staging. Scheduled cron. `sources.terms_ok` enforced.
**Verify:** a scheduled run pulls fresh items from ≥2 source types into staging.

### B2 · Research & synthesis agent  ⬜
Cluster raw items; score world-importance; AI **synthesizes a neutral brief** per story (no republished copy) with source attribution; dedupe via embeddings.
**Verify:** raw items collapse into deduped `stories` with synthesized briefs + importance scores + citations.

### B3 · Classification & enrichment  ⬜
Tag stories into field → sub-field; extract key concepts, entities, **target vocabulary**; estimate base difficulty; store embeddings.
**Verify:** each story carries ≥1 field tag, concept list, vocab list, and a base difficulty.

### B4 · Baseline articles, ranking & serving API  ⬜
Generate neutral **baseline articles** + branch options; rank **best-per-field-per-day**; expose serving API ("today's best for field X" + branches). → **enables S2**
**Verify:** API returns a ranked baseline article + branches for a given field/day.

### B5 · Scheduling, dedup & monitoring  ⬜
Harden the daily pipeline; dedup windows; failure alerts; basic ops dashboard.
**Verify:** pipeline runs unattended for several days; no dup stories; failures alert.

---

## Sync points

- **S1** (A1 + B0): client auth/profile writes to real Supabase. **Verify:** two devices on one account stay in sync.
- **S2** (A4 + B4): client pulls a **real** baseline article and personalizes it end-to-end. **Verify:** the magic moment — real world news, rewritten to a chosen language + level, in <X s.
- **S3** (A5): on-device personalization works offline on supported hardware.

---

## Phase C — Integration  ⬜
Full loop on real data across multiple fields; branching seeds the next day; dual ladders advance from real performance; English polished end-to-end.
**Verify:** a tester completes several real days; both ladders move; trail/graph grow from real choices.

## Phase D — Beta & expand  ⬜
Add a 2nd & 3rd language; tune leveling; EAS production builds; TestFlight + Play internal testing; crash/analytics.
**Verify:** external testers complete a full day loop in ≥2 languages.

---

## Open questions (revisit)
- Pricing / premium scope (Career paths flagged Premium in the design).
- Which languages after English, and in what order.
- Hosted-fallback rate limits & cost ceiling before requiring BYOK.
- Friend/social backend: real vs seeded demo for MVP.
