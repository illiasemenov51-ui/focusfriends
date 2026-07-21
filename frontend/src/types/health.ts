export interface Checkin {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  energyLevel: number; // 1..5
  stressLevel: number; // 1..5
  moodLevel: number; // 1..5
  caloriesIntake: number | null;
  note: string | null;
}

export interface CheckinInput {
  date?: string;
  sleepHours: number;
  energyLevel: number;
  stressLevel: number;
  moodLevel: number;
  caloriesIntake?: number;
  note?: string;
}

export interface WeeklySummary {
  from: string;
  to: string;
  hasData: boolean;
  checkinsCount: number;
  avgSleepHours: number;
  avgEnergy: number;
  avgStress: number;
  avgMood: number;
  avgCalories: number | null;
  calorieGoal: number | null;
  loadIndex: number; // 0..100, выше = тяжелее неделя
  notes: string[];
}

export interface HealthSettings {
  shareWithFriends: boolean;
  calorieGoal: number | null;
}
