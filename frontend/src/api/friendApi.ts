import { apiClient } from "./client";
import type { FriendshipResponse } from "../types/friend";

export const friendApi = {
  // Принятые дружбы текущего пользователя.
  listAccepted: async (): Promise<FriendshipResponse[]> => {
    const response = await apiClient.get<FriendshipResponse[]>("/api/friends");
    return response.data;
  },

  // Входящие заявки, ожидающие решения текущего пользователя.
  listPending: async (): Promise<FriendshipResponse[]> => {
    const response = await apiClient.get<FriendshipResponse[]>("/api/friends/pending");
    return response.data;
  },

  sendRequest: async (userId: string): Promise<FriendshipResponse> => {
    const response = await apiClient.post<FriendshipResponse>(`/api/friends/request/${userId}`);
    return response.data;
  },

  accept: async (requestId: string): Promise<FriendshipResponse> => {
    const response = await apiClient.post<FriendshipResponse>(`/api/friends/accept/${requestId}`);
    return response.data;
  },
};
