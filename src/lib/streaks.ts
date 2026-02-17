import type { Streak } from '@/types/challenge';

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { year: d.getUTCFullYear(), week };
}

function areConsecutiveWeeks(
  date1: Date,
  date2: Date
): boolean {
  const w1 = getISOWeek(date1);
  const w2 = getISOWeek(date2);

  // Same year, consecutive weeks
  if (w1.year === w2.year && w2.week - w1.week === 1) {
    return true;
  }

  // Year boundary: last week of w1.year to first week of w2.year
  if (w2.year - w1.year === 1 && w2.week === 1) {
    // Check if w1 was the last week of its year
    const lastDayOfYear = new Date(Date.UTC(w1.year, 11, 31));
    const lastWeek = getISOWeek(lastDayOfYear);
    if (w1.week === lastWeek.week) {
      return true;
    }
  }

  return false;
}

function areSameWeek(date1: Date, date2: Date): boolean {
  const w1 = getISOWeek(date1);
  const w2 = getISOWeek(date2);
  return w1.year === w2.year && w1.week === w2.week;
}

export function createInitialStreak(): Streak {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
  };
}

export function updateStreak(streak: Streak, activityDate: Date): Streak {
  const now = activityDate;

  // If no previous activity, start a new streak
  if (!streak.lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, streak.longestStreak),
      lastActivityDate: now.toISOString(),
      streakStartDate: now.toISOString(),
    };
  }

  const lastActivity = new Date(streak.lastActivityDate);

  // Same week: no change to streak count, just update last activity date
  if (areSameWeek(lastActivity, now)) {
    return {
      ...streak,
      lastActivityDate: now.toISOString(),
    };
  }

  // Consecutive weeks: increment streak
  if (areConsecutiveWeeks(lastActivity, now)) {
    const newStreak = streak.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActivityDate: now.toISOString(),
      streakStartDate: streak.streakStartDate,
    };
  }

  // Missed a week or more: reset streak
  return {
    currentStreak: 1,
    longestStreak: streak.longestStreak,
    lastActivityDate: now.toISOString(),
    streakStartDate: now.toISOString(),
  };
}

export function getStreakBonus(streak: Streak): number {
  // 5% per week of active streak, maximum 50%
  return Math.min(0.5, streak.currentStreak * 0.05);
}

export function isStreakActive(streak: Streak): boolean {
  if (!streak.lastActivityDate) return false;

  const lastActivity = new Date(streak.lastActivityDate);
  const now = new Date();

  // Streak is active if last activity was this week or last week
  return areSameWeek(lastActivity, now) || areConsecutiveWeeks(lastActivity, now);
}
