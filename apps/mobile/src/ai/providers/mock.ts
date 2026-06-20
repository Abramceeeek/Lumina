import type { Personalizer } from '../types';

// Offline default — no key required. Demonstrates the pipeline (and trims for
// shorter reads) without calling a model. Real rewriting needs a BYOK key.
export const mockPersonalizer: Personalizer = {
  id: 'mock',
  async personalize({ body, language, difficulty, targetMinutes }) {
    const trimmed = targetMinutes <= 5 ? body.slice(0, Math.max(3, Math.ceil(body.length * 0.7))) : body;
    return {
      body: trimmed,
      note: `Demo personalization · ${language} · ${difficulty} · ~${targetMinutes} min — add an AI key in Profile for real rewriting.`,
    };
  },
};
