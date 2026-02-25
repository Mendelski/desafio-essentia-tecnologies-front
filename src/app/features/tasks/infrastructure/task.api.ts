import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService } from '../../../core/http/api-client.service';
import { CreateTaskData, PaginatedTasks, Task, TaskFilter, UpdateTaskData } from '../domain/task.model';
import { CreateTaskDto, PaginatedTasksDto, TaskDto, UpdateTaskDto } from './task.dto';
import { TaskMapper } from './task.mapper';

/**
 * Infrastructure service for task API calls.
 * Handles all HTTP communication with the task endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskApiService {
  private readonly apiClient = inject(ApiClientService);

  /**
   * GET /tasks
   * Returns paginated list of tasks with optional filters
   */
  list(filter?: TaskFilter): Observable<PaginatedTasks> {
    const params: Record<string, string> = {};

    if (filter?.status) {
      params['status'] = filter.status;
    }
    if (filter?.page) {
      params['page'] = filter.page.toString();
    }

    return this.apiClient
      .get<PaginatedTasksDto>('/tasks', params)
      .pipe(map((response) => TaskMapper.toPaginatedTasks(response)));
  }

  /**
   * GET /tasks/:id
   * Returns a single task by ID
   */
  get(id: number): Observable<Task> {
    return this.apiClient
      .get<TaskDto>(`/tasks/${id}`)
      .pipe(map((response) => TaskMapper.toTask(response)));
  }

  /**
   * POST /tasks
   * Creates a new task
   */
  create(data: CreateTaskData): Observable<Task> {
    const payload: CreateTaskDto = {
      title: data.title,
      status: data.status,
      ...(data.description && { description: data.description }),
    };

    return this.apiClient
      .post<TaskDto, CreateTaskDto>('/tasks', payload)
      .pipe(map((response) => TaskMapper.toTask(response)));
  }

  /**
   * PUT /tasks/:id
   * Updates an existing task
   */
  update(id: number, data: UpdateTaskData): Observable<Task> {
    const payload: UpdateTaskDto = {};

    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.status !== undefined) payload.status = data.status;

    return this.apiClient
      .put<TaskDto, UpdateTaskDto>(`/tasks/${id}`, payload)
      .pipe(map((response) => TaskMapper.toTask(response)));
  }

  /**
   * DELETE /tasks/:id
   * Deletes a task
   */
  delete(id: number): Observable<void> {
    return this.apiClient.delete<void>(`/tasks/${id}`);
  }
}

