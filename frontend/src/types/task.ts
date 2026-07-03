export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  deadline?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  deadline?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
