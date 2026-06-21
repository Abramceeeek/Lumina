# Lumina — Status & Test Guide

_Last updated: 2026-06-21 · `main` @ #15 · 15 PRs merged_

Lumina is a **mobile language-learning app**: it gives you one short, AI-written
article a day about a topic you chose, at your reading level, then lets you
branch into what you read next. You learn a language (and a field) by reading
real content you care about.

---

## 1. What we built (the journey)

Everything shipped through pull requests with green checks (typecheck + tests +
web bundle) on every merge.

| PR | What |
|----|------|
| #1 | Bootstrap: Expo app, DB schema, PR/CI system, design tokens |
| #2 | **A0** — design system + app shell (5-tab nav) |
| #3 | **A1** — onboarding (register → interests → difficulty) |
| #4 | **A2** — Today flow (read → quiz → choose) |
| #5 | **A3** — Trail (timeline + knowledge graph), Notes, Social, Profile |
| #6 | Persistence (Zustand + AsyncStorage) + Supabase client scaffold |
| #7 | Hardening: fixed 23 findings from a 39-agent adversarial review |
| #8 | Difficulty switcher + extracted/tested quiz scoring |
| #9 | **A4** — client AI personalization (mock + bring-your-own Claude key) |
| #10 | **S1** — real Supabase auth + cloud-saved onboarding |
| #11 | EAS build config (standalone installs) |
| #12 | Hosted AI (Supabase Edge Function) |
| #13 | **AI-generated daily article** from your topic |
| #14 | Cloud-synced highlights (cross-device) |
| #15 | **Connected the daily loop** (your choice seeds tomorrow) |

---

## 2. Architecture

### Stack
- **App:** Expo SDK 56, React Native 0.85, React 19, TypeScript (strict).
- **Navigation:** Expo Router hosts one root route; inside it a small state
  machine swaps screens under a custom bottom nav (mirrors the prototype).
- **Styling:** a typed `tokens.ts` + RN `StyleSheet` (no NativeWind) — colors,
  type scale, radii all from one source.
- **State:** Zustand store persisted to **AsyncStorage**; the BYOK API key lives
  in **expo-secure-store** (device keychain).
- **Backend:** Supabase — Auth (email/password), Postgres + Row-Level Security,
  Edge Functions (Deno).
- **AI:** a provider abstraction (below).

### Repo layout
```
apps/mobile/            Expo app
  src/
    app/                _layout.tsx (fonts + auth gate), index.tsx (root)
    components/         primitives: Button, Card, Pill, Input, Logo, Header,
                        Divider, BottomNav, DifficultyBadge, icons
    screens/
      auth/             Auth (sign up / log in)
      onboarding/       Interests, Difficulty, Onboarding
      today/            Article, Quiz, Branch, TodayFlow
      Trail / trail/    timeline + draggable knowledge graph
      Notes, Social, Profile
    ai/                 types, resolve, keyStore, providers/{mock,anthropic,hosted}
    data/               supabase, auth, profile, highlights, sample
    store/              useAppStore (Zustand, persisted)
    design/             tokens, typography
    lib/                quiz (pure, tested)
supabase/
  migrations/           0001_init.sql, 0002_rls.sql
  seed.sql              taxonomy (12 fields + finance sub-fields)
  functions/personalize Deno Edge Function (generate + personalize)
BUILD.md                EAS / install instructions
```

### The AI layer (the core)
A single resolution order, used everywhere AI is needed:

> **your own Claude key (Profile) → hosted Edge Function → offline demo**

- `Generator.generate({topic, difficulty, language})` → a fresh article.
- `Personalizer.personalize({article, ...})` → rewrite to a level.
- Providers: **anthropic** (your key, direct), **hosted** (server key via the
  Edge Function), **mock** (works offline, shows an honest demo). Hosted falls
  back to the demo if the function isn't deployed — nothing ever breaks.

### Auth & data flow
- `index.tsx` decides: **Supabase configured?**
  - **Yes (cloud mode):** no session → Auth screen; session but not onboarded →
    onboarding (saved to Supabase); else → the app.
  - **No (local mode):** onboarding persists to the device only. (Keeps the repo
    runnable without keys.)
- A DB trigger creates a `profiles` row on signup. Onboarding writes
  `user_interests` + flips `profiles.onboarded`. Highlights write to `highlights`
  (title/topic packed into `note`, owner-scoped by RLS).

### The daily loop
1. **Today** generates an article about your topic (`nextTopic` from yesterday's
   choice, else your first interest), at your difficulty — cached once per day.
2. **Read** — a finish-timer gates the next step; long-press a paragraph to save
   a highlight (local + cloud).
3. **Quiz** — 2 multiple-choice + 1 reflection, scored.
4. **Choose** — pick the next thread → that becomes tomorrow's topic, and today
   is marked done ("come back tomorrow").

---

## 3. How to test everything

### A. On your phone in ~5 minutes (Expo Go — no build)
1. In Supabase: **Authentication → Sign In / Providers → Email → turn off
   "Confirm email"** (so signup is instant).
2. On your computer (same Wi-Fi as your phone):
   ```
   cd apps/mobile
   npm start
   ```
   Install **Expo Go** on your phone → scan the QR.
3. **Sign up** (any email + 6+ char password). For real generated articles,
   paste a **Claude API key** in **Profile → AI personalization**.

**Walk this checklist:**
- [ ] Sign up → land in onboarding; pick 3–5 interests + a difficulty.
- [ ] Today shows "Writing today's article…", then a real article **about your
      first interest** (with a Claude key) at your level.
- [ ] The reading-timer bar fills; the quiz CTA unlocks only when it's done.
- [ ] Long-press a paragraph → "Highlight saved" → it appears in **Notes**.
- [ ] Quiz scores your multiple-choice answers; finishing → **Choose**.
- [ ] Pick a branch → "Come back tomorrow"; the "done for today" state shows.
- [ ] Tap the **difficulty badge** in the reader to change level.
- [ ] **Sign out** (Profile) and back in → onboarding is remembered (cloud).
- [ ] Highlight on one device, sign in on another → it's there (cloud sync).

### B. Standalone install (no computer running)
Follow **[BUILD.md](BUILD.md)**: `eas login` → Android APK or iOS TestFlight.

### C. Turn on hosted AI (so testers don't paste a key)
```
supabase functions deploy personalize
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```
Then the app personalizes/generates for everyone automatically.

### D. Automated checks (anytime)
```
cd apps/mobile
npx tsc --noEmit          # types
npm test                  # 11 unit tests, 3 suites
npx expo export -p web    # full bundle builds
```

---

## 4. Done vs. next

**Done (a complete MVP):** auth, cloud onboarding, AI-generated daily articles,
the read→quiz→choose loop connected day-to-day, highlights (cloud), all five
tabs, personalization (key/hosted/demo), persistence, build config, 11 tests.

**Post-MVP (not needed to test):**
- Server news-agent (today's articles are AI-generated from your topic — a fine
  MVP substitute).
- On-device AI (Apple/Gemini) — needs a dev build.
- Trail built from real reading history (persist generated articles).
- Daily reminder notifications.
- Real social/leaderboard backend (currently seeded demo data).
- AI-generated branch options that match each article (branches are currently a
  fixed finance set that still seeds tomorrow's topic).

## 5. Key facts
- Repo: github.com/Abramceeeek/Lumina (public). 15 PRs merged on `main`.
- Supabase project wired via `apps/mobile/.env` (gitignored; keys not in repo).
- Bundle id / package: `com.abramceeeek.lumina`.
- CI workflow is written (`.github/workflows/ci.yml`) but **not active** until
  the gh token gains the `workflow` scope (`gh auth refresh -s workflow`).
