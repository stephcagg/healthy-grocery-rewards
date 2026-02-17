import { FRUITS_VEGETABLES } from './fruits-vegetables';
import { WHOLE_GRAINS } from './whole-grains';
import { LEAN_PROTEINS } from './lean-proteins';
import { DAIRY } from './dairy';
import { SNACKS } from './snacks';
import { BEVERAGES } from './beverages';
import { FROZEN } from './frozen';
import { PANTRY } from './pantry';
import type { Product } from '../../types/product';
import { calculateHealthScore } from '../../lib/scoring';

// Compute health scores for all products
function withScores(products: Product[]): Product[] {
  return products.map(p => ({
    ...p,
    healthScore: calculateHealthScore(p.nutrition, p.category),
  }));
}

export const ALL_PRODUCTS: Product[] = [
  ...withScores(FRUITS_VEGETABLES),
  ...withScores(WHOLE_GRAINS),
  ...withScores(LEAN_PROTEINS),
  ...withScores(DAIRY),
  ...withScores(SNACKS),
  ...withScores(BEVERAGES),
  ...withScores(FROZEN),
  ...withScores(PANTRY),
];

export const PRODUCTS_BY_ID = new Map(ALL_PRODUCTS.map(p => [p.id, p]));

export const CATEGORY_LABELS: Record<string, { name: string; emoji: string }> = {
  fruits_vegetables: { name: 'Fruits & Vegetables', emoji: '🥬' },
  whole_grains: { name: 'Whole Grains', emoji: '🌾' },
  lean_proteins: { name: 'Lean Proteins', emoji: '🥩' },
  dairy: { name: 'Dairy & Alternatives', emoji: '🥛' },
  snacks: { name: 'Snacks', emoji: '🥜' },
  beverages: { name: 'Beverages', emoji: '🥤' },
  frozen: { name: 'Frozen', emoji: '🧊' },
  pantry: { name: 'Pantry', emoji: '🫙' },
};

export { FRUITS_VEGETABLES, WHOLE_GRAINS, LEAN_PROTEINS, DAIRY, SNACKS, BEVERAGES, FROZEN, PANTRY };
