import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { LinkedStore } from '@/types';
import { STORES } from '@/data/stores';
import { formatRelativeTime } from '@/lib/formatters';

const STORES_MAP = new Map(STORES.map((s) => [s.id, s]));

export function StorePage() {
  const [linkedStores, setLinkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreId, setNewStoreId] = useState('');
  const [newMemberId, setNewMemberId] = useState('');

  const unlinkedStores = STORES.filter(
    (s) => !linkedStores.some((ls) => ls.storeId === s.id),
  );

  const handleAddStore = () => {
    if (!newStoreId) return;

    const now = new Date().toISOString();
    const newStore: LinkedStore = {
      storeId: newStoreId,
      memberId: newMemberId,
      linkedAt: now,
      lastSyncAt: now,
      syncStatus: 'synced',
      isPrimary: linkedStores.length === 0,
    };

    setLinkedStores((prev) => [...prev, newStore]);
    setShowAddModal(false);
    setNewStoreId('');
    setNewMemberId('');
  };

  const handleRemoveStore = (storeId: string) => {
    setLinkedStores((prev) => prev.filter((ls) => ls.storeId !== storeId));
  };

  const syncStatusConfig = {
    synced: { label: 'Synced', variant: 'success' as const, emoji: '✅' },
    syncing: { label: 'Syncing...', variant: 'info' as const, emoji: '🔄' },
    error: { label: 'Error', variant: 'danger' as const, emoji: '⚠️' },
  };

  return (
    <PageContainer title="Linked Stores" subtitle="Manage your grocery store connections">
      {linkedStores.length === 0 ? (
        <EmptyState
          emoji="🏪"
          title="No stores linked"
          description="Link your grocery store loyalty cards to start earning points."
          action={{
            label: 'Add Store',
            onClick: () => setShowAddModal(true),
          }}
        />
      ) : (
        <>
          {/* Linked Stores List */}
          <div className="space-y-3 mb-4">
            {linkedStores.map((ls) => {
              const store = STORES_MAP.get(ls.storeId);
              if (!store) return null;
              const status = syncStatusConfig[ls.syncStatus];

              return (
                <Card key={ls.storeId}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {store.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-800">{store.name}</h3>
                        {ls.isPrimary && (
                          <Badge variant="success" size="sm">Primary</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {store.rewardsProgram.name}
                      </p>
                      {ls.memberId && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {store.rewardsProgram.cardPrefix}-{ls.memberId}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">{status.emoji}</span>
                          <Badge variant={status.variant} size="sm">{status.label}</Badge>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          Last sync: {formatRelativeTime(ls.lastSyncAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStore(ls.storeId)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      title="Remove store"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add More Button */}
          {unlinkedStores.length > 0 && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setShowAddModal(true)}
            >
              + Add Another Store
            </Button>
          )}
        </>
      )}

      {/* Add Store Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setNewStoreId(''); setNewMemberId(''); }}
        title="Add Store"
        size="sm"
      >
        {unlinkedStores.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            All available stores have been linked.
          </p>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Store</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {unlinkedStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setNewStoreId(store.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    newStoreId === store.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{store.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{store.name}</span>
                </button>
              ))}
            </div>

            {newStoreId && (() => {
              const selectedStore = STORES_MAP.get(newStoreId);
              if (!selectedStore) return null;
              return (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Member ID (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-2 rounded-lg">
                      {selectedStore.rewardsProgram.cardPrefix}-
                    </span>
                    <input
                      type="text"
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      placeholder={`${'0'.repeat(selectedStore.rewardsProgram.memberIdLength)}`}
                      maxLength={selectedStore.rewardsProgram.memberIdLength}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              );
            })()}

            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!newStoreId}
              onClick={handleAddStore}
            >
              Link Store
            </Button>
          </>
        )}
      </Modal>
    </PageContainer>
  );
}
