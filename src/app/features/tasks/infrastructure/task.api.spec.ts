import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { TaskApiService } from './task.api';
import { ApiClientService } from '../../../core';
import { PaginatedTasksDto, SingleTaskResponseDto, PaginatedActivityLogDto } from './task.dto';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let apiClientMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockTaskDto = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending' as const,
    created_at: '2026-02-25T10:00:00.000Z',
    updated_at: '2026-02-25T10:00:00.000Z',
  };

  beforeEach(() => {
    apiClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TaskApiService,
        { provide: ApiClientService, useValue: apiClientMock },
      ],
    });

    service = TestBed.inject(TaskApiService);
  });

  describe('list', () => {
    const mockPaginatedResponse: PaginatedTasksDto = {
      data: [mockTaskDto],
      current_page: 1,
      last_page: 1,
      total: 1,
    };

    it('should call API without params when no filter', async () => {
      apiClientMock.get.mockReturnValue(of(mockPaginatedResponse));

      const result = await firstValueFrom(service.list());

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks', {});
      expect(result.data).toHaveLength(1);
      expect(result.currentPage).toBe(1);
    });

    it('should include status param when filtering by status', async () => {
      apiClientMock.get.mockReturnValue(of(mockPaginatedResponse));

      await firstValueFrom(service.list({ status: 'pending' }));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks', { status: 'pending' });
    });

    it('should include page param when specified', async () => {
      apiClientMock.get.mockReturnValue(of(mockPaginatedResponse));

      await firstValueFrom(service.list({ page: 2 }));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks', { page: '2' });
    });

    it('should include both status and page params', async () => {
      apiClientMock.get.mockReturnValue(of(mockPaginatedResponse));

      await firstValueFrom(service.list({ status: 'completed', page: 3 }));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks', { status: 'completed', page: '3' });
    });

    it('should map response to domain model', async () => {
      apiClientMock.get.mockReturnValue(of(mockPaginatedResponse));

      const result = await firstValueFrom(service.list());

      expect(result.data[0].createdAt).toBeInstanceOf(Date);
      expect(result.data[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('get', () => {
    const mockResponse: SingleTaskResponseDto = { data: mockTaskDto };

    it('should call API with correct endpoint', async () => {
      apiClientMock.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.get(1));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks/1');
    });

    it('should map response to domain model', async () => {
      apiClientMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.get(1));

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Task');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    const mockResponse: SingleTaskResponseDto = { data: mockTaskDto };

    it('should call API with correct payload', async () => {
      apiClientMock.post.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.create({ title: 'New Task', status: 'pending' }));

      expect(apiClientMock.post).toHaveBeenCalledWith('/tasks', {
        title: 'New Task',
        status: 'pending',
      });
    });

    it('should include description when provided', async () => {
      apiClientMock.post.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.create({ title: 'New Task', description: 'Desc', status: 'pending' }));

      expect(apiClientMock.post).toHaveBeenCalledWith('/tasks', {
        title: 'New Task',
        description: 'Desc',
        status: 'pending',
      });
    });

    it('should not include description when empty', async () => {
      apiClientMock.post.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.create({ title: 'New Task', description: '', status: 'pending' }));

      expect(apiClientMock.post).toHaveBeenCalledWith('/tasks', {
        title: 'New Task',
        status: 'pending',
      });
    });

    it('should return mapped task', async () => {
      apiClientMock.post.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.create({ title: 'Test', status: 'pending' }));

      expect(result.id).toBe(1);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    const mockResponse: SingleTaskResponseDto = { data: mockTaskDto };

    it('should call API with correct endpoint and payload', async () => {
      apiClientMock.put.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.update(1, { title: 'Updated' }));

      expect(apiClientMock.put).toHaveBeenCalledWith('/tasks/1', { title: 'Updated' });
    });

    it('should include only provided fields', async () => {
      apiClientMock.put.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.update(1, { status: 'completed' }));

      expect(apiClientMock.put).toHaveBeenCalledWith('/tasks/1', { status: 'completed' });
    });

    it('should include all fields when all provided', async () => {
      apiClientMock.put.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.update(1, { title: 'New', description: 'Desc', status: 'completed' }));

      expect(apiClientMock.put).toHaveBeenCalledWith('/tasks/1', {
        title: 'New',
        description: 'Desc',
        status: 'completed',
      });
    });
  });

  describe('delete', () => {
    it('should call API with correct endpoint', async () => {
      apiClientMock.delete.mockReturnValue(of(void 0));

      await firstValueFrom(service.delete(1));

      expect(apiClientMock.delete).toHaveBeenCalledWith('/tasks/1');
    });
  });

  describe('getActivityLog', () => {
    const mockActivityLogResponse: PaginatedActivityLogDto = {
      data: [
        {
          id: 'log-1',
          task_id: 1,
          user_id: 42,
          action: 'created',
          before: null,
          after: { title: 'Test' },
          timestamp: '2026-02-25T10:00:00.000Z',
          metadata: { ip: '127.0.0.1', user_agent: 'Test' },
        },
      ],
      links: { first: null, last: null, prev: null, next: null },
      meta: { path: '/tasks/1/activity-log', per_page: 10, next_cursor: null, prev_cursor: null },
    };

    it('should call API with correct endpoint', async () => {
      apiClientMock.get.mockReturnValue(of(mockActivityLogResponse));

      await firstValueFrom(service.getActivityLog(1));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks/1/activity-log', {});
    });

    it('should include date filters when provided', async () => {
      apiClientMock.get.mockReturnValue(of(mockActivityLogResponse));

      await firstValueFrom(service.getActivityLog(1, { startDate: '2026-01-01', endDate: '2026-02-28' }));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks/1/activity-log', {
        start_date: '2026-01-01',
        end_date: '2026-02-28',
      });
    });

    it('should include cursor when provided', async () => {
      apiClientMock.get.mockReturnValue(of(mockActivityLogResponse));

      await firstValueFrom(service.getActivityLog(1, { cursor: 'next-cursor' }));

      expect(apiClientMock.get).toHaveBeenCalledWith('/tasks/1/activity-log', {
        cursor: 'next-cursor',
      });
    });

    it('should map response to domain model', async () => {
      apiClientMock.get.mockReturnValue(of(mockActivityLogResponse));

      const result = await firstValueFrom(service.getActivityLog(1));

      expect(result.data[0].timestamp).toBeInstanceOf(Date);
      expect(result.data[0].metadata.userAgent).toBe('Test');
    });
  });
});

