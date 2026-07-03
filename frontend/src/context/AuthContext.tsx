import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../api/tokenStorage";
import type { LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    if (!tokenStorage.getAccessToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(data: LoginRequest) {
    const auth = await authApi.login(data);
    tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    const profile = await authApi.getMe();
    setUser(profile);
  }

  async function register(data: RegisterRequest) {
    const auth = await authApi.register(data);
    tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    const profile = await authApi.getMe();
    setUser(profile);
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // даже если запрос не прошёл — локально всё равно разлогиниваем
    }
    tokenStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return ctx;
}
