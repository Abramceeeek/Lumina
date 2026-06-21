import type { Personalizer } from '../types';
import { supabase } from '@/data/supabase';
import { mockPersonalizer } from './mock';

// Calls the Supabase Edge Function (server-side Claude key) when it's deployed.
// Falls back to the offline demo if the function isn't available yet, so the
// app never breaks while the backend is still being set up.
export function hostedPersonalizer(): Personalizer {
  return {
    id: 'hosted',
    async personalize(input) {
      try {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.functions.invoke('personalize', { body: input });
        if (error) throw error;
        const payload = data as { body?: string[]; note?: string } | null;
        if (payload?.body?.length) {
          return { body: payload.body, note: payload.note ?? 'Personalized (hosted).' };
        }
        throw new Error('Empty response');
      } catch {
        return mockPersonalizer.personalize(input);
      }
    },
  };
}
