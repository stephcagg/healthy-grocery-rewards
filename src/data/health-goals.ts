import type { HealthGoal } from '../types/user';

export interface HealthGoalDefinition {
  id: HealthGoal;
  name: string;
  description: string;
  emoji: string;
}

export const HEALTH_GOALS: HealthGoalDefinition[] = [
  { id: 'weight_loss', name: 'Weight Loss', description: 'Focus on low-calorie, high-fiber foods', emoji: '🏃' },
  { id: 'heart_health', name: 'Heart Health', description: 'Reduce sodium and saturated fats', emoji: '❤️' },
  { id: 'diabetes_management', name: 'Diabetes Mgmt', description: 'Control sugar and carb intake', emoji: '🩺' },
  { id: 'general_wellness', name: 'General Wellness', description: 'Balanced nutrition for overall health', emoji: '🌟' },
  { id: 'muscle_building', name: 'Muscle Building', description: 'High protein, nutrient-dense foods', emoji: '💪' },
  { id: 'gut_health', name: 'Gut Health', description: 'Fiber-rich and fermented foods', emoji: '🦠' },
];

export const GOAL_MULTIPLIERS: Record<string, Record<string, number>> = {
  weight_loss: { low_calorie: 1.5, high_fiber: 1.3, fruits_vegetables: 1.4, lean_proteins: 1.2 },
  heart_health: { low_sodium: 1.5, low_saturated_fat: 1.4, whole_grains: 1.3, lean_proteins: 1.2 },
  diabetes_management: { low_sugar: 1.5, high_fiber: 1.4, whole_grains: 1.3, lean_proteins: 1.2 },
  general_wellness: { fruits_vegetables: 1.2, whole_grains: 1.1, lean_proteins: 1.1, dairy: 1.1 },
  muscle_building: { high_protein: 1.5, lean_proteins: 1.4, dairy: 1.2, whole_grains: 1.1 },
  gut_health: { high_fiber: 1.5, fermented: 1.4, fruits_vegetables: 1.3, whole_grains: 1.2 },
};
