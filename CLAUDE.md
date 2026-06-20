# CLAUDE.md — Lumina

Project guide for coding agents. Read this before touching code.

> Lumina was prototyped under the name **Knowledgeflow** in Claude Design. The product name is **Lumina**; the prototype files still say "Knowledgeflow" — rebrand strings as you port them.

---

## 1. What Lumina is

**A language-learning app delivered as a personalized world-news reader.** You learn a language by reading short, real articles about the *field you care about*, and the difficulty climbs as you improve.

**Twin goals, tracked as two separate ladders** (see §7):
- a **language** ladder (CEFR A1 → C2), and
- a **field-depth** ladder (Intro → Professional), per field.

Each daily article **alternates its focus** — one pushes your language, the next pushes your field knowledge — so both ladders climb over time. **English first; more languages later.** Articles are **5- or 15-minute** reads.

The loop the user sees (from the prototype):
1. **Onboarding** — register → pick language + 3–5 fields → set starting level.
2. **Today** — **Read** (timer-gated, highlight + vocab support) → **Quiz** (feeds progress, not graded) → **Choose** the next sub-field branch.
3. **Trail** — history as a linear timeline + a draggable **knowledge graph** (fields → sub-fields).
4. **Notes** — saved highlights & vocabulary.
5. **Social** — leaderboard, badges, compare trails.
6. **Profile** — dual-ladder progress, stats, settings (language, reminder, theme).
7. **Spaced repetition** — resurfaces articles *and vocabulary* later.

---

## 2. The two-tier architecture (the spine)

Lumina is **two-sided**. The expensive shared work happens once on the server; the cheap per-user work happens on the phone.

**Server — "the finding" (your infrastructure):**
1. **Ingest** from legal sources — news APIs (NewsAPI, NewsData, GDELT), RSS/Atom feeds, open data. Scheduled.
2. **Research agent** (AI) clusters items, spots what's *big* in the world, enriches with follow-up research, dedupes, and writes a **neutral synthesized brief** per story — *synthesis, never republished copy* (this is what keeps us legal; see §9).
3. **Classify** each story into **field → sub-field** taxonomy; extract key concepts, entities, and **target vocabulary**; estimate a base difficulty; embed (pgvector).
4. **Store & rank** a fresh **per-field daily library**; know "the best story for field X today" + its branch options.
5. **Serve** baseline articles to clients.

**Client — "the personalizing" (the phone):**
1. Pull today's best baseline article(s) for the user's field(s).
2. **Rewrite** to this user's **language, language level, field level, target reading time, and the article's focus** (language vs field). This is the on-device / BYOK / hosted AI layer.
3. **Scaffold language learning** — glossable vocabulary, comprehension check (the quiz), spaced repetition of words + concepts.
4. **Advance the ladders** from quiz/recall performance; alternate focus.
5. **Branch** into sub-fields; grow the trail/graph.

**Why this split:** the server synthesizes a story *once* (amortized across all users); the client personalizes it *per person*, cheaply and privately, ideally on-device.

---

## 3. Stack (decided)

| Layer | Choice | Why |
|---|---|---|
| Mobile app | **Expo (React Native) + TypeScript** | One codebase iOS+Android; only path to on-device AI; reuses the prototype |
| Navigation | **Expo Router** | Maps to onboarding stack + bottom tabs |
| Styling | **Typed `tokens.ts` + RN `StyleSheet`** (v1) | Ports the prototype's `T` object 1:1, zero config friction. NativeWind deferred — didn't earn its complexity |
| Client state | **Zustand** + persisted store | Replaces the prototype's `localStorage('kf2_state')` |
| Secrets | `expo-secure-store` | BYOK keys never hit the DB or logs |
| Backend data/auth | **Supabase** — Postgres, Auth, RLS, Storage, **pgvector** | Fastest full-stack MVP |
| Server agent | **Node/TS worker** (cron) + Supabase | Ingestion → synthesis → classification → serve |
| Repo | **pnpm workspaces (monorepo)** | Client + server + shared types in parallel |
| AI | Two-tier provider abstraction (§6) | Server (cloud) finds; client (on-device→BYOK→hosted) personalizes |

**Hard constraint:** on-device AI (Apple Foundation Models, Gemini Nano) needs native modules → the app runs as an Expo **dev build / prebuild**, *not* Expo Go. The client's hosted/BYOK paths work in Expo Go; on-device lands when we prebuild.

---

## 4. Repo structure (monorepo target)

```
apps/mobile/            # Expo client (app/ routes, src/ components, ai/, store/, design/)
server/                 # news-agent pipeline: ingest/, research/, classify/, rank/, serve/
supabase/               # migrations (schema + RLS), functions (edge: hosted AI fallback)
packages/shared/        # shared TS types: Story, Article, Field taxonomy, AIProvider, levels
seed/                   # a few hand-made baseline articles per field (unblocks the client)
design-reference/       # COPY of the prototype (kf-v2-*.jsx) — visual source of truth, not shipped
```

> Match the prototype's **visual output**; do not copy its web-inline-style structure — re-express in NativeWind.
> `seed/` lets the client build in parallel before the server's serving API is ready (§8).

---

## 5. Design system (exact values from the prototype)

- **Colors**: bg `#FAF9F7` · card `#FFFFFF` · border `#E5E3DF` · text `#1A1A1A` · textSec `#6B6860` · textTer `#9E9C98` · accent `#4A7C6F` · accentLight `#E6F0EE`
- **Accent themes** (user-switchable): Forest `#4A7C6F`/`#E6F0EE` (default) · Slate `#5B7BA8`/`#EAEDF5` · Plum `#8A6BA8`/`#F0EBF7` · Terra `#C96442`/`#F5EDE9`
- **Difficulty colors**: Simple `#5B8A6B` · Medium `#4A7C6F` · Hard `#8A5B5B`
- **Shape**: card radius `12`, small `8`, pills `100`; card border `1.5px`; soft shadow `0 1px 3px rgba(0,0,0,0.06)`
- **Type**: **Inter** (300/400/500/600 + italic); body 16/18/20 (user-set); reading width 580/680/780; tight heading tracking (`-0.03em`…`-0.04em`)
- **Fields** (12 seed topics w/ emoji+color) and the **logo** mark are defined in `design-reference/kf-v2-shared.jsx` — port verbatim into `packages/shared` + `apps/mobile/src/design`.

---

## 6. AI layers

Two distinct uses of AI. Keep them separate.

### 6a. Server AI — discovery & synthesis (cloud, your keys)
- Runs in `server/`. Uses a cloud model (default **Claude**) with tool use (fetch/search) to: cluster raw items, score importance, **synthesize** a neutral brief, classify into field/sub-field, extract concepts + target vocab, write a **baseline article** at a neutral level.
- Prompts are product IP → live in `server/research/prompts/`, versioned.
- Output is normalized to the shared `Story` / `Article` types.

### 6b. Client AI — personalization (on-device → BYOK → hosted)
A single interface; multiple backends; a resolver picks the best available.

```ts
interface PersonalizerProvider {
  id: 'apple' | 'gemini-nano' | 'anthropic' | 'openai' | 'gemini-cloud' | 'hosted';
  isAvailable(): Promise<boolean>;
  personalize(input: {
    baseline: Article;
    language: string;          // e.g. 'en', 'uz', 'es'
    languageLevel: CEFR;       // A1..C2
    fieldLevel: 1|2|3|4|5;     // Intro..Professional
    focus: 'language' | 'field';
    targetMinutes: 5 | 15;
  }): Promise<PersonalizedArticle>;  // rewritten body + glossed vocab + quiz
}
```

**Resolution order** (`resolveProvider()`): user's **BYOK** key → **on-device** model if supported → **hosted fallback** (Supabase Edge Function, rate-limited) so it works with zero setup.

Rules: BYOK keys in `expo-secure-store`, sent only to that vendor, never logged/stored in Postgres. On-device providers are native modules (dev build only) — gate behind capability checks, degrade gracefully. All providers return the same shapes so screens never branch on provider.

---

## 7. Leveling model (dual ladder, alternating focus)

- **Language ladder:** CEFR `A1, A2, B1, B2, C1, C2`, **per language**.
- **Field ladder:** `1 Intro · 2 Beginner · 3 Intermediate · 4 Advanced · 5 Professional`, **per field**.
- Every article has a **`focus`** that **alternates** per session:
  - `focus: 'language'` → hold field depth at the user's current field level; **raise linguistic complexity** (vocabulary, sentence structure).
  - `focus: 'field'` → hold language at the user's current level; **introduce deeper field concepts**.
- **Promotion:** quiz + spaced-recall performance advances the ladder that the article targeted. Store `languageLevelAtRead` / `fieldLevelAtRead` on each read for analytics.
- Personalization (§6b) consumes both levels + focus to rewrite the baseline.

---

## 8. Build approach — two parallel tracks

The client and server advance together (`seed/` keeps the client unblocked):
- **Track A (client)** develops against `seed/` baseline articles + mock data until the server's serving API is live.
- **Track B (server)** builds ingestion → synthesis → classification → ranking → serve.
- **Sync points** wire them: real auth/profiles, then real baseline articles personalized end-to-end (the magic moment). Full plan + status: [ROADMAP.md](ROADMAP.md).

---

## 9. Gotchas

- **Legal sourcing:** never republish source copy. The server **synthesizes** from licensed APIs/RSS and **attributes** sources. "Apple News" has no republishing API and BBC content is copyrighted — synthesis sidesteps this. Keep a `terms_ok` flag per source.
- **Expo Go vs dev build:** client hosted/BYOK paths run in Expo Go; on-device AI forces a prebuild/EAS dev build. Don't wire native modules before then.
- **Latency:** server synthesis and client personalization both take seconds. Pre-generate: synthesize stories on a schedule server-side; pre-personalize tomorrow's article after the user picks a branch.
- **Multi-language:** design every string + article shape language-aware from day one, even while only English ships. Don't hardcode English copy in components.
- **Bleeding-edge stack:** scaffold is Expo **SDK 56 / RN 0.85 / React 19**. Its `apps/mobile/AGENTS.md` warns APIs changed — verify against https://docs.expo.dev/versions/v56.0.0/ before writing. The default tab bar uses the new `NativeTabs` (`expo-router/unstable-native-tabs`, PNG template icons); we replace it with a custom `Tabs` bar to match the prototype's SVG nav. Path alias `@/` → `apps/mobile/src/`.
- **Text-selection highlight & graph pan** have no direct RN equivalents — re-implement with a selectable-text lib and `react-native-gesture-handler` + `react-native-svg`. Treat each as a small spike.

---

## 10. Conventions

- **TypeScript strict**; no `any` in committed code. Shared types live in `packages/shared`.
- **Port primitives** from the prototype: `KFBtn`→`Button`, `KFCard`→`Card`, `KFPill`→`Pill`, `KFInput`→`Input`, `KFLogo`→`Logo`, `KFHeader`→`Header`, `KFDivider`→`Divider` (keep variants `primary`/`ghost`/`soft`/`danger`, sizes `sm`/`md`).
- **No web-only APIs** in the client (`window`, `document`, `localStorage`, `getSelection`).
- **Styling** via `src/design/tokens.ts` + RN `StyleSheet`/inline styles (mirrors the prototype's `T`). No hardcoded hex in screens — import from tokens.
- Follow the user's global rules: **minimal working implementation first, surgical changes, simplicity over cleverness, ask one question when a goal is unclear.**

---

## 11. Where to look
- Build plan & phase status: [ROADMAP.md](ROADMAP.md)
- Visual source of truth: `design-reference/` (copy of the handoff `kf-v2-*.jsx`)
