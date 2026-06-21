import { useState } from 'react';
import type { Difficulty as Diff } from '@/design/tokens';
import { Interests } from './Interests';
import { Difficulty } from './Difficulty';

// Post-auth onboarding: pick interests, then difficulty. Auth is handled
// upstream (real Supabase auth in cloud mode; skipped in local mode).
export function Onboarding({ onDone }: { onDone: (data: { fields: string[]; difficulty: Diff }) => void }) {
  const [step, setStep] = useState<'interests' | 'difficulty'>('interests');
  const [fields, setFields] = useState<string[]>([]);

  if (step === 'interests') {
    return (
      <Interests
        onNext={(selected) => {
          setFields(selected);
          setStep('difficulty');
        }}
      />
    );
  }
  return <Difficulty onNext={(difficulty) => onDone({ fields, difficulty })} />;
}
