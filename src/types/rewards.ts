export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Tier {
  level: TierLevel;
  name: string;
  minLifetimePoints: number;
  pointsMultiplier: number;
  benefits: string[];
  color: string;
  emoji: string;
}

export type RewardType = 'store_discount' | 'recipe_box' | 'food_bank_donation';

export interface RedemptionOption {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  dollarValue: number;
  emoji: string;
  availableAt: string[];
  minTier: TierLevel;
}
