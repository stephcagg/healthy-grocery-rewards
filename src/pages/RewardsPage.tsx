import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { usePoints } from '@/hooks/usePoints';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/Toast';
import type { PointsTransaction } from '@/types';
import { getProgressToNextTier, TIER_DEFINITIONS } from '@/lib/tiers';
import { generateId } from '@/lib/formatters';

const REWARDS = [
  { id: 'r1', name: '$5 Store Discount', type: 'store_discount', pointsCost: 500, emoji: '🏷️', description: 'Save $5 on your next purchase' },
  { id: 'r2', name: '$10 Store Discount', type: 'store_discount', pointsCost: 900, emoji: '💰', description: 'Save $10 on your next purchase' },
  { id: 'r3', name: '$25 Store Discount', type: 'store_discount', pointsCost: 2000, emoji: '💵', description: 'Save $25 on your next purchase' },
  { id: 'r4', name: 'Heart-Healthy Kit', type: 'recipe_box', pointsCost: 750, emoji: '❤️', description: 'Recipes & ingredients for heart-healthy meals' },
  { id: 'r5', name: 'Protein Meal Prep', type: 'recipe_box', pointsCost: 750, emoji: '💪', description: 'High-protein meal prep recipes & tips' },
  { id: 'r6', name: 'Mediterranean Box', type: 'recipe_box', pointsCost: 1000, emoji: '🫒', description: 'Mediterranean diet recipe collection' },
  { id: 'r7', name: 'Donate 10 Meals', type: 'food_bank_donation', pointsCost: 300, emoji: '🤝', description: 'Feed 10 people at your local food bank' },
  { id: 'r8', name: 'Donate 25 Meals', type: 'food_bank_donation', pointsCost: 600, emoji: '💛', description: 'Feed 25 people at your local food bank' },
  { id: 'r9', name: 'Donate 50 Meals', type: 'food_bank_donation', pointsCost: 1000, emoji: '🌟', description: 'Feed 50 people at your local food bank' },
];

const TYPE_LABELS: Record<string, string> = {
  store_discount: 'Store Discounts',
  recipe_box: 'Recipe Boxes',
  food_bank_donation: 'Donate to Food Bank',
};

const REDEEM_TX_TYPE: Record<string, 'redeem_discount' | 'redeem_recipe' | 'redeem_donation'> = {
  store_discount: 'redeem_discount',
  recipe_box: 'redeem_recipe',
  food_bank_donation: 'redeem_donation',
};

export function RewardsPage() {
  const { balance, redeemPoints } = usePoints();
  const { addToast } = useToast();
  const [, setTransactions] = useLocalStorage<PointsTransaction[]>('nutribucks-transactions', []);
  const [confirmReward, setConfirmReward] = useState<(typeof REWARDS)[number] | null>(null);

  const tierProgress = getProgressToNextTier(balance.total);
  const currentTier = TIER_DEFINITIONS[tierProgress.current];

  const handleRedeem = (reward: (typeof REWARDS)[number]) => {
    const success = redeemPoints(reward.pointsCost);
    if (!success) {
      addToast({ type: 'error', message: 'Not enough points!', emoji: '😔' });
      setConfirmReward(null);
      return;
    }

    const tx: PointsTransaction = {
      id: generateId(),
      type: REDEEM_TX_TYPE[reward.type] || 'redeem_discount',
      amount: -reward.pointsCost,
      description: `Redeemed: ${reward.name}`,
      storeId: null,
      receiptId: null,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, tx]);

    addToast({
      type: 'success',
      message: `Redeemed ${reward.name}!`,
      emoji: reward.emoji,
    });
    setConfirmReward(null);
  };

  const groupedRewards = REWARDS.reduce<Record<string, typeof REWARDS>>((acc, reward) => {
    if (!acc[reward.type]) acc[reward.type] = [];
    acc[reward.type].push(reward);
    return acc;
  }, {});

  return (
    <PageContainer title="Rewards" subtitle="Redeem your points for great rewards">
      {/* Tier Display */}
      <Card className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-4xl">{currentTier.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{currentTier.name} Tier</h3>
              <Badge variant="tier" size="sm">{currentTier.pointsMultiplier}x pts</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {balance.available.toLocaleString()} points available
            </p>
          </div>
        </div>

        {tierProgress.next && (
          <div>
            <ProgressBar value={tierProgress.progress * 100} max={100} size="sm" color="#F59E0B" />
            <p className="text-[11px] text-gray-500 mt-1">
              {tierProgress.pointsNeeded} pts to {TIER_DEFINITIONS[tierProgress.next].name}
            </p>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-3 space-y-1">
          {currentTier.benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-500 text-[10px]">✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Reward Sections */}
      {Object.entries(groupedRewards).map(([type, rewards]) => (
        <div key={type} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{TYPE_LABELS[type] || type}</h2>
          <div className="space-y-3">
            {rewards.map((reward) => {
              const canAfford = balance.available >= reward.pointsCost;
              return (
                <Card key={reward.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {reward.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{reward.name}</p>
                      <p className="text-[11px] text-gray-500">{reward.description}</p>
                      <p className="text-xs font-bold text-green-600 mt-0.5">
                        {reward.pointsCost.toLocaleString()} pts
                      </p>
                    </div>
                    <Button
                      variant={canAfford ? 'primary' : 'secondary'}
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => setConfirmReward(reward)}
                    >
                      Redeem
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Confirm Modal */}
      {confirmReward && (
        <Modal
          isOpen={!!confirmReward}
          onClose={() => setConfirmReward(null)}
          title="Confirm Redemption"
          size="sm"
        >
          <div className="text-center mb-5">
            <span className="text-5xl">{confirmReward.emoji}</span>
            <h3 className="text-lg font-bold text-gray-900 mt-3">{confirmReward.name}</h3>
            <p className="text-sm text-gray-500 mt-1.5">{confirmReward.description}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 mb-5 text-center">
            <p className="text-sm text-gray-500">Cost</p>
            <p className="text-2xl font-extrabold text-green-600">
              {confirmReward.pointsCost.toLocaleString()} pts
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Balance after: {(balance.available - confirmReward.pointsCost).toLocaleString()} pts
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="md" fullWidth onClick={() => setConfirmReward(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={() => handleRedeem(confirmReward)}>
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
