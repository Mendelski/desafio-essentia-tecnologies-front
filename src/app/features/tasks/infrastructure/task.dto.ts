import { TaskStatus } from '../domain/task.model';

/**
 * DTO for task from API response
 */
export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for paginated tasks response
 */
export interface PaginatedTasksDto {
  data: TaskDto[];
  current_page: number;
  last_page: number;
  total: number;
}

/**
 * DTO for creating a task
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
}

/**
 * DTO for updating a task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

