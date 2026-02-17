import type { Challenge, ActiveChallenge } from '@/types/challenge';
import type { Receipt } from '@/types/receipt';
import type { Product } from '@/types/product';
import { generateId } from '@/lib/formatters';

/**
 * Pick challenges for the user: 1 daily, 1 weekly, 1 monthly.
 * Uses a deterministic seed based on the current date so that the same challenges
 * are shown for a given day.
 */
export function generateActiveChallenges(allChallenges: Challenge[]): ActiveChallenge[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const daily = allChallenges.filter((c) => c.frequency === 'daily');
  const weekly = allChallenges.filter((c) => c.frequency === 'weekly');
  const monthly = allChallenges.filter((c) => c.frequency === 'monthly');

  const activeChallenges: ActiveChallenge[] = [];

  // Simple deterministic index based on date string hash
  const dateSeed = hashString(today);

  if (daily.length > 0) {
    const picked = daily[dateSeed % daily.length];
    activeChallenges.push(createActiveChallenge(picked, 'daily', now));
  }

  if (weekly.length > 0) {
    // Weekly seed: use ISO week number
    const weekSeed = getISOWeekNumber(now);
    const picked = weekly[weekSeed % weekly.length];
    activeChallenges.push(createActiveChallenge(picked, 'weekly', now));
  }

  if (monthly.length > 0) {
    const monthSeed = now.getFullYear() * 12 + now.getMonth();
    const picked = monthly[monthSeed % monthly.length];
    activeChallenges.push(createActiveChallenge(picked, 'monthly', now));
  }

  return activeChallenges;
}

function createActiveChallenge(
  challenge: Challenge,
  frequency: 'daily' | 'weekly' | 'monthly',
  now: Date
): ActiveChallenge {
  const startDate = now.toISOString();
  let expiresAt: string;

  switch (frequency) {
    case 'daily': {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      expiresAt = end.toISOString();
      break;
    }
    case 'weekly': {
      const end = new Date(now);
      const dayOfWeek = end.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      end.setDate(end.getDate() + daysUntilSunday);
      end.setHours(23, 59, 59, 999);
      expiresAt = end.toISOString();
      break;
    }
    case 'monthly': {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      expiresAt = end.toISOString();
      break;
    }
  }

  return {
    id: generateId(),
    challenge,
    progress: 0,
    goal: challenge.targetCount,
    startDate,
    expiresAt,
    completed: false,
    pointsAwarded: 0,
  };
}

/**
 * Evaluate a challenge's progress based on recent receipts and products.
 */
export function evaluateChallengeProgress(
  activeChallenge: ActiveChallenge,
  receipts: Receipt[],
  products: Map<string, Product> | Record<string, Product>
): ActiveChallenge {
  const productMap =
    products instanceof Map
      ? products
      : new Map(Object.entries(products));

  const { challenge, startDate, expiresAt } = activeChallenge;
  const start = new Date(startDate);
  const end = new Date(expiresAt);

  // Filter receipts within the challenge period
  const relevantReceipts = receipts.filter((r) => {
    const receiptDate = new Date(r.scannedAt);
    return receiptDate >= start && receiptDate <= end;
  });

  let progress = 0;

  switch (challenge.type) {
    case 'buy_category': {
      // Count items in a specific category
      for (const receipt of relevantReceipts) {
        for (const item of receipt.items) {
          const product = productMap.get(item.productId);
          if (product && product.category === challenge.targetCategory) {
            progress += item.quantity;
          }
        }
      }
      break;
    }

    case 'buy_healthy': {
      // Count items with health score above threshold
      const threshold = challenge.healthScoreThreshold ?? 70;
      for (const receipt of relevantReceipts) {
        for (const item of receipt.items) {
          const product = productMap.get(item.productId);
          if (product && (product.healthScore?.numericScore ?? 0) >= threshold) {
            progress += item.quantity;
          }
        }
      }
      break;
    }

    case 'total_receipts': {
      // Count total number of receipts
      progress = relevantReceipts.length;
      break;
    }

    case 'unique_products': {
      // Count unique products purchased
      const uniqueProducts = new Set<string>();
      for (const receipt of relevantReceipts) {
        for (const item of receipt.items) {
          uniqueProducts.add(item.productId);
        }
      }
      progress = uniqueProducts.size;
      break;
    }

    case 'spend_amount': {
      // Sum total spent
      for (const receipt of relevantReceipts) {
        progress += receipt.subtotal;
      }
      // Round to 2 decimal places for currency
      progress = Math.round(progress * 100) / 100;
      break;
    }

    case 'earn_points': {
      // Sum total points earned in the period
      for (const receipt of relevantReceipts) {
        progress += receipt.totalPoints;
      }
      break;
    }

    default: {
      // For unknown types, keep existing progress
      progress = activeChallenge.progress;
      break;
    }
  }

  const completed = progress >= activeChallenge.goal;
  const pointsAwarded = completed ? challenge.rewardPoints : 0;

  return {
    ...activeChallenge,
    progress: Math.min(progress, activeChallenge.goal),
    completed,
    pointsAwarded,
  };
}

/**
 * Check if a challenge has expired.
 */
export function isChallengeExpired(challenge: ActiveChallenge): boolean {
  const now = new Date();
  const expiresAt = new Date(challenge.expiresAt);
  return now > expiresAt;
}

/**
 * Filter out expired challenges from the active list.
 */
export function removeExpiredChallenges(challenges: ActiveChallenge[]): ActiveChallenge[] {
  return challenges.filter((c) => !isChallengeExpired(c));
}

// Utility functions

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
