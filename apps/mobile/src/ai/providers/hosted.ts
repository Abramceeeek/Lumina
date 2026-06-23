import type { Personalizer, Generator } from '../types';
import { supabase } from '@/data/supabase';
import { sanitizeQuiz, sanitizeVocab, sanitizeBranches } from '../sanitize';
import { mockPersonalizer, mockGenerator } from './mock';

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

export function hostedGenerator(): Generator {
  return {
    id: 'hosted',
    async generate(input) {
      try {
        if (!supabase) throw new Error('Supabase not configured');
        const { data, error } = await supabase.functions.invoke('personalize', { body: { ...input, mode: 'generate' } });
        if (error) throw error;
        const payload = data as
          | { title?: string; body?: string[]; note?: string; quiz?: unknown; vocabulary?: unknown; branches?: unknown }
          | null;
        if (payload?.body?.length) {
          return {
            title: payload.title ?? input.topic,
            topic: input.topic,
            body: payload.body,
            note: payload.note,
            quiz: sanitizeQuiz(payload.quiz),
            vocabulary: sanitizeVocab(payload.vocabulary),
            branches: sanitizeBranches(payload.branches),
          };
        }
        throw new Error('Empty response');
      } catch {
        return mockGenerator.generate(input);
      }
    },
  };
}
