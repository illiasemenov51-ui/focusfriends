import { apiClient } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>("/api/users/me");
    return response.data;
  },
};
