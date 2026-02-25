import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';

import {
  CreateTaskData,
  PaginatedTasks,
  Task,
  TaskFilter,
  TaskStatus,
  UpdateTaskData,
} from '../domain/task.model';
import { TaskApiService } from '../infrastructure/task.api';

export interface TaskError {
  message: string;
  code?: string;
}

/**
 * Facade for task operations.
 * Orchestrates API calls and state management using signals.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskFacade {
  private readonly taskApi = inject(TaskApiService);

  // Private writable signals
  private readonly tasksSignal = signal<Task[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<TaskError | null>(null);
  private readonly currentPageSignal = signal(1);
  private readonly lastPageSignal = signal(1);
  private readonly totalSignal = signal(0);
  private readonly filterSignal = signal<TaskFilter>({});
  private readonly selectedTaskSignal = signal<Task | null>(null);
  private readonly savingSignal = signal(false);

  // Public readonly signals
  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly lastPage = this.lastPageSignal.asReadonly();
  readonly total = this.totalSignal.asReadonly();
  readonly filter = this.filterSignal.asReadonly();
  readonly selectedTask = this.selectedTaskSignal.asReadonly();
  readonly saving = this.savingSignal.asReadonly();

  // Computed signals
  readonly hasError = computed(() => this.errorSignal() !== null);
  readonly isEmpty = computed(() => this.tasksSignal().length === 0 && !this.loadingSignal());
  readonly hasPagination = computed(() => this.lastPageSignal() > 1);
  readonly pendingTasks = computed(() => this.tasksSignal().filter((t) => t.status === 'pending'));
  readonly completedTasks = computed(() => this.tasksSignal().filter((t) => t.status === 'completed'));

  /**
   * Loads tasks from the API with optional filters
   */
  loadTasks(filter?: TaskFilter): void {
    this.clearError();
    this.loadingSignal.set(true);

    if (filter) {
      this.filterSignal.set(filter);
    }

    this.taskApi
      .list(filter ?? this.filterSignal())
      .pipe(
        tap((response: PaginatedTasks) => {
          this.tasksSignal.set(response.data);
          this.currentPageSignal.set(response.currentPage);
          this.lastPageSignal.set(response.lastPage);
          this.totalSignal.set(response.total);
        }),
        catchError((error: Error) => {
          this.setError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Changes the status filter and reloads tasks
   */
  filterByStatus(status?: TaskStatus): void {
    this.loadTasks({ ...this.filterSignal(), status, page: 1 });
  }

  /**
   * Changes the current page and reloads tasks
   */
  goToPage(page: number): void {
    this.loadTasks({ ...this.filterSignal(), page });
  }

  /**
   * Creates a new task
   */
  createTask(data: CreateTaskData): void {
    this.clearError();
    this.savingSignal.set(true);

    this.taskApi
      .create(data)
      .pipe(
        tap((task) => {
          this.tasksSignal.update((tasks) => [task, ...tasks]);
          this.totalSignal.update((total) => total + 1);
        }),
        catchError((error: Error) => {
          this.setError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.savingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Updates an existing task
   */
  updateTask(id: number, data: UpdateTaskData): void {
    this.clearError();
    this.savingSignal.set(true);

    this.taskApi
      .update(id, data)
      .pipe(
        tap((updatedTask) => {
          this.tasksSignal.update((tasks) =>
            tasks.map((task) => (task.id === id ? updatedTask : task))
          );
          if (this.selectedTaskSignal()?.id === id) {
            this.selectedTaskSignal.set(updatedTask);
          }
        }),
        catchError((error: Error) => {
          this.setError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.savingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Toggles task status between pending and completed
   */
  toggleTaskStatus(task: Task): void {
    const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
    this.updateTask(task.id, { status: newStatus });
  }

  /**
   * Deletes a task
   */
  deleteTask(id: number): void {
    this.clearError();
    this.savingSignal.set(true);

    this.taskApi
      .delete(id)
      .pipe(
        tap(() => {
          this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
          this.totalSignal.update((total) => total - 1);
          if (this.selectedTaskSignal()?.id === id) {
            this.selectedTaskSignal.set(null);
          }
        }),
        catchError((error: Error) => {
          this.setError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.savingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Selects a task for editing
   */
  selectTask(task: Task | null): void {
    this.selectedTaskSignal.set(task);
  }

  /**
   * Clears any existing error
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  private setError(message: string, code?: string): void {
    this.errorSignal.set({ message, code });
  }
}

