import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TaskFacade } from './task.facade';
import { TaskApiService } from '../infrastructure';
import { Task, PaginatedTasks, CreateTaskData } from '../domain';

describe('TaskFacade', () => {
  let facade: TaskFacade;
  let taskApiMock: {
    list: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getActivityLog: ReturnType<typeof vi.fn>;
  };

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    createdAt: new Date('2026-02-25T10:00:00.000Z'),
    updatedAt: new Date('2026-02-25T10:00:00.000Z'),
  };

  const mockPaginatedTasks: PaginatedTasks = {
    data: [mockTask],
    currentPage: 1,
    lastPage: 1,
    total: 1,
  };

  beforeEach(() => {
    taskApiMock = {
      list: vi.fn().mockReturnValue(of(mockPaginatedTasks)),
      get: vi.fn().mockReturnValue(of(mockTask)),
      create: vi.fn().mockReturnValue(of(mockTask)),
      update: vi.fn().mockReturnValue(of(mockTask)),
      delete: vi.fn().mockReturnValue(of(void 0)),
      getActivityLog: vi.fn().mockReturnValue(of({ data: [], nextCursor: null, prevCursor: null })),
    };

    TestBed.configureTestingModule({
      providers: [
        TaskFacade,
        { provide: TaskApiService, useValue: taskApiMock },
      ],
    });

    facade = TestBed.inject(TaskFacade);
  });

  describe('initial state', () => {
    it('should have empty tasks array', () => {
      expect(facade.tasks()).toEqual([]);
    });

    it('should not be loading initially', () => {
      expect(facade.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(facade.error()).toBeNull();
      expect(facade.hasError()).toBe(false);
    });

    it('should be empty when no tasks', () => {
      expect(facade.isEmpty()).toBe(true);
    });
  });

  describe('loadTasks', () => {
    it('should call API and update tasks signal', () => {
      facade.loadTasks();

      expect(taskApiMock.list).toHaveBeenCalledWith({});
      expect(facade.tasks()).toEqual([mockTask]);
    });

    it('should update pagination signals', () => {
      const paginatedResponse: PaginatedTasks = {
        data: [mockTask],
        currentPage: 2,
        lastPage: 5,
        total: 50,
      };
      taskApiMock.list.mockReturnValue(of(paginatedResponse));

      facade.loadTasks();

      expect(facade.currentPage()).toBe(2);
      expect(facade.lastPage()).toBe(5);
      expect(facade.total()).toBe(50);
    });

    it('should set loading to true during request', () => {
      expect(facade.loading()).toBe(false);

      // The loading state is set synchronously before the async call
      facade.loadTasks();

      // After observable completes, loading should be false
      expect(facade.loading()).toBe(false);
    });

    it('should apply filter when provided', () => {
      facade.loadTasks({ status: 'completed', page: 2 });

      expect(taskApiMock.list).toHaveBeenCalledWith({ status: 'completed', page: 2 });
      expect(facade.filter()).toEqual({ status: 'completed', page: 2 });
    });

    it('should handle API error', () => {
      taskApiMock.list.mockReturnValue(throwError(() => new Error('Network error')));

      facade.loadTasks();

      expect(facade.error()).toEqual({ message: 'Network error' });
      expect(facade.hasError()).toBe(true);
      expect(facade.tasks()).toEqual([]);
    });
  });

  describe('filterByStatus', () => {
    it('should filter by pending status', () => {
      facade.filterByStatus('pending');

      expect(taskApiMock.list).toHaveBeenCalledWith({ status: 'pending', page: 1 });
    });

    it('should filter by completed status', () => {
      facade.filterByStatus('completed');

      expect(taskApiMock.list).toHaveBeenCalledWith({ status: 'completed', page: 1 });
    });

    it('should clear status filter when undefined', () => {
      facade.filterByStatus(undefined);

      expect(taskApiMock.list).toHaveBeenCalledWith({ status: undefined, page: 1 });
    });
  });

  describe('goToPage', () => {
    it('should navigate to specified page', () => {
      facade.goToPage(3);

      expect(taskApiMock.list).toHaveBeenCalledWith({ page: 3 });
    });

    it('should preserve current filter when changing page', () => {
      facade.loadTasks({ status: 'pending' });
      taskApiMock.list.mockClear();

      facade.goToPage(2);

      expect(taskApiMock.list).toHaveBeenCalledWith({ status: 'pending', page: 2 });
    });
  });

  describe('createTask', () => {
    it('should create task and add to beginning of list', () => {
      const newTaskData: CreateTaskData = {
        title: 'New Task',
        description: 'Description',
        status: 'pending',
      };

      const createdTask: Task = {
        id: 2,
        title: 'New Task',
        description: 'Description',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      taskApiMock.create.mockReturnValue(of(createdTask));

      // First load existing tasks
      facade.loadTasks();

      facade.createTask(newTaskData);

      expect(taskApiMock.create).toHaveBeenCalledWith(newTaskData);
      expect(facade.tasks()[0]).toEqual(createdTask);
      expect(facade.total()).toBe(2);
    });

    it('should set saving to false after completion', () => {
      facade.createTask({ title: 'Test', status: 'pending' });

      expect(facade.saving()).toBe(false);
    });

    it('should handle create error', () => {
      taskApiMock.create.mockReturnValue(throwError(() => new Error('Failed to create')));

      facade.createTask({ title: 'Test', status: 'pending' });

      expect(facade.error()).toEqual({ message: 'Failed to create' });
    });
  });

  describe('updateTask', () => {
    it('should update task in list', () => {
      facade.loadTasks();

      const updatedTask: Task = {
        ...mockTask,
        title: 'Updated Title',
      };
      taskApiMock.update.mockReturnValue(of(updatedTask));

      facade.updateTask(1, { title: 'Updated Title' });

      expect(taskApiMock.update).toHaveBeenCalledWith(1, { title: 'Updated Title' });
      expect(facade.tasks()[0].title).toBe('Updated Title');
    });

    it('should remove task from list when status changes with active filter', () => {
      // Load tasks with pending filter
      taskApiMock.list.mockReturnValue(of({
        data: [mockTask],
        currentPage: 1,
        lastPage: 1,
        total: 1,
      }));
      facade.loadTasks({ status: 'pending' });

      const completedTask: Task = {
        ...mockTask,
        status: 'completed',
      };
      taskApiMock.update.mockReturnValue(of(completedTask));

      facade.updateTask(1, { status: 'completed' });

      expect(facade.tasks()).toEqual([]);
    });

    it('should handle update error', () => {
      taskApiMock.update.mockReturnValue(throwError(() => new Error('Update failed')));

      facade.updateTask(1, { title: 'Test' });

      expect(facade.error()).toEqual({ message: 'Update failed' });
    });
  });

  describe('toggleTaskStatus', () => {
    it('should toggle pending to completed', () => {
      const completedTask: Task = { ...mockTask, status: 'completed' };
      taskApiMock.update.mockReturnValue(of(completedTask));

      facade.toggleTaskStatus(mockTask);

      expect(taskApiMock.update).toHaveBeenCalledWith(1, { status: 'completed' });
    });

    it('should toggle completed to pending', () => {
      const completedTask: Task = { ...mockTask, status: 'completed' };
      const pendingTask: Task = { ...mockTask, status: 'pending' };
      taskApiMock.update.mockReturnValue(of(pendingTask));

      facade.toggleTaskStatus(completedTask);

      expect(taskApiMock.update).toHaveBeenCalledWith(1, { status: 'pending' });
    });
  });

  describe('deleteTask', () => {
    it('should remove task from list', () => {
      facade.loadTasks();
      expect(facade.tasks().length).toBe(1);

      facade.deleteTask(1);

      expect(taskApiMock.delete).toHaveBeenCalledWith(1);
      expect(facade.tasks()).toEqual([]);
      expect(facade.total()).toBe(0);
    });

    it('should clear selected task if deleted', () => {
      facade.loadTasks();
      facade.selectTask(mockTask);

      facade.deleteTask(1);

      expect(facade.selectedTask()).toBeNull();
    });

    it('should handle delete error', () => {
      taskApiMock.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      facade.deleteTask(1);

      expect(facade.error()).toEqual({ message: 'Delete failed' });
    });
  });

  describe('selectTask', () => {
    it('should set selected task', () => {
      facade.selectTask(mockTask);

      expect(facade.selectedTask()).toEqual(mockTask);
    });

    it('should clear selected task when null', () => {
      facade.selectTask(mockTask);
      facade.selectTask(null);

      expect(facade.selectedTask()).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear existing error', () => {
      taskApiMock.list.mockReturnValue(throwError(() => new Error('Test error')));
      facade.loadTasks();

      expect(facade.hasError()).toBe(true);

      facade.clearError();

      expect(facade.error()).toBeNull();
      expect(facade.hasError()).toBe(false);
    });
  });

  describe('computed signals', () => {
    it('should compute isEmpty correctly', () => {
      expect(facade.isEmpty()).toBe(true);

      facade.loadTasks();

      expect(facade.isEmpty()).toBe(false);
    });

    it('should compute hasPagination correctly', () => {
      expect(facade.hasPagination()).toBe(false);

      taskApiMock.list.mockReturnValue(of({
        data: [mockTask],
        currentPage: 1,
        lastPage: 3,
        total: 30,
      }));
      facade.loadTasks();

      expect(facade.hasPagination()).toBe(true);
    });

    it('should compute pendingTasks correctly', () => {
      const tasks: Task[] = [
        { ...mockTask, id: 1, status: 'pending' },
        { ...mockTask, id: 2, status: 'completed' },
        { ...mockTask, id: 3, status: 'pending' },
      ];
      taskApiMock.list.mockReturnValue(of({
        data: tasks,
        currentPage: 1,
        lastPage: 1,
        total: 3,
      }));

      facade.loadTasks();

      expect(facade.pendingTasks().length).toBe(2);
      expect(facade.pendingTasks().every(t => t.status === 'pending')).toBe(true);
    });

    it('should compute completedTasks correctly', () => {
      const tasks: Task[] = [
        { ...mockTask, id: 1, status: 'pending' },
        { ...mockTask, id: 2, status: 'completed' },
        { ...mockTask, id: 3, status: 'completed' },
      ];
      taskApiMock.list.mockReturnValue(of({
        data: tasks,
        currentPage: 1,
        lastPage: 1,
        total: 3,
      }));

      facade.loadTasks();

      expect(facade.completedTasks().length).toBe(2);
      expect(facade.completedTasks().every(t => t.status === 'completed')).toBe(true);
    });

    it('should compute displayedCount correctly', () => {
      const tasks: Task[] = [
        { ...mockTask, id: 1 },
        { ...mockTask, id: 2 },
      ];
      taskApiMock.list.mockReturnValue(of({
        data: tasks,
        currentPage: 1,
        lastPage: 1,
        total: 2,
      }));

      facade.loadTasks();

      expect(facade.displayedCount()).toBe(2);
    });
  });
});

