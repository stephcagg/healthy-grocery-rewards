import { useLocalStorage } from './useLocalStorage';
import type { PointsBalance } from '@/types';

const DEFAULT_BALANCE: PointsBalance = {
  total: 0,
  available: 0,
  redeemed: 0,
};

export function usePoints() {
  const [balance, setBalance] = useLocalStorage<PointsBalance>('nutribucks-points', DEFAULT_BALANCE);

  const addPoints = (amount: number) => {
    setBalance((prev) => ({
      ...prev,
      total: prev.total + amount,
      available: prev.available + amount,
    }));
  };

  const redeemPoints = (amount: number): boolean => {
    if (balance.available < amount) return false;
    setBalance((prev) => ({
      ...prev,
      available: prev.available - amount,
      redeemed: prev.redeemed + amount,
    }));
    return true;
  };

  return { balance, addPoints, redeemPoints };
}
