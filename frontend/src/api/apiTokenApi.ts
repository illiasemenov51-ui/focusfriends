import { apiClient } from "./client";
import type { ApiToken, CreatedApiToken } from "../types/apiToken";

export const apiTokenApi = {
  create: async (name: string): Promise<CreatedApiToken> => {
    const response = await apiClient.post<CreatedApiToken>("/api/auth/api-tokens", { name });
    return response.data;
  },

  list: async (): Promise<ApiToken[]> => {
    const response = await apiClient.get<ApiToken[]>("/api/auth/api-tokens");
    return response.data;
  },

  revoke: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/auth/api-tokens/${id}`);
  },
};
