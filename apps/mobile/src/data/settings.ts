import { supabase } from './supabase';

// User settings persisted on the profile row. Reading prefs apply live in the
// reader; cloud-synced so they follow the user across devices.
export type Settings = { language: string; fontSize: number; readWidth: number };

const DEFAULTS: Settings = { language: 'en', fontSize: 18, readWidth: 680 };

export async function getSettings(): Promise<Settings> {
  if (!supabase) return DEFAULTS;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return DEFAULTS;
  const { data } = await supabase
    .from('profiles')
    .select('primary_language, font_size, read_width')
    .eq('id', u.user.id)
    .maybeSingle();
  return {
    language: data?.primary_language ?? DEFAULTS.language,
    fontSize: Number(data?.font_size ?? DEFAULTS.fontSize),
    readWidth: Number(data?.read_width ?? DEFAULTS.readWidth),
  };
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  if (!supabase) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const row: Record<string, unknown> = {};
  if (patch.language !== undefined) row.primary_language = patch.language;
  if (patch.fontSize !== undefined) row.font_size = patch.fontSize;
  if (patch.readWidth !== undefined) row.read_width = patch.readWidth;
  if (Object.keys(row).length) await supabase.from('profiles').update(row).eq('id', u.user.id);
}
