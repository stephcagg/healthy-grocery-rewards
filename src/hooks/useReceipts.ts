import { useCallback } from 'react';
import type { Receipt } from '@/types/receipt';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useReceipts() {
  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('nutribucks-receipts', []);

  const addReceipt = useCallback(
    (receipt: Receipt) => {
      setReceipts((prev) => [receipt, ...prev]);
    },
    [setReceipts],
  );

  const getRecentReceipts = useCallback(
    (limit = 10) => receipts.slice(0, limit),
    [receipts],
  );

  return { receipts, addReceipt, getRecentReceipts };
}
