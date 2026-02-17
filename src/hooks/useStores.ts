import { useCallback } from 'react';
import type { LinkedStore } from '@/types/store';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useStores() {
  const [linkedStores, setLinkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);

  const linkStore = useCallback(
    (storeId: string, memberId: string) => {
      setLinkedStores((prev) => {
        if (prev.some((s) => s.storeId === storeId)) return prev;
        const newStore: LinkedStore = {
          storeId,
          memberId,
          linkedAt: new Date().toISOString(),
          lastSyncAt: new Date().toISOString(),
          syncStatus: 'synced',
          isPrimary: prev.length === 0,
        };
        return [...prev, newStore];
      });
    },
    [setLinkedStores],
  );

  const unlinkStore = useCallback(
    (storeId: string) => {
      setLinkedStores((prev) => {
        const filtered = prev.filter((s) => s.storeId !== storeId);
        if (filtered.length > 0 && !filtered.some((s) => s.isPrimary)) {
          filtered[0] = { ...filtered[0], isPrimary: true };
        }
        return filtered;
      });
    },
    [setLinkedStores],
  );

  const setPrimaryStore = useCallback(
    (storeId: string) => {
      setLinkedStores((prev) =>
        prev.map((s) => ({ ...s, isPrimary: s.storeId === storeId })),
      );
    },
    [setLinkedStores],
  );

  const getPrimaryStore = useCallback(
    () => linkedStores.find((s) => s.isPrimary) || linkedStores[0] || null,
    [linkedStores],
  );

  return { linkedStores, setLinkedStores, linkStore, unlinkStore, setPrimaryStore, getPrimaryStore };
}
