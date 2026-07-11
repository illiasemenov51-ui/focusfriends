import { apiClient } from "./client";
import type { CreateTaskRequest, PagedResponse, Task, TaskPriority, TaskStatus, UpdateTaskRequest } from "../types/task";
import type { FriendTask } from "../types/friend";

export const taskApi = {
  list: async (status?: TaskStatus, priority?: TaskPriority): Promise<Task[]> => {
    const response = await apiClient.get<PagedResponse<Task>>("/api/tasks", {
      params: { status, priority, size: 100 },
    });
    return response.data.content;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>("/api/tasks", data);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.put<Task>(`/api/tasks/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  complete: async (id: string): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/api/tasks/${id}/complete`);
    return response.data;
  },

  // Последние задачи друга (укороченная версия — без описания/дедлайна).
  listFriendRecent: async (friendId: string, limit = 5): Promise<FriendTask[]> => {
    const response = await apiClient.get<FriendTask[]>(`/api/tasks/friends/${friendId}/recent`, {
      params: { limit },
    });
    return response.data;
  },
};
