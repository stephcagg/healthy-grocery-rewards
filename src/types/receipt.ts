export interface ReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  priceEach: number;
  lineTotal: number;
  pointsEarned: number;
}

export interface Receipt {
  id: string;
  storeId: string;
  items: ReceiptItem[];
  subtotal: number;
  totalPoints: number;
  bonusPoints: number;
  scannedAt: string;
  method: 'scan' | 'manual';
}
