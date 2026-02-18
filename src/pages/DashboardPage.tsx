import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { usePoints } from '@/hooks/usePoints';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PointsTransaction, Streak, LinkedStore } from '@/types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { getProgressToNextTier, TIER_DEFINITIONS } from '@/lib/tiers';
import { formatRelativeTime } from '@/lib/formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { balance } = usePoints();
  const [transactions] = useLocalStorage<PointsTransaction[]>('nutribucks-transactions', []);
  const [streak] = useLocalStorage<Streak>('nutribucks-streak', {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
  });
  const [linkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);

  const tierProgress = getProgressToNextTier(balance.total);
  const currentTier = TIER_DEFINITIONS[tierProgress.current];
  const recentTransactions = transactions.slice(-5).reverse();

  const transactionIcon = (type: string) => {
    if (type.startsWith('earn_')) return '➕';
    if (type.startsWith('redeem_')) return '🎁';
    return '💰';
  };

  return (
    <PageContainer>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey, {user.name}! {user.avatar}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Let's make healthy choices today.</p>
      </div>

      {/* Points Summary */}
      <Card className="mb-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium opacity-80">Available Points</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {currentTier.emoji} {currentTier.name}
          </span>
        </div>
        <div className="text-4xl font-extrabold mb-1">
          {balance.available.toLocaleString()}
        </div>
        <div className="flex gap-4 text-sm opacity-80">
          <span>Total: {balance.total.toLocaleString()}</span>
          <span>Redeemed: {balance.redeemed.toLocaleString()}</span>
        </div>
      </Card>

      {/* Streak & Tier row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Streak */}
        <Card className="text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-extrabold text-gray-900">{streak.currentStreak}</div>
          <div className="text-[11px] text-gray-500 font-medium">Week Streak</div>
          <div className="text-[10px] text-gray-400 mt-1">Best: {streak.longestStreak}w</div>
        </Card>

        {/* Tier Progress */}
        <Card>
          <div className="text-center mb-2">
            <span className="text-3xl">{currentTier.emoji}</span>
          </div>
          <div className="text-center text-sm font-bold text-gray-800 mb-2">{currentTier.name} Tier</div>
          {tierProgress.next ? (
            <>
              <ProgressBar
                value={tierProgress.progress * 100}
                max={100}
                size="sm"
                color="#16A34A"
              />
              <p className="text-[10px] text-gray-400 text-center mt-1">
                {tierProgress.pointsNeeded} pts to {TIER_DEFINITIONS[tierProgress.next].name}
              </p>
            </>
          ) : (
            <p className="text-[10px] text-green-600 text-center font-medium">Max tier reached!</p>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => navigate('/scan')}
        >
          📷 Scan Receipt
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => navigate('/shop')}
        >
          🛒 Browse Products
        </Button>
      </div>

      {/* Linked Stores Quick Info */}
      {linkedStores.length > 0 && (
        <Card className="mb-6" hover onClick={() => navigate('/stores')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏪</span>
              <span className="text-sm font-semibold text-gray-800">
                {linkedStores.length} Store{linkedStores.length !== 1 ? 's' : ''} Linked
              </span>
            </div>
            <span className="text-gray-400 text-sm">→</span>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          {transactions.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-green-600 font-medium hover:underline"
            >
              View All
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <Card className="text-center py-8">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-sm text-gray-500">No activity yet. Scan a receipt to get started!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <Card key={tx.id} padding="sm">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{transactionIcon(tx.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                    <p className="text-[11px] text-gray-400">{formatRelativeTime(tx.createdAt)}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.amount >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
