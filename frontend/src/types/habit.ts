export type HabitCategory = "STUDY" | "SPORT" | "READING" | "CODING" | "OTHER";
export type HabitFrequency = "DAILY" | "WEEKLY";

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  targetFrequency: HabitFrequency;
  createdAt: string;
}

export interface CreateHabitRequest {
  title: string;
  category: HabitCategory;
  targetFrequency?: HabitFrequency;
}

export interface HabitLogResponse {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface StreakResponse {
  habitId: string;
  currentStreak: number;
}
