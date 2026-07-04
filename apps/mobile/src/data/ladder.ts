import { supabase } from './supabase';
import {
  type Cefr,
  type FieldLevel,
  type Focus,
  flipFocus,
  nextCefr,
  nextFieldLevel,
} from '@lumina/shared';

// Dual-ladder state (CLAUDE.md §7), read/advanced against Supabase. All functions
// degrade to sensible defaults / no-ops in local mode or when signed out.

const LANG = 'en';

// The user's current CEFR + field level for a given field (for personalization).
export async function getFieldLevels(fieldId: string): Promise<{ cefr: Cefr; fieldLevel: FieldLevel }> {
  const fallback = { cefr: 'A1' as Cefr, fieldLevel: 1 as FieldLevel };
  if (!supabase) return fallback;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return fallback;
  const uid = u.user.id;
  const [lang, field] = await Promise.all([
    supabase.from('user_language_levels').select('cefr').eq('user_id', uid).eq('language', LANG).maybeSingle(),
    supabase.from('user_field_levels').select('level').eq('user_id', uid).eq('field_id', fieldId).maybeSingle(),
  ]);
  return {
    cefr: (lang.data?.cefr as Cefr) ?? 'A1',
    fieldLevel: ((field.data?.level as FieldLevel) ?? 1),
  };
}

// Compute the next article's focus (alternating) and persist it as last_focus.
export async function nextFocus(): Promise<Focus> {
  if (!supabase) return 'language';
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return 'language';
  const uid = u.user.id;
  const { data } = await supabase.from('profiles').select('last_focus').eq('id', uid).maybeSingle();
  const next = flipFocus((data?.last_focus as Focus) ?? 'field');
  await supabase.from('profiles').update({ last_focus: next }).eq('id', uid);
  return next;
}

// What a passing quiz advanced (for the level-up toast). null = no change.
export type LadderUp =
  | { kind: 'language'; from: Cefr; to: Cefr }
  | { kind: 'field'; from: FieldLevel; to: FieldLevel };
// A pass that counted toward the next rung but didn't promote yet.
export type LadderProgress = { kind: 'progress'; passes: number; needed: number; next: string };
export type LadderResult = LadderUp | LadderProgress;

// One perfect 2-question quiz is too noisy to jump a whole rung (~25% by guessing);
// each promotion takes this many passing quizzes (migration 0009 stores the count).
const PASSES_PER_RUNG = 3;

// On a passing quiz, count a pass toward the targeted ladder; promote when enough
// passes accumulate. Returns what happened so the UI can show progress or a
// level-up (null when it no-ops / is already at the top).
export async function advanceLadder(opts: { focus: Focus; fieldId?: string | null; passed: boolean }): Promise<LadderResult | null> {
  if (!supabase || !opts.passed) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const uid = u.user.id;

  if (opts.focus === 'language') {
    const { data } = await supabase
      .from('user_language_levels')
      .select('cefr, passes')
      .eq('user_id', uid)
      .eq('language', LANG)
      .maybeSingle();
    const from = (data?.cefr as Cefr) ?? 'A1';
    const to = nextCefr(from);
    if (to === from) return null; // already at C2
    const passes = (Number(data?.passes) || 0) + 1;
    if (passes >= PASSES_PER_RUNG) {
      await supabase.from('user_language_levels').upsert({ user_id: uid, language: LANG, cefr: to, passes: 0 }, { onConflict: 'user_id,language' });
      return { kind: 'language', from, to };
    }
    await supabase.from('user_language_levels').upsert({ user_id: uid, language: LANG, cefr: from, passes }, { onConflict: 'user_id,language' });
    return { kind: 'progress', passes, needed: PASSES_PER_RUNG, next: to };
  } else if (opts.fieldId) {
    const { data } = await supabase
      .from('user_field_levels')
      .select('level, passes')
      .eq('user_id', uid)
      .eq('field_id', opts.fieldId)
      .maybeSingle();
    const from = (data?.level as FieldLevel) ?? 1;
    const to = nextFieldLevel(from);
    if (to === from) return null; // already at Professional
    const passes = (Number(data?.passes) || 0) + 1;
    if (passes >= PASSES_PER_RUNG) {
      await supabase.from('user_field_levels').upsert({ user_id: uid, field_id: opts.fieldId, level: to, passes: 0 }, { onConflict: 'user_id,field_id' });
      return { kind: 'field', from, to };
    }
    await supabase.from('user_field_levels').upsert({ user_id: uid, field_id: opts.fieldId, level: from, passes }, { onConflict: 'user_id,field_id' });
    return { kind: 'progress', passes, needed: PASSES_PER_RUNG, next: `field level ${to}` };
  }
  return null;
}

// Both ladders for display in Profile.
export async function getLadders(): Promise<{ cefr: Cefr; fields: { label: string; level: FieldLevel }[] } | null> {
  if (!supabase) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const uid = u.user.id;
  const [lang, levels] = await Promise.all([
    supabase.from('user_language_levels').select('cefr').eq('user_id', uid).eq('language', LANG).maybeSingle(),
    supabase.from('user_field_levels').select('level, fields(label)').eq('user_id', uid),
  ]);
  const fields = (levels.data ?? [])
    .map((r) => ({ label: (r.fields as { label?: string } | null)?.label ?? '', level: r.level as FieldLevel }))
    .filter((f) => f.label);
  return { cefr: (lang.data?.cefr as Cefr) ?? 'A1', fields };
}
