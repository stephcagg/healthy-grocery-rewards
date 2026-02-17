import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/hooks/useUser';
import { usePoints } from '@/hooks/usePoints';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/Toast';
import { ALL_PRODUCTS, PRODUCTS_BY_ID } from '@/data/products';
import type { Receipt, ReceiptItem, PointsTransaction, LinkedStore, Streak } from '@/types';
import { generateId, formatCurrency } from '@/lib/formatters';
import { getCurrentTier } from '@/lib/tiers';
import { getStreakBonus, updateStreak } from '@/lib/streaks';
import { calculateReceiptPoints } from '@/lib/points';

type ScanState = 'idle' | 'scanning' | 'select' | 'review' | 'done';

interface CartItem {
  productId: string;
  quantity: number;
}

const SCAN_TABS = [
  { id: 'scan', label: 'Scan Receipt', emoji: '📷' },
  { id: 'manual', label: 'Manual Entry', emoji: '✏️' },
];

export function ScanPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { balance, addPoints } = usePoints();
  const { addToast } = useToast();
  const [, setReceipts] = useLocalStorage<Receipt[]>('nutribucks-receipts', []);
  const [, setTransactions] = useLocalStorage<PointsTransaction[]>('nutribucks-transactions', []);
  const [linkedStores] = useLocalStorage<LinkedStore[]>('nutribucks-stores', []);
  const [streak, setStreak] = useLocalStorage<Streak>('nutribucks-streak', {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
  });

  const [tab, setTab] = useState('scan');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStore, setSelectedStore] = useState(linkedStores[0]?.storeId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptResult, setReceiptResult] = useState<{
    receipt: Receipt;
    breakdown: { productId: string; points: number; productName: string }[];
    bonusPoints: number;
    total: number;
  } | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return ALL_PRODUCTS.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return ALL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [searchQuery]);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.productId !== productId);
      return prev.map((c) =>
        c.productId === productId ? { ...c, quantity: c.quantity - 1 } : c,
      );
    });
  };

  const getCartQuantity = (productId: string) => {
    return cart.find((c) => c.productId === productId)?.quantity || 0;
  };

  const startScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      // Simulate scanning: randomly pick 3-6 products
      const shuffled = [...ALL_PRODUCTS].sort(() => Math.random() - 0.5);
      const count = 3 + Math.floor(Math.random() * 4);
      const scannedItems: CartItem[] = shuffled.slice(0, count).map((p) => ({
        productId: p.id,
        quantity: 1 + Math.floor(Math.random() * 2),
      }));
      setCart(scannedItems);
      setScanState('select');
    }, 2500);
  };

  const submitReceipt = () => {
    if (cart.length === 0) return;

    const tierLevel = getCurrentTier(balance.total);
    const streakBonus = getStreakBonus(streak);

    const receiptItems: ReceiptItem[] = cart
      .map((c) => {
        const product = PRODUCTS_BY_ID.get(c.productId);
        if (!product) return null;
        return {
          productId: c.productId,
          productName: product.name,
          quantity: c.quantity,
          priceEach: product.price,
          lineTotal: product.price * c.quantity,
          pointsEarned: 0,
        };
      })
      .filter((item): item is ReceiptItem => item !== null);

    const pointsResult = calculateReceiptPoints(
      receiptItems,
      PRODUCTS_BY_ID,
      { userGoals: user.healthGoals, tierLevel, streakBonus },
    );

    // Update receipt items with earned points
    pointsResult.itemPoints.forEach((ip) => {
      const item = receiptItems.find((ri) => ri.productId === ip.productId);
      if (item) item.pointsEarned = ip.points;
    });

    const receiptId = generateId();
    const receipt: Receipt = {
      id: receiptId,
      storeId: selectedStore || 'unknown',
      items: receiptItems,
      subtotal: receiptItems.reduce((sum, item) => sum + item.lineTotal, 0),
      totalPoints: pointsResult.total,
      bonusPoints: pointsResult.bonusPoints,
      scannedAt: new Date().toISOString(),
      method: tab === 'scan' ? 'scan' : 'manual',
    };

    // Save receipt
    setReceipts((prev) => [...prev, receipt]);

    // Add points
    addPoints(pointsResult.total);

    // Add transaction
    const tx: PointsTransaction = {
      id: generateId(),
      type: 'earn_purchase',
      amount: pointsResult.total,
      description: `Receipt: ${receiptItems.length} items (${formatCurrency(receipt.subtotal)})`,
      storeId: selectedStore || null,
      receiptId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, tx]);

    // Update streak
    setStreak((prev) => updateStreak(prev, new Date()));

    setReceiptResult({
      receipt,
      breakdown: pointsResult.itemPoints,
      bonusPoints: pointsResult.bonusPoints,
      total: pointsResult.total,
    });
    setScanState('done');

    addToast({
      type: 'success',
      message: `Earned ${pointsResult.total} points!`,
      emoji: '🎉',
    });
  };

  const reset = () => {
    setScanState('idle');
    setCart([]);
    setReceiptResult(null);
    setSearchQuery('');
  };

  // Done state
  if (scanState === 'done' && receiptResult) {
    return (
      <PageContainer>
        <div className="text-center mb-6 animate-scale-in">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Points Earned!</h2>
          <div className="text-4xl font-extrabold text-green-600 mb-1">
            +{receiptResult.total}
          </div>
          <p className="text-sm text-gray-500">points added to your balance</p>
        </div>

        <Card className="mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Breakdown</h3>
          <div className="space-y-2">
            {receiptResult.breakdown.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1">{item.productName}</span>
                <span className="text-green-600 font-semibold ml-2">+{item.points}</span>
              </div>
            ))}
            {receiptResult.bonusPoints > 0 && (
              <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                <span className="text-amber-600 font-medium">Bonus Points</span>
                <span className="text-amber-600 font-bold">+{receiptResult.bonusPoints}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" fullWidth onClick={reset}>
            Scan Another
          </Button>
          <Button variant="primary" fullWidth onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Add Receipt" subtitle="Scan or manually enter your purchases">
      <Tabs tabs={SCAN_TABS} activeTab={tab} onChange={(t) => { setTab(t); reset(); }} />

      {/* Store Selector */}
      {linkedStores.length > 0 && (
        <div className="mt-4 mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Store</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
          >
            {linkedStores.map((ls) => {
              const store = STORES_MAP.get(ls.storeId);
              return (
                <option key={ls.storeId} value={ls.storeId}>
                  {store ? `${store.emoji} ${store.name}` : ls.storeId}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {tab === 'scan' && scanState === 'idle' && (
        <div className="mt-6 flex flex-col items-center">
          <div className="w-64 h-64 bg-gray-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-6">
            <span className="text-6xl mb-3">📷</span>
            <p className="text-sm text-gray-500 text-center px-4">
              Point your camera at a grocery receipt
            </p>
          </div>
          <Button variant="primary" size="lg" fullWidth onClick={startScan}>
            Scan Receipt
          </Button>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Demo: Receipt will be simulated
          </p>
        </div>
      )}

      {tab === 'scan' && scanState === 'scanning' && (
        <div className="mt-6 flex flex-col items-center animate-fade-in">
          <div className="w-64 h-64 bg-gray-900 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/30 to-transparent animate-scan-line" />
            <span className="text-5xl z-10">📄</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Scanning receipt...</p>
          <p className="text-xs text-gray-400 mt-1">Identifying products</p>
        </div>
      )}

      {/* Product selection (after scan or manual) */}
      {(scanState === 'select' || tab === 'manual') && scanState !== 'scanning' && scanState !== 'done' && (
        <div className="mt-4">
          {tab === 'manual' && (
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card className="mb-4 bg-green-50 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-green-800">
                  {cart.reduce((sum, c) => sum + c.quantity, 0)} items in cart
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {formatCurrency(
                    cart.reduce((sum, c) => {
                      const p = PRODUCTS_BY_ID.get(c.productId);
                      return sum + (p ? p.price * c.quantity : 0);
                    }, 0),
                  )}
                </span>
              </div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={submitReceipt}
              >
                Submit Receipt (+pts)
              </Button>
            </Card>
          )}

          {/* Product List */}
          <div className="space-y-2">
            {(tab === 'manual' ? filteredProducts : ALL_PRODUCTS.filter((p) =>
              cart.some((c) => c.productId === p.id),
            ).concat(
              ALL_PRODUCTS.filter((p) => !cart.some((c) => c.productId === p.id)).slice(0, 15),
            )).map((product) => {
              const qty = getCartQuantity(product.id);
              return (
                <Card key={product.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{product.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{formatCurrency(product.price)}</span>
                        {product.healthScore && (
                          <Badge
                            variant={product.healthScore.grade === 'A' ? 'success' : product.healthScore.grade === 'B' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {product.healthScore.grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {qty > 0 && (
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm font-bold"
                        >
                          -
                        </button>
                      )}
                      {qty > 0 && (
                        <span className="text-sm font-bold text-gray-800 w-5 text-center">{qty}</span>
                      )}
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// Helper: stores map for quick lookup
import { STORES } from '@/data/stores';
const STORES_MAP = new Map(STORES.map((s) => [s.id, s]));
