export type HealthGoal = 'weight_loss' | 'heart_health' | 'diabetes_management' | 'general_wellness' | 'muscle_building' | 'gut_health';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  healthGoals: HealthGoal[];
  onboardingComplete: boolean;
  createdAt: string;
  lastActiveAt: string;
}
