/**
 * Domain model representing a task
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'pending' | 'completed';

/**
 * Data required to create a new task
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskStatus;
}

/**
 * Data required to update an existing task
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Filter options for listing tasks
 */
export interface TaskFilter {
  status?: TaskStatus;
  page?: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedTasks {
  data: Task[];
  currentPage: number;
  lastPage: number;
  total: number;
}

