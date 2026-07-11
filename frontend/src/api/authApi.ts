import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  UserProfile,
} from "../types/auth";

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

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post("/api/auth/verify-email", { token });
  },

  resendVerification: async (): Promise<void> => {
    await apiClient.post("/api/auth/resend-verification");
  },

  requestPasswordReset: async (data: RequestPasswordResetRequest): Promise<void> => {
    await apiClient.post("/api/auth/request-password-reset", data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post("/api/auth/reset-password", data);
  },
};
