import { supabase } from './supabase';
import { type Difficulty, difficultyToLevels } from '@lumina/shared';

// Whether the signed-in user has finished onboarding (interests + difficulty).
export async function getOnboarded(): Promise<boolean> {
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;
  const { data } = await supabase.from('profiles').select('onboarded').eq('id', user.id).single();
  return data?.onboarded ?? false;
}

// Persist chosen interest fields, seed both ladders from the comfort choice, and
// mark onboarding complete.
export async function completeOnboarding(fieldSlugs: string[], difficulty: Difficulty = 'Medium'): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const { cefr, fieldLevel } = difficultyToLevels(difficulty);

  if (fieldSlugs.length) {
    const { data: fields } = await supabase.from('fields').select('id, slug').in('slug', fieldSlugs);
    const list = fields ?? [];
    if (list.length) {
      await supabase.from('user_interests').upsert(
        list.map((f) => ({ user_id: user.id, field_id: f.id })),
        { onConflict: 'user_id,field_id' },
      );
      await supabase.from('user_field_levels').upsert(
        list.map((f) => ({ user_id: user.id, field_id: f.id, level: fieldLevel })),
        { onConflict: 'user_id,field_id' },
      );
    }
  }

  await supabase
    .from('user_language_levels')
    .upsert({ user_id: user.id, language: 'en', cefr }, { onConflict: 'user_id,language' });
  await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
}

// The user's first chosen interest field (id + label), for the daily article.
export async function getPrimaryInterestField(): Promise<{ id: string; label: string } | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data: interests } = await supabase.from('user_interests').select('field_id').eq('user_id', user.id).limit(1);
  const fieldId = interests?.[0]?.field_id;
  if (!fieldId) return null;
  const { data: field } = await supabase.from('fields').select('label').eq('id', fieldId).single();
  return { id: fieldId, label: field?.label ?? '' };
}

// The user's first chosen interest label (e.g. "Finance"), for the daily article.
export async function getPrimaryInterest(): Promise<string | null> {
  return (await getPrimaryInterestField())?.label ?? null;
}

// Retention score (0..100), recomputed from spaced-repetition recall performance.
export async function getRetention(): Promise<number> {
  if (!supabase) return 0;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return 0;
  const { data } = await supabase.from('profiles').select('retention_score').eq('id', user.id).maybeSingle();
  return Number(data?.retention_score ?? 0);
}
