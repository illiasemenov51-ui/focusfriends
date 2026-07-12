import { apiClient } from "./client";
import type { CreateHabitRequest, Habit, HabitLogResponse, StreakResponse } from "../types/habit";
import type { CalendarDay } from "../types/friend";

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

  // Свой календарь выполнения привычек за диапазон дат (YYYY-MM-DD).
  getCalendar: async (from: string, to: string): Promise<CalendarDay[]> => {
    const response = await apiClient.get<CalendarDay[]>("/api/habits/calendar", { params: { from, to } });
    return response.data;
  },

  // Календарь друга за диапазон дат — только для принятых дружб.
  getFriendCalendar: async (friendId: string, from: string, to: string): Promise<CalendarDay[]> => {
    const response = await apiClient.get<CalendarDay[]>(`/api/habits/friends/${friendId}/calendar`, {
      params: { from, to },
    });
    return response.data;
  },
};
