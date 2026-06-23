import { useCallback, useEffect, useState } from 'react';
import { getDueRecall, type DueRecall } from '@/data/spacedrep';

// Checks for a due spaced-repetition recall on mount (i.e. when the app opens).
export function useMemoryCheck() {
  const [due, setDue] = useState<DueRecall | null>(null);
  const check = useCallback(() => {
    getDueRecall().then(setDue);
  }, []);
  useEffect(() => {
    check();
  }, [check]);
  return { due, dismiss: () => setDue(null) };
}
