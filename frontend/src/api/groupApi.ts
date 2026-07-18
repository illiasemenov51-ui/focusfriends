import { apiClient } from "./client";
import type { Group, GroupMember } from "../types/group";

export const groupApi = {
  create: async (name: string): Promise<Group> => {
    const response = await apiClient.post<Group>("/api/groups", { name });
    return response.data;
  },

  join: async (groupId: string): Promise<GroupMember> => {
    const response = await apiClient.post<GroupMember>(`/api/groups/${groupId}/join`);
    return response.data;
  },

  listMine: async (): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>("/api/groups/mine");
    return response.data;
  },

  listMembers: async (groupId: string): Promise<GroupMember[]> => {
    const response = await apiClient.get<GroupMember[]>(`/api/groups/${groupId}/members`);
    return response.data;
  },
};
