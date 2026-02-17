import { useState } from 'react';
import type { HealthGoal } from '@/types';
import type { LinkedStore } from '@/types';
import { useUser } from '@/hooks/useUser';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORES } from '@/data/stores';
import { Button } from '@/components/ui/Button';

const HEALTH_GOALS = [
  { id: 'weight_loss' as HealthGoal, name: 'Weight Loss', description: 'Low-calorie, high-fiber foods', emoji: '🏃' },
  { id: 'heart_health' as HealthGoal, name: 'Heart Health', description: 'Reduce sodium & saturated fats', emoji: '❤️' },
  { id: 'diabetes_management' as HealthGoal, name: 'Diabetes Mgmt', description: 'Control sugar & carbs', emoji: '🩺' },
  { id: 'general_wellness' as HealthGoal, name: 'General Wellness', description: 'Balanced nutrition', emoji: '🌟' },
  { id: 'muscle_building' as HealthGoal, name: 'Muscle Building', description: 'High protein foods', emoji: '💪' },
  { id: 'gut_health' as HealthGoal, name: 'Gut Health', description: 'Fiber & fermented foods', emoji: '🦠' },
];

const AVATARS = ['🧑', '👩', '👨', '🧑‍🦱', '👩‍🦰', '👨‍🦳', '🧑‍🍳', '🦸'];

export function OnboardingPage() {
  const { completeOnboarding } = useUser();
  const [, setLinkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧑');
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [memberIds, setMemberIds] = useState<Record<string, string>>({});
  const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const toggleStore = (storeId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId],
    );
  };

  const toggleGoal = (goalId: HealthGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId],
    );
  };

  const handleComplete = () => {
    setIsCompleting(true);

    const now = new Date().toISOString();
    const stores: LinkedStore[] = selectedStoreIds.map((storeId, idx) => ({
      storeId,
      memberId: memberIds[storeId] || '',
      linkedAt: now,
      lastSyncAt: now,
      syncStatus: 'synced' as const,
      isPrimary: idx === 0,
    }));

    setLinkedStores(stores);

    setTimeout(() => {
      completeOnboarding({
        name: name.trim() || 'Guest',
        avatar,
        healthGoals: selectedGoals,
      });
    }, 2000);
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = selectedStoreIds.length > 0;
  const canProceedStep4 = selectedGoals.length > 0;

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="min-h-screen min-h-dvh bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6">
        <div className="animate-fade-in flex flex-col items-center text-center max-w-sm">
          <div className="text-8xl mb-6 animate-bounce">🥦</div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-3">
            NutriBucks
          </h1>
          <p className="text-lg text-gray-600 mb-2">Earn rewards for eating healthy</p>
          <p className="text-sm text-gray-400 mb-10">
            Scan your grocery receipts, track your health score, and redeem points for discounts and donations.
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={() => setStep(1)}>
            Get Started
          </Button>
          <p className="text-xs text-gray-400 mt-4">Free to use. No credit card required.</p>
        </div>
      </div>
    );
  }

  // Step 1: Name & Avatar
  if (step === 1) {
    return (
      <div className="min-h-screen min-h-dvh bg-white flex flex-col px-6 pt-12 pb-8">
        <div className="animate-fade-in flex-1 flex flex-col max-w-sm mx-auto w-full">
          <StepIndicator current={1} total={4} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What should we call you?</h2>
          <p className="text-sm text-gray-500 mb-6">Set up your profile to personalize your experience.</p>

          <label className="text-sm font-medium text-gray-700 mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all mb-6"
            autoFocus
          />

          <label className="text-sm font-medium text-gray-700 mb-3">Choose an Avatar</label>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => setAvatar(av)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                  avatar === av
                    ? 'bg-green-100 ring-2 ring-green-500 scale-110'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {av}
              </button>
            ))}
          </div>

          <div className="mt-auto flex gap-3">
            <Button variant="ghost" size="md" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!canProceedStep1}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Store Selection
  if (step === 2) {
    return (
      <div className="min-h-screen min-h-dvh bg-white flex flex-col px-6 pt-12 pb-8">
        <div className="animate-fade-in flex-1 flex flex-col max-w-sm mx-auto w-full">
          <StepIndicator current={2} total={4} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Where do you shop?</h2>
          <p className="text-sm text-gray-500 mb-6">
            Select stores you shop at to link your loyalty cards and start earning points.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 overflow-y-auto">
            {STORES.map((store) => {
              const isSelected = selectedStoreIds.includes(store.id);
              return (
                <button
                  key={store.id}
                  onClick={() => toggleStore(store.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className="text-3xl">{store.emoji}</span>
                  <span className="text-sm font-semibold text-gray-800">{store.name}</span>
                  <span className="text-[10px] text-gray-400">{store.rewardsProgram.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex gap-3">
            <Button variant="ghost" size="md" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!canProceedStep2}
              onClick={() => setStep(3)}
            >
              Continue ({selectedStoreIds.length} selected)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Account Linking (member IDs)
  if (step === 3) {
    const selectedStores = STORES.filter((s) => selectedStoreIds.includes(s.id));

    return (
      <div className="min-h-screen min-h-dvh bg-white flex flex-col px-6 pt-12 pb-8">
        <div className="animate-fade-in flex-1 flex flex-col max-w-sm mx-auto w-full">
          <StepIndicator current={3} total={4} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link your accounts</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your loyalty card numbers. You can skip and add them later.
          </p>

          <div className="space-y-4 mb-8 overflow-y-auto">
            {selectedStores.map((store) => (
              <div key={store.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{store.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{store.name}</p>
                    <p className="text-xs text-gray-400">{store.rewardsProgram.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-500 bg-gray-200 px-2 py-1.5 rounded-lg">
                    {store.rewardsProgram.cardPrefix}-
                  </span>
                  <input
                    type="text"
                    value={memberIds[store.id] || ''}
                    onChange={(e) =>
                      setMemberIds((prev) => ({ ...prev, [store.id]: e.target.value }))
                    }
                    placeholder={`${'0'.repeat(store.rewardsProgram.memberIdLength)}`}
                    maxLength={store.rewardsProgram.memberIdLength}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-mono text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex gap-3">
            <Button variant="ghost" size="md" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Health Goals
  if (step === 4) {
    return (
      <div className="min-h-screen min-h-dvh bg-white flex flex-col px-6 pt-12 pb-8">
        <div className="animate-fade-in flex-1 flex flex-col max-w-sm mx-auto w-full">
          <StepIndicator current={4} total={4} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your health goals</h2>
          <p className="text-sm text-gray-500 mb-6">
            Choose one or more goals. We'll personalize your point bonuses and product recommendations.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {HEALTH_GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <span className="text-2xl mb-2">{goal.emoji}</span>
                  <span className="text-sm font-semibold text-gray-800">{goal.name}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">{goal.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex gap-3">
            <Button variant="ghost" size="md" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!canProceedStep4}
              onClick={() => setStep(5)}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Completion / Celebration
  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6">
      <div className="animate-scale-in flex flex-col items-center text-center max-w-sm">
        {!isCompleting ? (
          <>
            <div className="relative mb-8">
              <div className="text-8xl">🎉</div>
              <div className="absolute -top-2 -left-4 text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>
                ✨
              </div>
              <div className="absolute -top-2 -right-4 text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>
                🌟
              </div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                💚
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">You're all set!</h2>
            <p className="text-gray-600 mb-2">
              Welcome, <span className="font-bold text-green-600">{name || 'Guest'}</span>! {avatar}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {selectedStoreIds.length} store{selectedStoreIds.length !== 1 ? 's' : ''} linked
              {' · '}
              {selectedGoals.length} health goal{selectedGoals.length !== 1 ? 's' : ''} set
            </p>

            <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
              <p className="text-sm text-gray-500 mb-3">Your starting rewards</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className="text-4xl font-extrabold text-green-600">0</span>
                <span className="text-lg text-gray-400 font-medium">pts</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan your first receipt to start earning!</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleComplete}
            >
              Start Earning Points
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
            <p className="text-lg font-semibold text-gray-700">Setting up your account...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <div key={stepNum} className="flex items-center gap-2 flex-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-500'
                  : isCurrent
                    ? 'bg-green-300'
                    : 'bg-gray-200'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
