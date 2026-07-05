import { apiClient } from "./client";
import type { UserProfile } from "../types/auth";

export const userApi = {
  getPublicProfile: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/api/users/${id}`);
    return response.data;
  },
};
