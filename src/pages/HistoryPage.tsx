import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PointsTransaction } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/formatters';

const PERIOD_TABS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All' },
];

const TX_ICONS: Record<string, string> = {
  earn_purchase: '🛒',
  earn_streak: '🔥',
  earn_challenge: '🏆',
  earn_achievement: '🎖️',
  redeem_discount: '🏷️',
  redeem_recipe: '📖',
  redeem_donation: '🤝',
};

export function HistoryPage() {
  const [transactions] = useLocalStorage<PointsTransaction[]>('nutribucks-transactions', []);
  const [period, setPeriod] = useState('all');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sorted.filter((t) => new Date(t.createdAt) >= weekAgo);
    }
    if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return sorted.filter((t) => new Date(t.createdAt) >= monthAgo);
    }
    return sorted;
  }, [transactions, period]);

  // Compute daily totals for the bar chart
  const dailyTotals = useMemo(() => {
    const days: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      const dayKey = t.createdAt.slice(0, 10);
      days[dayKey] = (days[dayKey] || 0) + t.amount;
    });
    const entries = Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
    return entries.slice(-7); // last 7 days with activity
  }, [filteredTransactions]);

  const maxDayTotal = Math.max(1, ...dailyTotals.map(([, v]) => Math.abs(v)));

  const totalEarned = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRedeemed = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <PageContainer title="Points History" subtitle="Track your earnings and redemptions">
      <Tabs tabs={PERIOD_TABS} activeTab={period} onChange={setPeriod} />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
        <Card className="text-center bg-green-50">
          <p className="text-xs text-gray-500 mb-1">Earned</p>
          <p className="text-xl font-extrabold text-green-600">+{totalEarned.toLocaleString()}</p>
        </Card>
        <Card className="text-center bg-red-50">
          <p className="text-xs text-gray-500 mb-1">Redeemed</p>
          <p className="text-xl font-extrabold text-red-500">-{totalRedeemed.toLocaleString()}</p>
        </Card>
      </div>

      {/* Bar Chart */}
      {dailyTotals.length > 0 && (
        <Card className="mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Points Per Day</h3>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {dailyTotals.map(([day, total]) => {
              const height = Math.max(4, (Math.abs(total) / maxDayTotal) * 100);
              const isPositive = total >= 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-600">
                    {total >= 0 ? '+' : ''}{total}
                  </span>
                  <div className="w-full relative" style={{ height: '100px' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-md transition-all ${
                        isPositive ? 'bg-green-400' : 'bg-red-300'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="No transactions yet"
          description="Scan a receipt to start earning points and see your history here."
        />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} padding="sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                  {TX_ICONS[tx.type] || '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400">{formatRelativeTime(tx.createdAt)}</span>
                    <span className="text-[11px] text-gray-300">|</span>
                    <span className="text-[11px] text-gray-400">{formatDate(tx.createdAt)}</span>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${
                    tx.amount >= 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
