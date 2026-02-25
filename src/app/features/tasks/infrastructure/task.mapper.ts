import { PaginatedActivityLog, PaginatedTasks, Task, TaskActivityLog } from '../domain';
import { PaginatedActivityLogDto, PaginatedTasksDto, TaskActivityLogDto, TaskDto } from './task.dto';

/**
 * Mapper functions to convert between DTOs and domain models
 */
export class TaskMapper {
  static toTask(dto: TaskDto): Task {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  }

  static toPaginatedTasks(dto: PaginatedTasksDto): PaginatedTasks {
    return {
      data: dto.data.map((task) => TaskMapper.toTask(task)),
      currentPage: dto.current_page,
      lastPage: dto.last_page,
      total: dto.total,
    };
  }

  static toActivityLog(dto: TaskActivityLogDto): TaskActivityLog {
    return {
      id: dto.id,
      taskId: dto.task_id,
      userId: dto.user_id,
      action: dto.action,
      before: dto.before,
      after: dto.after,
      timestamp: new Date(dto.timestamp),
      metadata: {
        ip: dto.metadata.ip,
        userAgent: dto.metadata.user_agent,
      },
    };
  }

  static toPaginatedActivityLog(dto: PaginatedActivityLogDto): PaginatedActivityLog {
    return {
      data: (dto.data ?? []).map((log) => TaskMapper.toActivityLog(log)),
      nextCursor: dto.meta?.next_cursor ?? null,
      prevCursor: dto.meta?.prev_cursor ?? null,
    };
  }
}

