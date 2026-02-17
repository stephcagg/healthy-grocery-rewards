import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { ALL_PRODUCTS, CATEGORY_LABELS } from '@/data/products';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/formatters';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🏷️' },
  ...Object.entries(CATEGORY_LABELS)
    .filter(([id]) => ALL_PRODUCTS.some((p) => p.category === id))
    .map(([id, val]) => ({ id, label: val.name, emoji: val.emoji })),
];

const gradeBadgeVariant = (grade: string) => {
  switch (grade) {
    case 'A': return 'success' as const;
    case 'B': return 'info' as const;
    case 'C': return 'warning' as const;
    case 'D': return 'danger' as const;
    default: return 'danger' as const;
  }
};

export function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <PageContainer title="Browse Products" subtitle="Discover healthy options and earn more points">
      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3 -mx-4 px-4 scrollbar-hide mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeCategory === cat.id
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Count */}
      <p className="text-xs text-gray-400 mb-3">{filteredProducts.length} products</p>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            padding="sm"
            hover
            onClick={() => setSelectedProduct(product)}
          >
            <div className="text-center mb-2">
              <span className="text-4xl">{product.emoji}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
            <p className="text-[11px] text-gray-400 truncate mb-2">{product.brand}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.healthScore && (
                <Badge variant={gradeBadgeVariant(product.healthScore.grade)} size="sm">
                  {product.healthScore.grade}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
        >
          <div className="text-center mb-4">
            <span className="text-6xl">{selectedProduct.emoji}</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">{selectedProduct.brand}</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(selectedProduct.price)}
              </p>
            </div>
            {selectedProduct.healthScore && (
              <ScoreGauge
                grade={selectedProduct.healthScore.grade}
                score={selectedProduct.healthScore.numericScore}
                size="lg"
              />
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedProduct.tags.map((tag) => (
              <Badge key={tag} size="sm">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Nutrition Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Nutrition Facts</h3>
            <p className="text-[11px] text-gray-400 mb-2">
              Serving Size: {selectedProduct.servingSize}
            </p>
            <div className="space-y-2">
              {[
                { label: 'Calories', value: `${selectedProduct.nutrition.calories}`, bold: true },
                { label: 'Total Fat', value: `${selectedProduct.nutrition.totalFat}g` },
                { label: 'Saturated Fat', value: `${selectedProduct.nutrition.saturatedFat}g`, indent: true },
                { label: 'Sodium', value: `${selectedProduct.nutrition.sodium}mg` },
                { label: 'Total Carbs', value: `${selectedProduct.nutrition.totalCarbs}g` },
                { label: 'Fiber', value: `${selectedProduct.nutrition.fiber}g`, indent: true },
                { label: 'Sugar', value: `${selectedProduct.nutrition.sugar}g`, indent: true },
                { label: 'Protein', value: `${selectedProduct.nutrition.protein}g` },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex justify-between text-sm ${
                    row.indent ? 'pl-4 text-gray-500' : 'text-gray-700'
                  } ${row.bold ? 'font-bold text-gray-900 border-b border-gray-200 pb-1' : ''}`}
                >
                  <span>{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Nutrition badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedProduct.nutrition.isOrganic && (
                <Badge variant="success" size="sm">🌱 Organic</Badge>
              )}
              {selectedProduct.nutrition.isWholeGrain && (
                <Badge variant="info" size="sm">🌾 Whole Grain</Badge>
              )}
              {selectedProduct.nutrition.isLowSodium && (
                <Badge variant="info" size="sm">🧂 Low Sodium</Badge>
              )}
              {selectedProduct.nutrition.isHighFiber && (
                <Badge variant="success" size="sm">💪 High Fiber</Badge>
              )}
              {selectedProduct.nutrition.isPlantBased && (
                <Badge variant="success" size="sm">🌿 Plant-Based</Badge>
              )}
            </div>
          </div>

          {/* Health Score breakdown */}
          {selectedProduct.healthScore && (
            <div className="mt-4 bg-green-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Health Score Breakdown</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Score</span>
                  <span className="font-bold">{selectedProduct.healthScore.numericScore}/100</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Positive Points</span>
                  <span className="font-medium text-green-600">+{selectedProduct.healthScore.positivePoints}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Negative Points</span>
                  <span className="font-medium text-red-500">-{selectedProduct.healthScore.negativePoints}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Bonus Points</span>
                  <span className="font-medium text-amber-600">+{selectedProduct.healthScore.bonusPoints}</span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </PageContainer>
  );
}
