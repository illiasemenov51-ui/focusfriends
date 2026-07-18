import { apiClient } from "./client";
import type { Checkin, CheckinInput, WeeklySummary } from "../types/health";

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

  getPrivacy: async (): Promise<boolean> => {
    const response = await apiClient.get<{ shareWithFriends: boolean }>("/api/health/privacy");
    return response.data.shareWithFriends;
  },

  setPrivacy: async (shareWithFriends: boolean): Promise<boolean> => {
    const response = await apiClient.put<{ shareWithFriends: boolean }>("/api/health/privacy", { shareWithFriends });
    return response.data.shareWithFriends;
  },
};
