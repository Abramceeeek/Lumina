import { supabase } from './supabase';

// Whether the signed-in user has finished onboarding (interests + difficulty).
export async function getOnboarded(): Promise<boolean> {
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;
  const { data } = await supabase.from('profiles').select('onboarded').eq('id', user.id).single();
  return data?.onboarded ?? false;
}

// Persist chosen interest fields + mark onboarding complete.
export async function completeOnboarding(fieldSlugs: string[]): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  if (fieldSlugs.length) {
    const { data: fields } = await supabase.from('fields').select('id, slug').in('slug', fieldSlugs);
    const rows = (fields ?? []).map((f) => ({ user_id: user.id, field_id: f.id }));
    if (rows.length) {
      await supabase.from('user_interests').upsert(rows, { onConflict: 'user_id,field_id' });
    }
  }

  await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id);
}

// The user's first chosen interest (a field label like "Finance"), for the daily article.
export async function getPrimaryInterest(): Promise<string | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data: interests } = await supabase.from('user_interests').select('field_id').eq('user_id', user.id).limit(1);
  const fieldId = interests?.[0]?.field_id;
  if (!fieldId) return null;
  const { data: field } = await supabase.from('fields').select('label').eq('id', fieldId).single();
  return field?.label ?? null;
}
