# CLAUDE.md — Lumina

Project guide for coding agents. **Read this before touching code.** It documents
what Lumina *is* (product) and how it is *actually built today* (architecture),
and it flags where the vision runs ahead of the code.

> Lumina was prototyped under the name **Knowledgeflow** in Claude Design. The
> product name is **Lumina**; the prototype files still say "Knowledgeflow" —
> rebrand strings as you port them.

**Status legend used throughout:** ✅ built & on `main` · 🟡 partial/stubbed · ⬜ planned, not started.
For phase-level status see [ROADMAP.md](ROADMAP.md); for the test/QA guide see [STATUS.md](STATUS.md).

---

## 1. What Lumina is

**A language-learning app delivered as a personalized world-news reader.** You
learn a language by reading short, real articles about the *field you care about*,
and the difficulty climbs as you improve.

**Twin goals, tracked as two separate ladders** (see §9):
- a **language** ladder (CEFR A1 → C2), and
- a **field-depth** ladder (Intro → Professional), per field.

Each daily article **alternates its focus** — one pushes your language, the next
pushes your field knowledge — so both ladders climb over time. **English first;
more languages later.** Articles are **5- or 15-minute** reads.

The loop the user sees:
1. **Onboarding** — register → pick language + 3–5 fields → set starting level.
2. **Today** — **Read** (timer-gated, highlight + vocab support) → **Quiz** (feeds progress, not graded) → **Choose** the next sub-field branch.
3. **Trail** — history as a linear timeline + a draggable **knowledge graph** (fields → sub-fields).
4. **Notes** — saved highlights & vocabulary.
5. **Social** — leaderboard, badges, compare trails.
6. **Profile** — dual-ladder progress, stats, settings (language, reminder, theme, AI key).
7. **Spaced repetition** — resurfaces articles *and vocabulary* later ("Memory Check").

---

## 2. Repo layout (actual)

This is **NOT** a pnpm workspace. It is three independent npm packages plus infra
dirs. Each package has its own `package.json` + `package-lock.json` and is
installed/tested separately in CI. `@lumina/shared` is linked into the app via a
`file:` dependency, not a workspace protocol.

```
apps/mobile/          Expo (React Native) client — the phone app
  src/
    app/              Expo Router entry: _layout.tsx (fonts + providers), index.tsx (root state machine)
    components/       primitives + nav: Button, Card, Pill, Input, Logo, Header, Divider,
                      BottomNav, DifficultyBadge, MemoryCheckModal, icons
    screens/          auth/, onboarding/, today/ (Article, Quiz, Branch, TodayFlow),
                      trail/ (TrailLinear, TrailGraph) + Trail, Notes, Social, Profile
    ai/               client AI layer: types, resolve, catalog, llm, keyStore, sanitize,
                      providers/{mock,hosted}  (+ __tests__)
    data/             Supabase-backed data + local fallback: supabase, auth, profile,
                      articles, highlights, ladder, quizResponses, settings, social,
                      spacedrep, trail, sample
    lib/              pure, unit-tested domain logic: quiz, streak, badges  (+ __tests__)
    hooks/            useMemoryCheck
    design/           tokens.ts (colors/shape/type), typography.ts  (+ __tests__)
    store/            useAppStore.ts (Zustand, persisted to AsyncStorage)
  app.json, eas.json, metro.config.js, jest.config.js, fastlane/Fastfile, AGENTS.md
server/               Track B news-agent (Node/TS, run via tsx)
  src/                db, anthropic, ingest, synthesize, baseline, run-* CLIs, util (+ __tests__)
supabase/
  migrations/         0001_init … 0008_leaderboard (schema + RLS + functions)
  functions/personalize/  Deno Edge Function (hosted AI fallback)
  seed.sql            taxonomy: 12 fields + finance sub-fields
packages/shared/      @lumina/shared — TS types + constants shared by app + server
  src/                types/{learning,quiz,content,ai}, constants/fields, index
design-reference/     COPY of the prototype (kf-v2-*.jsx + .html) — visual source of truth, not shipped
scripts/              check-repo.mjs (repo-invariants CI check)
.github/workflows/    ci, build-apk, ingest, ios-testflight
ROADMAP.md STATUS.md BUILD.md CONTRIBUTING.md
```

> **There is no `seed/` directory.** Earlier docs referenced one; the client is
> unblocked instead by (a) AI-generating articles on-device/hosted and (b) the
> offline `mock` provider. Real server baselines land via §8 when the serving API exists.

---

## 3. Stack (as built)

| Layer | Choice | Notes |
|---|---|---|
| Mobile app | **Expo SDK 56 · React Native 0.85 · React 19 · TypeScript (strict)** | Bleeding-edge; verify APIs against the versioned docs (see §13) |
| Navigation | **Expo Router** hosts **one** root route (`src/app/index.tsx`); inside it a **custom state machine swaps screens under a hand-built `BottomNav`** | We do **not** use `NativeTabs`. See §5 |
| Styling | **Typed `src/design/tokens.ts` + RN `StyleSheet`/inline** | **NativeWind is not used** (deferred; didn't earn its complexity). No hardcoded hex in screens — import from tokens |
| Client state | **Zustand** store persisted to **AsyncStorage** (`store/useAppStore.ts`, key `lumina-app`) | Replaces the prototype's `localStorage` |
| Secrets | **`expo-secure-store`** (device keychain) | BYOK AI keys only; never in Postgres or logs |
| Backend | **Supabase** — Postgres, Auth (email/password), Row-Level Security, Edge Functions (Deno), **pgvector** | pgvector extension is enabled; `stories.embedding` column exists but is **not yet populated** (🟡) |
| Server agent | **Node/TS worker run with `tsx`** (no build step); Supabase **service-role** client | Scheduled by GitHub Actions (`ingest.yml`), daily 06:00 UTC |
| Repo | **npm, per-package** (app / server / shared) | **Not** pnpm; no root `package.json` / `pnpm-workspace.yaml` |
| AI | Two-tier provider abstraction (§7) | Server (cloud, your key) *finds*; client (BYOK → hosted → mock) *personalizes* |

**Hard constraint (unchanged, ⬜):** true on-device AI (Apple Foundation Models,
Gemini Nano) needs native modules → an Expo **dev build / prebuild**, not Expo Go.
The client's hosted/BYOK paths run in Expo Go; on-device lands when we prebuild.
Note: Expo Go **cannot** run this SDK-56/RN-0.85 app either — use a dev build or the
web bundle / standalone builds (§11) to exercise it.

---

## 4. The two-tier architecture (the spine)

Lumina is **two-sided**: expensive shared work happens once on the server; cheap
per-user work happens on the phone.

**Server — "the finding" (Track B, `server/`):** ingest headlines → synthesize a
neutral brief per field → (planned) classify/enrich → generate a baseline article
→ (planned) rank & serve. See §8 for what is real vs stubbed.

**Client — "the personalizing" (the phone):** pull/generate today's article for the
user's field → **rewrite** it to the user's language, language level, field level,
target reading time, and the article's focus → scaffold learning (glossed vocab,
quiz, spaced repetition) → advance the ladders → branch into sub-fields → grow the trail.

**Why the split:** synthesize a story *once* (amortized across all users); personalize
it *per person*, cheaply and privately, ideally on-device.

**Where the split is today (🟡):** the server pipeline writes baseline `articles`,
and the client *can* personalize any baseline. But there is **no HTTP serving/ranking
API yet**, so in the running app the client mostly **generates** its daily article
(hosted/BYOK/mock) rather than pulling a server baseline. Wiring that pull is
sync-point **S2** (§8, ROADMAP).

---

## 5. Client architecture (deep)

**Root gate — `src/app/index.tsx`.** A single exported component chooses a mode
from whether Supabase env is present (`isSupabaseConfigured`):
- **Cloud mode** (`CloudRoot`): `useSession()` → no session → **Auth**; session but
  `getOnboarded()` false → **Onboarding** (writes to Supabase via `completeOnboarding`);
  else → **MainApp**.
- **Local mode** (`LocalRoot`, no Supabase env): onboarding persists to the Zustand
  store only, so the repo runs with zero keys.

**`MainApp`** holds `useState<TabId>('today')` and renders exactly one screen under
the custom **`BottomNav`** (5 tabs: today / trail / notes / social / profile). The
`MemoryCheck` modal is mounted here at root. **After onboarding, there is no further
Expo Router navigation** — all routing is tab state + in-screen sub-state.

**Today sub-flow — `screens/today/TodayFlow.tsx`** is its own state machine:
`article → quiz → branch → done`, with a 3-step progress bar. A finish-timer gates
the Read→Quiz transition; long-press saves a highlight; the "done" state shows
"come back tomorrow" and seeds `nextTopic` for the next day.

**Store — `store/useAppStore.ts`** (persisted): `onboarded`, `difficulty`,
`fontSize`, `readWidth`, `dailyArticle` (today's cached article incl. quiz/vocab/
branches/focus), `nextTopic`, `completedDate`, `highlights[]`.

**Data layer — `src/data/*`.** `supabase.ts` exports `isSupabaseConfigured` and a
client; every other module (`profile`, `articles`, `highlights`, `ladder`,
`quizResponses`, `spacedrep`, `social`, `settings`, `trail`) reads/writes Supabase
when configured and **degrades gracefully** otherwise. RLS scopes every user row to
`auth.uid()` (§6).

**Pure logic — `src/lib/*`** (unit-tested, no I/O): `quiz` (MC scoring), `streak`,
`badges`. Dual-ladder math lives in `@lumina/shared` (`difficultyToLevels`,
`nextCefr`, `nextFieldLevel`, `flipFocus`, `fieldLevelName`) and is tested from
`src/lib/__tests__/ladder.test.ts`.

---

## 6. Data model (Supabase)

8 migrations (`supabase/migrations/0001_init.sql` … `0008_leaderboard.sql`), 19 tables.
`pgcrypto` + `vector` (pgvector) extensions enabled in `0001`.

**Taxonomy (shared, read-only to clients):** `fields`, `subfields`.
**Profile + dual ladders:** `profiles` (extends `auth.users`; a `handle_new_user`
trigger auto-creates a row on signup; carries `primary_language`,
`target_read_minutes`, `accent`, `read_width`, `font_size`, `onboarded`,
`last_focus`), `user_interests`, `user_field_levels` (1–5), `user_language_levels`
(CEFR per language).
**Content (shared baselines):** `articles` (body jsonb, `base_difficulty`, `focus`,
`est_read_minutes`, `lang`, `is_seed`, `author_id` [null = server baseline], `story_id`,
and enrichment columns `quiz_questions`/`vocabulary`/`branches_text`), `branches`.
**Per-user reading data:** `user_articles` (personalized body + `language_cefr_at_read`/
`field_level_at_read`/`focus` for analytics), `highlights`, `quiz_responses`,
`trail_nodes` (self-referential parent → the knowledge graph), `spaced_rep`
(`stage` indexes a 1d→3d→7d→30d interval ladder, unique per user+article).
**Server-only (Track B):** `sources` (with `terms_ok`), `raw_items`, `stories`
(`synthesis` brief + `importance` + `embedding vector(1536)`), `story_sources`
(attribution), `story_concepts`, `story_vocabulary`.

**RLS model (`0002_rls.sql` + later):**
- Taxonomy + `articles`/`branches`: **SELECT** for any authenticated user; writes only
  by the service role (which bypasses RLS). `articles` additionally allows a user to
  insert/update/delete rows where `author_id = auth.uid()` (their generated articles).
- Every user-scoped table: owner-only CRUD via `user_id = auth.uid()`.
- Server-only tables: **RLS enabled with NO policies** → only the service role can touch them.
- Cross-user reads (leaderboard) go through **`get_leaderboard()`** — a
  `security definer` SQL function (`0008`) that aggregates display name + articles
  read + active days; it is the only cross-user read a client can do.

**Migration map:** `0001` schema+trigger · `0002` RLS · `0003` client-authored
articles (`author_id`) · `0004` `profiles.last_focus` · `0005` article enrichment
columns · `0006` spaced-rep `stage` · `0007` Track B tables + `articles.story_id`
· `0008` `get_leaderboard()`.

---

## 7. AI layers

Two distinct uses of AI. Keep them separate. **On-device providers are not built yet.**

### 7a. Server AI — discovery & synthesis (cloud, your key)
Runs in `server/`, calls **Claude** (`server/src/anthropic.ts`; default model
`claude-haiku-4-5-20251001`). `synthesize.ts` writes an ORIGINAL neutral brief per
field + concepts + target vocab; `baseline.ts` turns a brief into a baseline article
with a generated quiz + branches.
> **Prompts are inline** in `synthesize.ts` / `baseline.ts` (and the edge function),
> **not** in a `server/research/prompts/` directory (that dir does not exist).
> If you version prompts later, that's a real refactor — update this section.

### 7b. Client AI — personalization (BYOK → hosted → mock)
The shared contract (`packages/shared/src/types/ai.ts`) is two interfaces, both with
a free-form `id: string`:

```ts
interface Personalizer { id: string; personalize(input: PersonalizeInput): Promise<Personalized>; }
interface Generator    { id: string; generate(input: GenerateInput): Promise<Generated>; }
// inputs carry: language, difficulty, targetMinutes + LadderContext { languageLevel?, fieldLevel?, focus? }
```

**Resolution order** (`src/ai/resolve.ts`): the user's **BYOK** provider (a config in
`expo-secure-store`) → **hosted** Supabase Edge Function (if Supabase is configured) →
**offline `mock`**. Nothing ever hard-fails.

**BYOK catalog** (`src/ai/catalog.ts`) — providers are **`anthropic | groq | gemini
| openrouter`** (Claude recommended; Groq/Gemini/OpenRouter have free tiers so
testing is free). `src/ai/llm.ts` is the provider-agnostic core (one prompt set,
per-provider HTTP: native Anthropic, Gemini, and OpenAI-compatible for Groq/
OpenRouter). `src/ai/sanitize.ts` coerces model JSON into the shared quiz/vocab/
branch shapes. `src/ai/providers/hosted.ts` calls the edge function; `providers/mock.ts`
returns deterministic offline content for demos/tests.

**Hosted fallback** — `supabase/functions/personalize/index.ts` (Deno) runs generate
*or* personalize with the project's own Claude key (`verify_jwt` on, so only signed-in
users can call it). Deploy: `supabase functions deploy personalize` + `supabase
secrets set ANTHROPIC_API_KEY=…`.

> **Drift from older docs:** CLAUDE.md previously described a `PersonalizerProvider`
> with fixed ids `apple|gemini-nano|anthropic|openai|gemini-cloud|hosted` and an
> `isAvailable()` method. That interface was never built — the code above is the real one.

**Rules:** BYOK keys stay in `expo-secure-store`, are sent only to that vendor, and
are never logged or stored in Postgres. On-device (Apple/Gemini Nano) is future work
(§3, ROADMAP A5) and must be gated behind capability checks that degrade gracefully.

---

## 8. Server pipeline (Track B) & build tracks

Two tracks advance together; the client is never blocked on the server.

**Pipeline (`server/`, run with `tsx`, scheduled by `.github/workflows/ingest.yml`):**
1. **Ingest** (`ingest.ts`, ✅ but GDELT-only) — pulls **headlines + metadata only**
   from GDELT's free DOC 2.0 API, bucketed by field label, deduped by URL into
   `raw_items`. NewsAPI/NewsData/RSS are **not** wired yet. `terms_ok` exists but
   isn't enforced yet.
2. **Synthesize** (`synthesize.ts`, ✅ basic) — one Claude-written neutral brief per
   field per day into `stories` (+ `story_sources`/`story_concepts`/`story_vocabulary`).
   **No** cross-story clustering, importance ranking, or embedding-based dedup yet (🟡).
3. **Classify/enrich** (🟡) — concepts + vocab are extracted during synthesis;
   sub-field tagging, base-difficulty estimation, and embeddings are **not** done.
4. **Baseline** (`baseline.ts`, ✅ basic) — turns each fresh story into an `articles`
   row (`author_id = null`) with a generated quiz + branches.
5. **Rank & serve** (⬜) — **no** "best-per-field-per-day" ranking and **no HTTP
   serving API**. This is the missing piece behind sync-point **S2**.

CLIs: `npm run ingest | synthesize | baseline` (each a `run-*.ts`). Needs
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` (see `server/.env.example`).

**Sync points:** **S1** (client auth/profile ↔ real Supabase) ✅ · **S2** (client
pulls a *real* baseline and personalizes end-to-end) 🟡 · **S3** (on-device offline) ⬜.

---

## 9. Leveling model (dual ladder, alternating focus)

- **Language ladder:** CEFR `A1…C2`, per language (`user_language_levels`).
- **Field ladder:** `1 Intro · 2 Beginner · 3 Intermediate · 4 Advanced · 5 Professional`,
  per field (`user_field_levels`).
- Every article has a **`focus`** that **alternates** per session (`profiles.last_focus`
  flips it; `flipFocus` in shared):
  - `focus: 'language'` → hold field depth; **raise linguistic complexity**.
  - `focus: 'field'` → hold language level; **introduce deeper field concepts**.
- The onboarding comfort choice seeds both ladders (`difficultyToLevels`:
  Simple→A1/1, Medium→B1/2, Hard→C1/3).
- **Promotion:** quiz + spaced-recall performance advances the targeted ladder.
  `user_articles` stores `language_cefr_at_read` / `field_level_at_read` for analytics.
- Personalization (§7b) threads both levels + focus into every rewrite; the
  `focusLine()` helper (mirrored in `llm.ts` and the edge function) encodes the
  "push one ladder, hold the other" instruction.

---

## 10. Design system (exact values from the prototype)

Single source of truth: `apps/mobile/src/design/tokens.ts` (ported from
`design-reference/kf-v2-shared.jsx`). It **re-exports** `TOPICS`, `CEFR`,
`FIELD_LEVELS` and the level/topic types from `@lumina/shared`.

- **Colors**: bg `#FAF9F7` · card `#FFFFFF` · border `#E5E3DF` · text `#1A1A1A` · textSec `#6B6860` · textTer `#9E9C98` · accent `#4A7C6F` · accentLight `#E6F0EE`.
- **Accent themes** (user-switchable): Forest `#4A7C6F`/`#E6F0EE` (default) · Slate `#5B7BA8`/`#EAEDF5` · Plum `#8A6BA8`/`#F0EBF7` · Terra `#C96442`/`#F5EDE9`.
- **Difficulty colors**: Simple `#5B8A6B` · Medium `#4A7C6F` · Hard `#8A5B5B`.
- **Shape**: card radius `12`, small `8`, pill `100`; soft shadow (opacity `0.06`, radius `3`, offset `{0,1}`, elevation `2`).
- **Type**: **Inter** (300/400/500/600, loaded in `_layout.tsx`); body sizes `[16,18,20]`; reading widths `[580,680,780]` — both user-switchable.
- **Fields**: 12 topics with emoji+color in `@lumina/shared` `constants/fields.ts`
  (mirrored by `supabase/seed.sql`; the repo-invariants CI check enforces they stay in sync).
- **Primitives** ported from the prototype: `Button` (variants `primary`/`ghost`/`soft`/`danger`, sizes `sm`/`md`), `Card`, `Pill`, `Input`, `Logo`, `Header`, `Divider`, plus `BottomNav`, `DifficultyBadge`, `MemoryCheckModal`, `icons`.

---

## 11. CI/CD & GitHub

Four workflows in `.github/workflows/`:

- **`ci.yml`** (PRs + pushes to `main`) — jobs:
  - **App · typecheck + tests + web bundle** — `apps/mobile`: `tsc --noEmit`, `jest`, `expo export -p web`.
  - **Server · typecheck + tests** — `server`: `tsc --noEmit`, `node:test` (via `tsx --test`).
  - **Shared · typecheck** — `packages/shared`: `tsc --noEmit`.
  - **Repo · checks** — `scripts/check-repo.mjs` (taxonomy/migration/env invariants),
    **actionlint** (workflow YAML lint; `.github/actionlint.yaml` declares `macos-26`
    as a known runner), and **`deno check`** on the Edge Function.
  - **Deps · audit (advisory)** — `npm audit --audit-level=high` across all three
    packages, `continue-on-error` (never blocks).
- **`build-apk.yml`** (manual) — Expo prebuild + `gradlew assembleRelease` → APK attached to a Release.
- **`ios-testflight.yml`** (manual) — Expo prebuild + CocoaPods + Fastlane **match** signing
  + raw `xcodebuild` archive/export → Fastlane upload to TestFlight. **Runs on `macos-26`
  (Xcode 26 / iOS 26 SDK) — required for Expo SDK 56.** Do not downgrade the runner.
- **`ingest.yml`** (daily 06:00 UTC + manual) — runs the Track B pipeline (ingest → synthesize → baseline) with repo secrets.

**Branch protection on `main`** requires the deterministic `ci.yml` checks
(App, Server, Shared, Repo · checks). The advisory audit job is not required.
When you add/rename a CI job, update the required-status-checks contexts to match,
or PRs will hang waiting on a check that never reports.

**Standalone builds:** see [BUILD.md](BUILD.md) (EAS). Bundle id / package:
`com.abramceeeek.lumina` (`app.json`). Repo secrets used by CI/build are documented
in the workflow headers (Supabase URL/anon key, service-role key, Anthropic key,
App Store Connect API key + team id, Fastlane `MATCH_PASSWORD`).

**Local verification (mirror CI before you push):**
```bash
cd apps/mobile    && npx tsc --noEmit && npm test -- --ci && npx expo export -p web
cd server         && npm run typecheck && npm test
cd packages/shared && npm run typecheck
node scripts/check-repo.mjs
```

---

## 12. Conventions

- **TypeScript strict**; **no `any`** in committed code. Shared types live in
  `packages/shared` and are imported via `@lumina/shared` (path alias `@/` → `apps/mobile/src/`).
- **Port primitives** from the prototype (names in §10); keep variants/sizes.
- **No web-only APIs** in the client (`window`, `document`, `localStorage`, `getSelection`).
- **Styling** via `src/design/tokens.ts` + RN `StyleSheet`/inline. No hardcoded hex in screens.
- **Multi-language from day one**: don't hardcode English copy in components; every
  string + article shape is language-aware even while only English ships.
- Follow the user's global rules: **minimal working implementation first, surgical
  changes, simplicity over cleverness, ask one question when a goal is unclear.**
- **Keep this file honest.** If you change the stack, navigation, AI providers,
  schema, or CI, update the matching section here and in [ROADMAP.md](ROADMAP.md) /
  [STATUS.md](STATUS.md) in the same PR. The repo-invariants check catches taxonomy
  drift but not prose drift — that's on you.

---

## 13. Gotchas

- **Bleeding-edge stack:** Expo **SDK 56 / RN 0.85 / React 19**. `apps/mobile/AGENTS.md`
  warns APIs changed — **verify against https://docs.expo.dev/versions/v56.0.0/ before
  writing.** Expo Go cannot run this SDK; use a dev build, the web bundle, or standalone builds.
- **Server import-time env:** `server/src/db.ts` **throws at import** if
  `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are unset. Keep pure, testable helpers in
  `server/src/util.ts` (no db import) so they can be unit-tested without credentials.
- **Legal sourcing:** never republish source copy. The server **synthesizes** original
  briefs from permitted sources and **attributes** them (`story_sources`); keep
  `sources.terms_ok`. "Apple News" has no republishing API and BBC content is
  copyrighted — synthesis sidesteps this.
- **On-device AI forces a prebuild** (dev build/EAS); don't wire native modules before then.
- **Latency:** synthesis and personalization take seconds. Pre-generate server-side on
  a schedule and pre-personalize the next article after the user picks a branch.
- **pgvector is declared, not used:** `stories.embedding` exists but nothing populates
  it; embedding-based dedup/retrieval is still to build.
- **Text-selection highlight & graph pan** have no direct RN equivalents — implemented
  with long-press + `react-native-gesture-handler`/`react-native-svg`; treat changes as spikes.

---

## 14. Where to look
- Build plan & phase status: [ROADMAP.md](ROADMAP.md)
- Test/QA guide & "how to run everything": [STATUS.md](STATUS.md)
- Standalone build instructions: [BUILD.md](BUILD.md)
- Visual source of truth: `design-reference/` (copy of the handoff `kf-v2-*.jsx`)
