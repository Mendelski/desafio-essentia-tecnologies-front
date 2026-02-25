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
 * DTO for single task API response (wrapped in data)
 */
export interface SingleTaskResponseDto {
  data: TaskDto;
}

/**
 * DTO for task activity log entry from API response
 */
export interface TaskActivityLogDto {
  id: string;
  task_id: number;
  user_id: number;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
  metadata: {
    ip: string;
    user_agent: string;
  };
}

/**
 * DTO for paginated activity log response with cursor pagination
 */
export interface PaginatedActivityLogDto {
  data: TaskActivityLogDto[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    path: string;
    per_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
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

