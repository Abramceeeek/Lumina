#!/usr/bin/env node
// Repo invariants — cheap, dependency-free structural checks that CI runs on
// every PR. These guard against drift the type-checker can't see: the field
// taxonomy diverging between the shared package and the DB seed, gaps in the
// migration sequence, and env vars used by code/workflows going undocumented.
//
// Run: node scripts/check-repo.mjs   (exits non-zero on any failure)

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const failures = [];
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  FAIL ${name}\n         ${e.message}`);
  }
};
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// ── 1. Field taxonomy: shared TOPICS ↔ supabase seed must match, 12 fields ────
const sharedIds = [...read('packages/shared/src/constants/fields.ts').matchAll(/\bid:\s*'([a-z-]+)'/g)].map(
  (m) => m[1],
);
const fieldsBlock = read('supabase/seed.sql').split('on conflict')[0];
const seedSlugs = [...fieldsBlock.matchAll(/\(\s*'([a-z-]+)'\s*,\s*'/g)].map((m) => m[1]);

check('shared TOPICS has exactly 12 fields', () =>
  assert(sharedIds.length === 12, `found ${sharedIds.length}: ${sharedIds.join(', ')}`),
);
check('supabase seed defines the same 12 field slugs as shared TOPICS', () => {
  const a = [...sharedIds].sort();
  const b = [...seedSlugs].sort();
  assert(
    a.length === b.length && a.every((x, i) => x === b[i]),
    `shared=[${a.join(',')}] seed=[${b.join(',')}]`,
  );
});

// ── 2. Migrations are sequentially numbered with no gaps ─────────────────────
check('supabase migrations are numbered 0001..N with no gaps', () => {
  const nums = readdirSync(join(ROOT, 'supabase/migrations'))
    .filter((f) => f.endsWith('.sql'))
    .map((f) => Number(f.slice(0, 4)))
    .sort((x, y) => x - y);
  assert(nums.length > 0, 'no migrations found');
  nums.forEach((n, i) =>
    assert(n === i + 1, `expected ${String(i + 1).padStart(4, '0')} but sequence was [${nums.join(', ')}]`),
  );
});

// ── 3. Env vars used by code/workflows are documented in .env.example ────────
const envDocs = [
  { file: 'apps/mobile/.env.example', vars: ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'] },
  { file: 'server/.env.example', vars: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY'] },
];
for (const { file, vars } of envDocs) {
  check(`${file} documents ${vars.join(', ')}`, () => {
    const body = read(file);
    const missing = vars.filter((v) => !body.includes(v));
    assert(missing.length === 0, `missing: ${missing.join(', ')}`);
  });
}

// ── summary ──────────────────────────────────────────────────────────────────
if (failures.length) {
  console.error(`\n${failures.length} repo invariant(s) failed.`);
  process.exit(1);
}
console.log('\nAll repo invariants hold.');
