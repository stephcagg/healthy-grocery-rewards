import type { Product, ProductCategory } from '@/types/product';
import type { HealthGoal } from '@/types/user';
import type { TierLevel } from '@/types/rewards';
import type { ReceiptItem } from '@/types/receipt';
import { getTierMultiplier } from '@/lib/tiers';

const GOAL_CATEGORY_MAP: Record<HealthGoal, ProductCategory[]> = {
  weight_loss: ['fruits_vegetables', 'lean_proteins'],
  heart_health: ['fruits_vegetables', 'whole_grains', 'lean_proteins'],
  diabetes_management: ['fruits_vegetables', 'lean_proteins', 'whole_grains'],
  general_wellness: ['fruits_vegetables', 'whole_grains', 'lean_proteins', 'dairy'],
  muscle_building: ['lean_proteins', 'dairy', 'whole_grains'],
  gut_health: ['fruits_vegetables', 'whole_grains', 'pantry'],
};

const GOAL_ATTRIBUTE_MULTIPLIERS: Record<HealthGoal, { attribute: string; multiplier: number }[]> = {
  weight_loss: [
    { attribute: 'isLowSodium', multiplier: 1.1 },
    { attribute: 'isHighFiber', multiplier: 1.3 },
  ],
  heart_health: [
    { attribute: 'isLowSodium', multiplier: 1.3 },
    { attribute: 'isWholeGrain', multiplier: 1.2 },
  ],
  diabetes_management: [
    { attribute: 'isHighFiber', multiplier: 1.4 },
    { attribute: 'isWholeGrain', multiplier: 1.2 },
  ],
  general_wellness: [
    { attribute: 'isOrganic', multiplier: 1.2 },
    { attribute: 'isWholeGrain', multiplier: 1.1 },
  ],
  muscle_building: [
    { attribute: 'isHighFiber', multiplier: 1.1 },
  ],
  gut_health: [
    { attribute: 'isHighFiber', multiplier: 1.4 },
    { attribute: 'isPlantBased', multiplier: 1.3 },
  ],
};

export function getGoalMultiplier(product: Product, userGoals: HealthGoal[]): number {
  if (userGoals.length === 0) return 1.0;

  let maxMultiplier = 1.0;

  for (const goal of userGoals) {
    let goalMultiplier = 1.0;

    const matchingCategories = GOAL_CATEGORY_MAP[goal];
    if (matchingCategories && matchingCategories.includes(product.category)) {
      goalMultiplier = 1.2;
    }

    const attributeMultipliers = GOAL_ATTRIBUTE_MULTIPLIERS[goal];
    if (attributeMultipliers && product.nutrition) {
      for (const { attribute, multiplier } of attributeMultipliers) {
        const nutritionRecord = product.nutrition as unknown as Record<string, unknown>;
        if (nutritionRecord[attribute] === true) {
          goalMultiplier = Math.max(goalMultiplier, multiplier);
        }
      }
    }

    // Special: weight_loss bonus for low calorie products
    if (goal === 'weight_loss' && product.nutrition && product.nutrition.calories <= 200) {
      goalMultiplier = Math.max(goalMultiplier, 1.3);
    }

    // Special: muscle_building bonus for high protein
    if (goal === 'muscle_building' && product.nutrition && product.nutrition.protein >= 10) {
      goalMultiplier = Math.max(goalMultiplier, 1.4);
    }

    // Special: diabetes_management bonus for low sugar
    if (goal === 'diabetes_management' && product.nutrition && product.nutrition.sugar <= 5) {
      goalMultiplier = Math.max(goalMultiplier, 1.3);
    }

    maxMultiplier = Math.max(maxMultiplier, goalMultiplier);
  }

  return maxMultiplier;
}

export function calculatePointsForItem(
  product: Product,
  userGoals: HealthGoal[],
  tierLevel: TierLevel,
  streakBonus: number
): number {
  const score = product.healthScore?.numericScore ?? 50;
  const basePoints = Math.max(1, Math.round(score * 0.1));

  const goalMult = getGoalMultiplier(product, userGoals);
  const tierMult = getTierMultiplier(tierLevel);
  const streakMult = 1 + streakBonus;

  const totalPoints = Math.round(basePoints * goalMult * tierMult * streakMult);
  return Math.max(1, totalPoints);
}

export interface ReceiptPointsContext {
  userGoals: HealthGoal[];
  tierLevel: TierLevel;
  streakBonus: number;
}

export interface ReceiptPointsResult {
  itemPoints: { productId: string; points: number; productName: string }[];
  subtotal: number;
  bonusPoints: number;
  total: number;
}

export function calculateReceiptPoints(
  items: ReceiptItem[],
  products: Map<string, Product> | Record<string, Product>,
  context: ReceiptPointsContext
): ReceiptPointsResult {
  const productMap =
    products instanceof Map
      ? products
      : new Map(Object.entries(products));

  const itemPoints: { productId: string; points: number; productName: string }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    const points =
      calculatePointsForItem(
        product,
        context.userGoals,
        context.tierLevel,
        context.streakBonus
      ) * item.quantity;

    itemPoints.push({
      productId: item.productId,
      points,
      productName: product.name,
    });
    subtotal += points;
  }

  let bonusPoints = 0;
  const uniqueProducts = new Set(items.map((i) => i.productId));
  if (uniqueProducts.size >= 5) {
    bonusPoints += Math.round(subtotal * 0.1);
  }

  const allHealthy = items.every((item) => {
    const product = productMap.get(item.productId);
    return product && (product.healthScore?.numericScore ?? 0) >= 60;
  });
  if (allHealthy && items.length > 0) {
    bonusPoints += Math.round(subtotal * 0.15);
  }

  const total = subtotal + bonusPoints;

  return { itemPoints, subtotal, bonusPoints, total };
}
