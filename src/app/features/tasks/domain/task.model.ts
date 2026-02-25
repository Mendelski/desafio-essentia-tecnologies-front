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
 * Domain model representing a task activity log entry
 */
export interface TaskActivityLog {
  id: string;
  taskId: number;
  userId: number;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: Date;
  metadata: {
    ip: string;
    userAgent: string;
  };
}

/**
 * Filter options for activity log
 */
export interface ActivityLogFilter {
  startDate?: string;
  endDate?: string;
  cursor?: string;
}

/**
 * Paginated activity log response with cursor pagination
 */
export interface PaginatedActivityLog {
  data: TaskActivityLog[];
  nextCursor: string | null;
  prevCursor: string | null;
}

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

