export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum Goal {
  LoseWeight = 'Lose Weight',
  Maintain = 'Maintain',
  GainMuscle = 'Gain Muscle'
}

export enum ActivityLevel {
  Sedentary = 'Sedentary',
  Light = 'Lightly Active',
  Moderate = 'Moderately Active',
  Active = 'Very Active'
}

export enum DietaryPreference {
  None = 'None',
  Vegan = 'Vegan',
  Vegetarian = 'Vegetarian',
  Keto = 'Keto',
  Paleo = 'Paleo',
  Halal = 'Halal'
}

export type PaymentStatus = 'none' | 'pending' | 'approved';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  goal: Goal;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  allergies: string;
  isPremium: boolean;
  paymentStatus: PaymentStatus;
  lastTransactionId?: string; // To store the submitted ref ID
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealItem {
  name: string;
  description: string;
  calories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

export interface DailyPlan {
  day: string;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack: MealItem;
  totalMacros: MacroNutrients;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}