import { useLocalStorage } from './useLocalStorage';
import type { UserProfile } from '@/types';

const DEFAULT_USER: UserProfile = {
  id: 'user-1',
  name: 'Guest',
  avatar: '🧑',
  healthGoals: [],
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
};

export function useUser() {
  const [user, setUser] = useLocalStorage<UserProfile>('nutribucks-user', DEFAULT_USER);

  const isOnboarded = user.onboardingComplete;

  const completeOnboarding = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...profile,
      onboardingComplete: true,
      lastActiveAt: new Date().toISOString(),
    }));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
      lastActiveAt: new Date().toISOString(),
    }));
  };

  return { user, isOnboarded, completeOnboarding, updateUser };
}
