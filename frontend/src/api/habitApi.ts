import { apiClient } from "./client";
import type { CreateHabitRequest, Habit, HabitLogResponse, StreakResponse } from "../types/habit";

export const habitApi = {
  list: async (): Promise<Habit[]> => {
    const response = await apiClient.get<Habit[]>("/api/habits");
    return response.data;
  },

  create: async (data: CreateHabitRequest): Promise<Habit> => {
    const response = await apiClient.post<Habit>("/api/habits", data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/habits/${id}`);
  },

  logToday: async (id: string): Promise<HabitLogResponse> => {
    const response = await apiClient.patch<HabitLogResponse>(`/api/habits/${id}/log`);
    return response.data;
  },

  getStreak: async (id: string): Promise<StreakResponse> => {
    const response = await apiClient.get<StreakResponse>(`/api/habits/${id}/streak`);
    return response.data;
  },
};
