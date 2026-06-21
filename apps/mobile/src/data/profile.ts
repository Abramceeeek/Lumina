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
