import { useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePoints } from '@/hooks/usePoints';
import type { Achievement, Streak, Receipt, LinkedStore } from '@/types';
import { INITIAL_ACHIEVEMENTS, checkAchievements } from '@/lib/achievements';
import { getCurrentTier } from '@/lib/tiers';
import { formatDate } from '@/lib/formatters';

const ICON_MAP: Record<string, string> = {
  receipt: '🧾',
  'shopping-cart': '🛒',
  star: '⭐',
  trophy: '🏆',
  package: '📦',
  coins: '🪙',
  gem: '💎',
  crown: '👑',
  flame: '🔥',
  zap: '⚡',
  link: '🔗',
  store: '🏪',
  award: '🏅',
  grid: '🎯',
  heart: '❤️',
  shield: '🛡️',
};

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-600',
  uncommon: 'bg-green-100 text-green-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-amber-100 text-amber-800',
};

export function AchievementsPage() {
  const { balance } = usePoints();
  const [storedAchievements] = useLocalStorage<Achievement[]>('nutribucks-achievements', INITIAL_ACHIEVEMENTS);
  const [receipts] = useLocalStorage<Receipt[]>('nutribucks-receipts', []);
  const [streak] = useLocalStorage<Streak>('nutribucks-streak', {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
  });
  const [linkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);

  // Compute stats
  const stats = useMemo(() => {
    const totalItems = receipts.reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0), 0);
    const uniqueCategories = new Set<string>();
    let healthyItemCount = 0;

    receipts.forEach((r) => {
      r.items.forEach(() => {
        // Product-level tracking requires cross-referencing product data
      });
    });

    return {
      totalReceipts: receipts.length,
      totalItems,
      totalPoints: balance.total,
      currentStreak: streak.currentStreak,
      linkedStores: linkedStores.length,
      tier: getCurrentTier(balance.total),
      receipts,
      uniqueCategories: uniqueCategories.size,
      healthyItemCount,
      lifetimePoints: balance.total,
    };
  }, [receipts, balance.total, streak.currentStreak, linkedStores.length]);

  // Check achievements with current stats
  const achievements = useMemo(() => {
    return checkAchievements(storedAchievements, stats);
  }, [storedAchievements, stats]);

  const unlocked = achievements.filter((a) => a.unlockedAt !== null);
  const locked = achievements.filter((a) => a.unlockedAt === null);

  const unlockedCount = unlocked.length;
  const totalCount = achievements.length;

  return (
    <PageContainer title="Achievements" subtitle={`${unlockedCount}/${totalCount} unlocked`}>
      {/* Progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">Overall Progress</span>
          <span className="text-sm font-bold text-green-600">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
        <ProgressBar
          value={unlockedCount}
          max={totalCount}
          size="md"
          color="#16A34A"
        />
      </Card>

      {/* Active Challenges Placeholder */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Active Challenges</h2>
        <Card className="bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Weekly: Scan 3 Receipts</p>
              <p className="text-xs text-gray-500">Earn bonus points by staying active</p>
            </div>
            <Badge variant="info" size="sm">+50 pts</Badge>
          </div>
          <ProgressBar
            value={Math.min(receipts.length, 3)}
            max={3}
            size="sm"
            color="#3B82F6"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            {Math.min(receipts.length, 3)}/3 completed
          </p>
        </Card>
      </div>

      {/* Unlocked Badges */}
      {unlocked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Unlocked</h2>
          <div className="grid grid-cols-3 gap-4">
            {unlocked.map((achievement) => (
              <Card key={achievement.id} padding="sm" className="text-center">
                <div className="text-3xl mb-1">
                  {achievement.emoji || ICON_MAP[achievement.icon || ''] || '🏅'}
                </div>
                <p className="text-[11px] font-semibold text-gray-800 leading-tight">
                  {achievement.name}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {achievement.unlockedAt ? formatDate(achievement.unlockedAt) : ''}
                </p>
                {achievement.rarity && (
                  <span
                    className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 font-medium ${
                      RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common
                    }`}
                  >
                    {achievement.rarity}
                  </span>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Locked</h2>
        <div className="grid grid-cols-3 gap-4">
          {locked.map((achievement) => (
            <Card key={achievement.id} padding="sm" className="text-center opacity-40">
              <div className="text-3xl mb-1 grayscale">
                {achievement.emoji || ICON_MAP[achievement.icon || ''] || '🔒'}
              </div>
              <p className="text-[11px] font-semibold text-gray-500 leading-tight">
                {achievement.name}
              </p>
              <p className="text-[9px] text-gray-400 mt-0.5">{achievement.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
