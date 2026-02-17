export type ProductCategory = 'fruits_vegetables' | 'whole_grains' | 'lean_proteins' | 'dairy' | 'snacks' | 'beverages' | 'frozen' | 'pantry';

export interface NutritionData {
  calories: number;
  totalFat: number;
  saturatedFat: number;
  sodium: number;
  totalCarbs: number;
  fiber: number;
  sugar: number;
  protein: number;
  isOrganic: boolean;
  isWholeGrain: boolean;
  isLowSodium: boolean;
  isHighFiber: boolean;
  isPlantBased: boolean;
}

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface HealthScore {
  grade: HealthGrade;
  numericScore: number;
  negativePoints: number;
  positivePoints: number;
  bonusPoints: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  servingSize: string;
  nutrition: NutritionData;
  healthScore?: HealthScore;
  emoji: string;
  availableAt: string[];
  tags: string[];
}
