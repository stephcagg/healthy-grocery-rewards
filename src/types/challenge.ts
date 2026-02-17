import type { ProductCategory } from './product';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ProductCategory | 'any';
  type: string;
  targetCount: number;
  targetCategory?: ProductCategory;
  healthScoreThreshold?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  rewardPoints: number;
  emoji: string;
}

export interface ActiveChallenge {
  id: string;
  challenge: Challenge;
  progress: number;
  goal: number;
  startDate: string;
  expiresAt: string;
  completed: boolean;
  pointsAwarded: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji?: string;
  icon?: string;
  category?: 'shopping' | 'health' | 'streak' | 'social' | 'milestone';
  condition: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string | null;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
}
