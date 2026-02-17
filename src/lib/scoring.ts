import type { NutritionData, HealthScore, HealthGrade, ProductCategory } from '@/types/product';

const SUGAR_THRESHOLDS = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];
const SAT_FAT_THRESHOLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SODIUM_THRESHOLDS = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];
const CALORIES_THRESHOLDS = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const FIBER_THRESHOLDS = [0.9, 1.9, 2.8, 3.7, 4.7];
const PROTEIN_THRESHOLDS = [1.6, 3.2, 4.8, 6.4, 8.0];

function getThresholdScore(value: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i;
  }
  return thresholds.length;
}

export function calculateHealthScore(
  nutrition: NutritionData,
  category: ProductCategory
): HealthScore {
  // Stage 1: Negative points (0-40)
  const sugarPts = getThresholdScore(nutrition.sugar, SUGAR_THRESHOLDS);
  const satFatPts = getThresholdScore(nutrition.saturatedFat, SAT_FAT_THRESHOLDS);
  const sodiumPts = getThresholdScore(nutrition.sodium, SODIUM_THRESHOLDS);
  const caloriePts = getThresholdScore(nutrition.calories, CALORIES_THRESHOLDS);
  const negativePoints = sugarPts + satFatPts + sodiumPts + caloriePts;

  // Stage 2: Positive points (0-15)
  const fiberPts = getThresholdScore(nutrition.fiber, FIBER_THRESHOLDS);
  const proteinPts = getThresholdScore(nutrition.protein, PROTEIN_THRESHOLDS);
  const fruitVegPts = category === 'fruits_vegetables' ? 5 : 0;
  const positivePoints =
    Math.min(5, fiberPts) + Math.min(5, proteinPts) + fruitVegPts;

  // Stage 3: Raw score and grade
  const rawScore = negativePoints - positivePoints;
  let grade: HealthGrade;
  if (rawScore <= -1) grade = 'A';
  else if (rawScore <= 2) grade = 'B';
  else if (rawScore <= 10) grade = 'C';
  else if (rawScore <= 18) grade = 'D';
  else grade = 'F';

  // Normalize to 0-100
  let numericScore = Math.max(
    0,
    Math.min(100, Math.round(100 - ((rawScore + 15) / 55) * 100))
  );

  // Stage 4: Bonus points
  let bonusPoints = 0;
  if (nutrition.isOrganic) bonusPoints += 3;
  if (nutrition.isWholeGrain) bonusPoints += 2;
  if (nutrition.isLowSodium) bonusPoints += 2;
  if (nutrition.isHighFiber) bonusPoints += 2;
  if (nutrition.isPlantBased) bonusPoints += 1;
  bonusPoints = Math.min(10, bonusPoints);

  numericScore = Math.min(100, numericScore + bonusPoints);

  return {
    grade,
    numericScore,
    negativePoints,
    positivePoints,
    bonusPoints,
  };
}

export function getScoreColor(grade: HealthGrade): string {
  const colors: Record<HealthGrade, string> = {
    A: '#16A34A',
    B: '#84CC16',
    C: '#EAB308',
    D: '#F97316',
    F: '#EF4444',
  };
  return colors[grade];
}

export function getGradeLabel(grade: HealthGrade): string {
  const labels: Record<HealthGrade, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Average',
    D: 'Poor',
    F: 'Unhealthy',
  };
  return labels[grade];
}
