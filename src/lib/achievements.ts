import type { Achievement } from '@/types/challenge';
import type { TierLevel } from '@/types/rewards';
import type { Receipt } from '@/types/receipt';

export interface AchievementStats {
  totalReceipts: number;
  totalItems: number;
  totalPoints: number;
  currentStreak: number;
  linkedStores: number;
  tier: TierLevel;
  receipts: Receipt[];
  uniqueCategories: number;
  healthyItemCount: number;
  lifetimePoints: number;
}

/**
 * All available achievements in the app with their unlock conditions.
 */
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Scan your first grocery receipt',
    icon: 'receipt',
    condition: 'totalReceipts >= 1',
    unlockedAt: null,
  },
  {
    id: 'five_receipts',
    name: 'Regular Shopper',
    description: 'Scan 5 grocery receipts',
    icon: 'shopping-cart',
    condition: 'totalReceipts >= 5',
    unlockedAt: null,
  },
  {
    id: 'twenty_receipts',
    name: 'Dedicated Shopper',
    description: 'Scan 20 grocery receipts',
    icon: 'star',
    condition: 'totalReceipts >= 20',
    unlockedAt: null,
  },
  {
    id: 'fifty_receipts',
    name: 'Shopping Champion',
    description: 'Scan 50 grocery receipts',
    icon: 'trophy',
    condition: 'totalReceipts >= 50',
    unlockedAt: null,
  },
  {
    id: 'hundred_items',
    name: 'Centurion',
    description: 'Purchase 100 healthy items',
    icon: 'package',
    condition: 'totalItems >= 100',
    unlockedAt: null,
  },
  {
    id: 'five_hundred_points',
    name: 'Points Collector',
    description: 'Earn 500 lifetime points',
    icon: 'coins',
    condition: 'lifetimePoints >= 500',
    unlockedAt: null,
  },
  {
    id: 'two_thousand_points',
    name: 'Points Master',
    description: 'Earn 2,000 lifetime points',
    icon: 'gem',
    condition: 'lifetimePoints >= 2000',
    unlockedAt: null,
  },
  {
    id: 'five_thousand_points',
    name: 'Points Legend',
    description: 'Earn 5,000 lifetime points',
    icon: 'crown',
    condition: 'lifetimePoints >= 5000',
    unlockedAt: null,
  },
  {
    id: 'streak_three',
    name: 'On a Roll',
    description: 'Maintain a 3-week shopping streak',
    icon: 'flame',
    condition: 'currentStreak >= 3',
    unlockedAt: null,
  },
  {
    id: 'streak_eight',
    name: 'Unstoppable',
    description: 'Maintain an 8-week shopping streak',
    icon: 'zap',
    condition: 'currentStreak >= 8',
    unlockedAt: null,
  },
  {
    id: 'link_store',
    name: 'Connected',
    description: 'Link your first grocery store',
    icon: 'link',
    condition: 'linkedStores >= 1',
    unlockedAt: null,
  },
  {
    id: 'link_three_stores',
    name: 'Multi-Store Maven',
    description: 'Link 3 different grocery stores',
    icon: 'store',
    condition: 'linkedStores >= 3',
    unlockedAt: null,
  },
  {
    id: 'reach_silver',
    name: 'Silver Status',
    description: 'Reach Silver tier',
    icon: 'award',
    condition: 'tier_silver',
    unlockedAt: null,
  },
  {
    id: 'reach_gold',
    name: 'Gold Status',
    description: 'Reach Gold tier',
    icon: 'award',
    condition: 'tier_gold',
    unlockedAt: null,
  },
  {
    id: 'reach_platinum',
    name: 'Platinum Status',
    description: 'Reach Platinum tier',
    icon: 'award',
    condition: 'tier_platinum',
    unlockedAt: null,
  },
  {
    id: 'variety_five',
    name: 'Variety Seeker',
    description: 'Buy from 5 different product categories in one receipt',
    icon: 'grid',
    condition: 'uniqueCategories >= 5',
    unlockedAt: null,
  },
  {
    id: 'healthy_ten',
    name: 'Health Nut',
    description: 'Buy 10 products with an A health grade',
    icon: 'heart',
    condition: 'healthyItemCount >= 10',
    unlockedAt: null,
  },
  {
    id: 'healthy_fifty',
    name: 'Wellness Warrior',
    description: 'Buy 50 products with an A health grade',
    icon: 'shield',
    condition: 'healthyItemCount >= 50',
    unlockedAt: null,
  },
];

const TIER_RANK: Record<TierLevel, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

/**
 * Evaluate a condition string against the current stats and return whether it is met.
 */
function evaluateCondition(condition: string, stats: AchievementStats): boolean {
  // Tier-based conditions
  if (condition.startsWith('tier_')) {
    const requiredTier = condition.replace('tier_', '') as TierLevel;
    return TIER_RANK[stats.tier] >= TIER_RANK[requiredTier];
  }

  // Numeric comparison conditions: "field >= value"
  const match = condition.match(/^(\w+)\s*(>=|>|===|==|<=|<)\s*(\d+(?:\.\d+)?)$/);
  if (!match) return false;

  const [, field, operator, valueStr] = match;
  const value = parseFloat(valueStr);
  const statValue = (stats as unknown as Record<string, number>)[field];

  if (typeof statValue !== 'number') return false;

  switch (operator) {
    case '>=':
      return statValue >= value;
    case '>':
      return statValue > value;
    case '<=':
      return statValue <= value;
    case '<':
      return statValue < value;
    case '===':
    case '==':
      return statValue === value;
    default:
      return false;
  }
}

/**
 * Check all achievements against current stats and mark newly unlocked ones.
 * Returns the full achievement list with updated unlockedAt timestamps
 * for any newly unlocked achievements.
 */
export function checkAchievements(
  achievements: Achievement[],
  stats: AchievementStats
): Achievement[] {
  const now = new Date().toISOString();

  return achievements.map((achievement) => {
    // Already unlocked, no change
    if (achievement.unlockedAt) return achievement;

    // Check if condition is now met
    if (evaluateCondition(achievement.condition, stats)) {
      return { ...achievement, unlockedAt: now };
    }

    return achievement;
  });
}

/**
 * Get only the achievements that were newly unlocked (comparing before/after).
 */
export function getNewlyUnlocked(
  before: Achievement[],
  after: Achievement[]
): Achievement[] {
  return after.filter((achievement) => {
    const wasPreviouslyLocked = before.find(
      (b) => b.id === achievement.id && b.unlockedAt === null
    );
    return wasPreviouslyLocked && achievement.unlockedAt !== null;
  });
}
