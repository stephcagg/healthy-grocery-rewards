import { useCallback } from 'react';
import type { Achievement } from '@/types/challenge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { INITIAL_ACHIEVEMENTS, checkAchievements, getNewlyUnlocked } from '@/lib/achievements';
import type { AchievementStats } from '@/lib/achievements';

export function useAchievements() {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(
    'nutribucks-achievements',
    INITIAL_ACHIEVEMENTS,
  );

  const checkAndUnlock = useCallback(
    (stats: AchievementStats): Achievement[] => {
      const updated = checkAchievements(achievements, stats);
      const newlyUnlocked = getNewlyUnlocked(achievements, updated);
      if (newlyUnlocked.length > 0) {
        setAchievements(updated);
      }
      return newlyUnlocked;
    },
    [achievements, setAchievements],
  );

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;
  const totalCount = achievements.length;

  return { achievements, checkAndUnlock, unlockedCount, totalCount };
}
