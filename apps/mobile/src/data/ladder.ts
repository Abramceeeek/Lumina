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

// On a passing quiz, advance the ladder the article targeted. Returns the change
// so the UI can show a level-up (or null when it no-ops / is already at the top).
export async function advanceLadder(opts: { focus: Focus; fieldId?: string | null; passed: boolean }): Promise<LadderUp | null> {
  if (!supabase || !opts.passed) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const uid = u.user.id;

  if (opts.focus === 'language') {
    const { data } = await supabase
      .from('user_language_levels')
      .select('cefr')
      .eq('user_id', uid)
      .eq('language', LANG)
      .maybeSingle();
    const from = (data?.cefr as Cefr) ?? 'A1';
    const to = nextCefr(from);
    if (to === from) return null; // already at C2
    await supabase.from('user_language_levels').upsert({ user_id: uid, language: LANG, cefr: to }, { onConflict: 'user_id,language' });
    return { kind: 'language', from, to };
  } else if (opts.fieldId) {
    const { data } = await supabase
      .from('user_field_levels')
      .select('level')
      .eq('user_id', uid)
      .eq('field_id', opts.fieldId)
      .maybeSingle();
    const from = (data?.level as FieldLevel) ?? 1;
    const to = nextFieldLevel(from);
    if (to === from) return null; // already at Professional
    await supabase.from('user_field_levels').upsert({ user_id: uid, field_id: opts.fieldId, level: to }, { onConflict: 'user_id,field_id' });
    return { kind: 'field', from, to };
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
