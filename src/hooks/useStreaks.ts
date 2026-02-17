import { useCallback } from 'react';
import type { Streak } from '@/types/challenge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { updateStreak, getStreakBonus, createInitialStreak } from '@/lib/streaks';

export function useStreaks() {
  const [streak, setStreak] = useLocalStorage<Streak>('nutribucks-streak', createInitialStreak());

  const recordActivity = useCallback(() => {
    setStreak((prev) => updateStreak(prev, new Date()));
  }, [setStreak]);

  const currentStreakBonus = getStreakBonus(streak);

  return { streak, recordActivity, streakBonus: currentStreakBonus };
}
