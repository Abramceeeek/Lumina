import { useState } from 'react';
import { Register } from './Register';
import { Interests } from './Interests';
import { Difficulty } from './Difficulty';

type Step = 'register' | 'interests' | 'difficulty';

// A1: onboarding flow (UI + local state). Supabase auth + persistence wire in at S1.
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('register');

  if (step === 'register') return <Register onNext={() => setStep('interests')} />;
  if (step === 'interests') return <Interests onNext={() => setStep('difficulty')} />;
  return <Difficulty onNext={onDone} />;
}
