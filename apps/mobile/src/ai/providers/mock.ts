import type { Personalizer, Generator } from '../types';

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

export const mockGenerator: Generator = {
  id: 'mock',
  async generate({ topic, difficulty }) {
    return {
      title: topic,
      topic,
      body: [
        `This is a demo article about ${topic}. Lumina would normally generate a fresh ${difficulty}-level article here, written just for you.`,
        `Add your Claude API key in Profile — or deploy the hosted AI function — and each day's reading becomes a real, AI-written piece about the topics you chose.`,
      ],
      note: 'Demo article — add a Claude key (Profile) for real generation.',
    };
  },
};
