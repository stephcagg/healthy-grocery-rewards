import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useUser } from '@/hooks/useUser';
import { usePoints } from '@/hooks/usePoints';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { HealthGoal, LinkedStore, Receipt } from '@/types';
import { getCurrentTier, TIER_DEFINITIONS } from '@/lib/tiers';

const HEALTH_GOALS_MAP: Record<string, { name: string; emoji: string }> = {
  weight_loss: { name: 'Weight Loss', emoji: '🏃' },
  heart_health: { name: 'Heart Health', emoji: '❤️' },
  diabetes_management: { name: 'Diabetes Mgmt', emoji: '🩺' },
  general_wellness: { name: 'General Wellness', emoji: '🌟' },
  muscle_building: { name: 'Muscle Building', emoji: '💪' },
  gut_health: { name: 'Gut Health', emoji: '🦠' },
};

const ALL_GOALS: HealthGoal[] = [
  'weight_loss',
  'heart_health',
  'diabetes_management',
  'general_wellness',
  'muscle_building',
  'gut_health',
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { balance } = usePoints();
  const [linkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);
  const [receipts] = useLocalStorage<Receipt[]>('nutribucks-receipts', []);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editGoals, setEditGoals] = useState<HealthGoal[]>([]);

  const tier = getCurrentTier(balance.total);
  const tierDef = TIER_DEFINITIONS[tier];

  const totalItems = receipts.reduce(
    (sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  const openGoalsModal = () => {
    setEditGoals([...user.healthGoals]);
    setShowGoalsModal(true);
  };

  const toggleEditGoal = (goal: HealthGoal) => {
    setEditGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const saveGoals = () => {
    updateUser({ healthGoals: editGoals });
    setShowGoalsModal(false);
  };

  const handleReset = () => {
    localStorage.removeItem('nutribucks-user');
    localStorage.removeItem('nutribucks-points');
    localStorage.removeItem('nutribucks-stores');
    localStorage.removeItem('nutribucks-transactions');
    localStorage.removeItem('nutribucks-receipts');
    localStorage.removeItem('nutribucks-streak');
    localStorage.removeItem('nutribucks-achievements');
    window.location.reload();
  };

  return (
    <PageContainer title="Profile">
      {/* Avatar & Name */}
      <Card className="mb-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-3">
          {user.avatar}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-lg">{tierDef.emoji}</span>
          <Badge variant="tier" size="md">{tierDef.name} Tier</Badge>
        </div>
      </Card>

      {/* Health Goals */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Health Goals</h3>
          <button
            onClick={openGoalsModal}
            className="text-sm text-green-600 font-medium hover:underline"
          >
            Edit
          </button>
        </div>
        {user.healthGoals.length === 0 ? (
          <p className="text-sm text-gray-400">No goals set yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.healthGoals.map((goal) => {
              const info = HEALTH_GOALS_MAP[goal];
              if (!info) return null;
              return (
                <Badge key={goal} variant="success" size="md">
                  {info.emoji} {info.name}
                </Badge>
              );
            })}
          </div>
        )}
      </Card>

      {/* Stats */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Your Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{receipts.length}</p>
            <p className="text-[11px] text-gray-500">Receipts Scanned</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{totalItems}</p>
            <p className="text-[11px] text-gray-500">Items Tracked</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-green-600">{balance.total.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500">Total Points</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{linkedStores.length}</p>
            <p className="text-[11px] text-gray-500">Stores Linked</p>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="space-y-2 mb-6">
        <Card hover onClick={() => navigate('/history')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium text-gray-800">Points History</span>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Card>
        <Card hover onClick={() => navigate('/achievements')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium text-gray-800">Achievements</span>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Card>
        <Card hover onClick={() => navigate('/stores')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏪</span>
              <span className="text-sm font-medium text-gray-800">Manage Stores</span>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Card>
      </div>

      {/* Reset Button */}
      <Button
        variant="danger"
        size="md"
        fullWidth
        onClick={() => setShowResetModal(true)}
      >
        Reset All Data
      </Button>
      <p className="text-xs text-gray-400 text-center mt-2">
        This will delete all your data and start fresh.
      </p>

      {/* Edit Goals Modal */}
      <Modal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        title="Edit Health Goals"
        size="sm"
      >
        <div className="space-y-2 mb-4">
          {ALL_GOALS.map((goal) => {
            const info = HEALTH_GOALS_MAP[goal];
            if (!info) return null;
            const isSelected = editGoals.includes(goal);
            return (
              <button
                key={goal}
                onClick={() => toggleEditGoal(goal)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{info.emoji}</span>
                <span className="text-sm font-medium text-gray-800">{info.name}</span>
                {isSelected && (
                  <svg className="w-5 h-5 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <Button variant="primary" size="md" fullWidth onClick={saveGoals}>
          Save Goals
        </Button>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Data?"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-6">
          This will permanently delete all your data including points, receipts, achievements, and
          linked stores. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" fullWidth onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="md" fullWidth onClick={handleReset}>
            Reset Everything
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
