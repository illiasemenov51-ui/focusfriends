import { apiClient } from "./client";
import type { Checkin, CheckinInput, HealthSettings, WeeklySummary } from "../types/health";

export const healthApi = {
  submitCheckin: async (input: CheckinInput): Promise<Checkin> => {
    const response = await apiClient.post<Checkin>("/api/health/checkins", input);
    return response.data;
  },

  listCheckins: async (from: string, to: string): Promise<Checkin[]> => {
    const response = await apiClient.get<Checkin[]>("/api/health/checkins", { params: { from, to } });
    return response.data;
  },

  getSummary: async (): Promise<WeeklySummary> => {
    const response = await apiClient.get<WeeklySummary>("/api/health/summary");
    return response.data;
  },

  getFriendSummary: async (friendId: string): Promise<WeeklySummary> => {
    const response = await apiClient.get<WeeklySummary>(`/api/health/friends/${friendId}/summary`);
    return response.data;
  },

  getSettings: async (): Promise<HealthSettings> => {
    const response = await apiClient.get<HealthSettings>("/api/health/settings");
    return response.data;
  },

  updateSettings: async (settings: HealthSettings): Promise<HealthSettings> => {
    const response = await apiClient.put<HealthSettings>("/api/health/settings", settings);
    return response.data;
  },
};
