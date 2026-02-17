import type { TierLevel, Tier } from '@/types/rewards';

export const TIER_DEFINITIONS: Record<TierLevel, Tier> = {
  bronze: {
    level: 'bronze',
    name: 'Bronze',
    minLifetimePoints: 0,
    pointsMultiplier: 1.0,
    benefits: [
      'Earn base points on healthy purchases',
      'Access to weekly challenges',
      'Basic reward catalog',
    ],
    color: '#CD7F32',
    emoji: '\u{1F949}',
  },
  silver: {
    level: 'silver',
    name: 'Silver',
    minLifetimePoints: 500,
    pointsMultiplier: 1.25,
    benefits: [
      '25% point bonus on all purchases',
      'Exclusive weekly challenges',
      'Early access to new rewards',
      'Monthly health insights',
    ],
    color: '#C0C0C0',
    emoji: '\u{1F948}',
  },
  gold: {
    level: 'gold',
    name: 'Gold',
    minLifetimePoints: 2000,
    pointsMultiplier: 1.5,
    benefits: [
      '50% point bonus on all purchases',
      'Premium challenges with higher rewards',
      'Free recipe box quarterly',
      'Personalized health recommendations',
    ],
    color: '#FFD700',
    emoji: '\u{1F947}',
  },
  platinum: {
    level: 'platinum',
    name: 'Platinum',
    minLifetimePoints: 5000,
    pointsMultiplier: 2.0,
    benefits: [
      'Double points on all purchases',
      'Exclusive platinum-only rewards',
      'Free monthly recipe box',
      'Priority support',
      'Annual health summary report',
    ],
    color: '#E5E4E2',
    emoji: '\u{1F48E}',
  },
};

const TIER_ORDER: TierLevel[] = ['bronze', 'silver', 'gold', 'platinum'];

export function getCurrentTier(lifetimePoints: number): TierLevel {
  let current: TierLevel = 'bronze';
  for (const tier of TIER_ORDER) {
    if (lifetimePoints >= TIER_DEFINITIONS[tier].minLifetimePoints) {
      current = tier;
    }
  }
  return current;
}

export function getProgressToNextTier(lifetimePoints: number): {
  current: TierLevel;
  next: TierLevel | null;
  progress: number;
  pointsNeeded: number;
} {
  const current = getCurrentTier(lifetimePoints);
  const currentIndex = TIER_ORDER.indexOf(current);

  if (currentIndex === TIER_ORDER.length - 1) {
    return { current, next: null, progress: 1, pointsNeeded: 0 };
  }

  const next = TIER_ORDER[currentIndex + 1];
  const currentMin = TIER_DEFINITIONS[current].minLifetimePoints;
  const nextMin = TIER_DEFINITIONS[next].minLifetimePoints;
  const range = nextMin - currentMin;
  const earned = lifetimePoints - currentMin;
  const progress = Math.min(1, Math.max(0, earned / range));
  const pointsNeeded = Math.max(0, nextMin - lifetimePoints);

  return { current, next, progress, pointsNeeded };
}

export function getTierMultiplier(tier: TierLevel): number {
  return TIER_DEFINITIONS[tier].pointsMultiplier;
}

export function getTierByLevel(level: TierLevel): Tier {
  return TIER_DEFINITIONS[level];
}
