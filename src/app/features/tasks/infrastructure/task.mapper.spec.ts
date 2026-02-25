import { describe, expect, it } from 'vitest';

import { PaginatedActivityLog, PaginatedTasks, Task, TaskActivityLog } from '../domain';
import { PaginatedActivityLogDto, PaginatedTasksDto, TaskActivityLogDto, TaskDto } from './task.dto';
import { TaskMapper } from './task.mapper';

describe('TaskMapper', () => {
  describe('toTask', () => {
    it('should map TaskDto to Task domain model', () => {
      const dto: TaskDto = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        created_at: '2026-02-25T10:00:00.000Z',
        updated_at: '2026-02-25T12:00:00.000Z',
      };

      const result = TaskMapper.toTask(dto);

      expect(result).toEqual<Task>({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        createdAt: new Date('2026-02-25T10:00:00.000Z'),
        updatedAt: new Date('2026-02-25T12:00:00.000Z'),
      });
    });

    it('should handle null description', () => {
      const dto: TaskDto = {
        id: 2,
        title: 'Task Without Description',
        description: null,
        status: 'completed',
        created_at: '2026-02-25T10:00:00.000Z',
        updated_at: '2026-02-25T10:00:00.000Z',
      };

      const result = TaskMapper.toTask(dto);

      expect(result.description).toBeNull();
    });

    it('should correctly map status completed', () => {
      const dto: TaskDto = {
        id: 3,
        title: 'Completed Task',
        description: null,
        status: 'completed',
        created_at: '2026-02-25T10:00:00.000Z',
        updated_at: '2026-02-25T10:00:00.000Z',
      };

      const result = TaskMapper.toTask(dto);

      expect(result.status).toBe('completed');
    });
  });

  describe('toPaginatedTasks', () => {
    it('should map PaginatedTasksDto to PaginatedTasks', () => {
      const dto: PaginatedTasksDto = {
        data: [
          {
            id: 1,
            title: 'Task 1',
            description: 'Desc 1',
            status: 'pending',
            created_at: '2026-02-25T10:00:00.000Z',
            updated_at: '2026-02-25T10:00:00.000Z',
          },
          {
            id: 2,
            title: 'Task 2',
            description: null,
            status: 'completed',
            created_at: '2026-02-25T11:00:00.000Z',
            updated_at: '2026-02-25T11:00:00.000Z',
          },
        ],
        current_page: 1,
        last_page: 3,
        total: 25,
      };

      const result = TaskMapper.toPaginatedTasks(dto);

      expect(result).toEqual<PaginatedTasks>({
        data: [
          {
            id: 1,
            title: 'Task 1',
            description: 'Desc 1',
            status: 'pending',
            createdAt: new Date('2026-02-25T10:00:00.000Z'),
            updatedAt: new Date('2026-02-25T10:00:00.000Z'),
          },
          {
            id: 2,
            title: 'Task 2',
            description: null,
            status: 'completed',
            createdAt: new Date('2026-02-25T11:00:00.000Z'),
            updatedAt: new Date('2026-02-25T11:00:00.000Z'),
          },
        ],
        currentPage: 1,
        lastPage: 3,
        total: 25,
      });
    });

    it('should handle empty data array', () => {
      const dto: PaginatedTasksDto = {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
      };

      const result = TaskMapper.toPaginatedTasks(dto);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('toActivityLog', () => {
    it('should map TaskActivityLogDto to TaskActivityLog', () => {
      const dto: TaskActivityLogDto = {
        id: 'log-123',
        task_id: 1,
        user_id: 42,
        action: 'created',
        before: null,
        after: { title: 'New Task' },
        timestamp: '2026-02-25T10:00:00.000Z',
        metadata: {
          ip: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
        },
      };

      const result = TaskMapper.toActivityLog(dto);

      expect(result).toEqual<TaskActivityLog>({
        id: 'log-123',
        taskId: 1,
        userId: 42,
        action: 'created',
        before: null,
        after: { title: 'New Task' },
        timestamp: new Date('2026-02-25T10:00:00.000Z'),
        metadata: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      });
    });

    it('should handle updated action with before and after values', () => {
      const dto: TaskActivityLogDto = {
        id: 'log-456',
        task_id: 1,
        user_id: 42,
        action: 'updated',
        before: { status: 'pending' },
        after: { status: 'completed' },
        timestamp: '2026-02-25T12:00:00.000Z',
        metadata: {
          ip: '10.0.0.1',
          user_agent: 'Chrome/120',
        },
      };

      const result = TaskMapper.toActivityLog(dto);

      expect(result.before).toEqual({ status: 'pending' });
      expect(result.after).toEqual({ status: 'completed' });
      expect(result.action).toBe('updated');
    });
  });

  describe('toPaginatedActivityLog', () => {
    it('should map PaginatedActivityLogDto to PaginatedActivityLog', () => {
      const dto: PaginatedActivityLogDto = {
        data: [
          {
            id: 'log-1',
            task_id: 1,
            user_id: 42,
            action: 'created',
            before: null,
            after: { title: 'Task' },
            timestamp: '2026-02-25T10:00:00.000Z',
            metadata: { ip: '127.0.0.1', user_agent: 'Test' },
          },
        ],
        links: {
          first: '/tasks/1/activity-log?cursor=first',
          last: '/tasks/1/activity-log?cursor=last',
          prev: null,
          next: '/tasks/1/activity-log?cursor=next',
        },
        meta: {
          path: '/api/v1/tasks/1/activity-log',
          per_page: 10,
          next_cursor: 'cursor-next',
          prev_cursor: null,
        },
      };

      const result = TaskMapper.toPaginatedActivityLog(dto);

      expect(result).toEqual<PaginatedActivityLog>({
        data: [
          {
            id: 'log-1',
            taskId: 1,
            userId: 42,
            action: 'created',
            before: null,
            after: { title: 'Task' },
            timestamp: new Date('2026-02-25T10:00:00.000Z'),
            metadata: { ip: '127.0.0.1', userAgent: 'Test' },
          },
        ],
        nextCursor: 'cursor-next',
        prevCursor: null,
      });
    });

    it('should handle empty data with null cursors', () => {
      const dto: PaginatedActivityLogDto = {
        data: [],
        links: { first: null, last: null, prev: null, next: null },
        meta: {
          path: '/api/v1/tasks/1/activity-log',
          per_page: 10,
          next_cursor: null,
          prev_cursor: null,
        },
      };

      const result = TaskMapper.toPaginatedActivityLog(dto);

      expect(result.data).toEqual([]);
      expect(result.nextCursor).toBeNull();
      expect(result.prevCursor).toBeNull();
    });
  });
});

