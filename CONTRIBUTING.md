# Contributing to Lumina

Solo for now, structured for a team later. See [CLAUDE.md](CLAUDE.md) for architecture and [ROADMAP.md](ROADMAP.md) for the plan.

## Branching — trunk-based

- `main` is **protected**: no direct pushes. Everything lands via a pull request with green CI.
- Branch per change, named by type + roadmap item:
  - `feat/a2-today-reader`
  - `fix/trail-graph-pan`
  - `chore/ci-tweaks`
- Keep branches short-lived and scoped to one thing.

## Commits — Conventional Commits

```
feat(today): gate the reader on a finish-reading timer
fix(auth): persist session across reload
chore(ci): cache npm in CI
docs(readme): add setup steps
```
Types: `feat` `fix` `chore` `docs` `test` `refactor` `perf`.

## Pull requests

1. Open a PR into `main`. Fill the template; link the ROADMAP phase or issue.
2. CI (typecheck + test) must pass.
3. **Squash merge** — one tidy commit per PR. Delete the branch after.
4. Every changed line should trace to the PR's stated goal — no drive-by edits.

## Local dev

```bash
# Mobile app
cd apps/mobile
npm install
npm start            # Expo dev server
npm test             # Jest
npx tsc --noEmit     # typecheck

# Backend (Supabase) — schema lives in supabase/migrations
```

## Rules of the road

- Minimal working implementation first; simplicity over cleverness.
- No secrets in git — API keys go in `expo-secure-store`, never the repo or DB.
- A change isn't done until it's verified (test, screenshot, or run).
