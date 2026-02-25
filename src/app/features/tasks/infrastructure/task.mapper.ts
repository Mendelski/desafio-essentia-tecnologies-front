import { PaginatedTasks, Task } from '../domain/task.model';
import { PaginatedTasksDto, TaskDto } from './task.dto';

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
}

