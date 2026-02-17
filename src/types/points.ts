export type TransactionType = 'earn_purchase' | 'earn_streak' | 'earn_challenge' | 'earn_achievement' | 'redeem_discount' | 'redeem_recipe' | 'redeem_donation';

export interface PointsTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  storeId: string | null;
  receiptId: string | null;
  createdAt: string;
}

export interface PointsBalance {
  total: number;
  available: number;
  redeemed: number;
}
