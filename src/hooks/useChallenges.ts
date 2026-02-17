import { useCallback, useMemo } from 'react';
import type { ActiveChallenge } from '@/types/challenge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateActiveChallenges, isChallengeExpired } from '@/lib/challenges';
import { ALL_CHALLENGES } from '@/data/challenges';

export function useChallenges() {
  const [activeChallenges, setActiveChallenges] = useLocalStorage<ActiveChallenge[]>(
    'nutribucks-challenges',
    [],
  );

  const refreshChallenges = useCallback(() => {
    const fresh = generateActiveChallenges(ALL_CHALLENGES);
    setActiveChallenges(fresh);
    return fresh;
  }, [setActiveChallenges]);

  const validChallenges = useMemo(() => {
    const valid = activeChallenges.filter((c) => !isChallengeExpired(c));
    if (valid.length === 0 && activeChallenges.length === 0) {
      return [];
    }
    return valid;
  }, [activeChallenges]);

  const updateProgress = useCallback(
    (challengeId: string, newProgress: number) => {
      setActiveChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, progress: newProgress, completed: newProgress >= c.goal }
            : c,
        ),
      );
    },
    [setActiveChallenges],
  );

  return {
    activeChallenges: validChallenges,
    refreshChallenges,
    updateProgress,
    setActiveChallenges,
  };
}
