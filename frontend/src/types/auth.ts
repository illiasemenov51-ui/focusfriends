export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  email: string | null;
  emailVerified: boolean;
  createdAt: string;
}
