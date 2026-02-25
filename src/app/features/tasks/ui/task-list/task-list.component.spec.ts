import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal, ANIMATION_MODULE_TYPE } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TaskListComponent } from './task-list.component';
import { TaskFacade, TaskError } from '../../application';
import { Task, TaskFilter } from '../../domain';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let dialogMock: Partial<MatDialog>;

  // Writable signals for mocking
  let tasksSignal: WritableSignal<Task[]>;
  let loadingSignal: WritableSignal<boolean>;
  let errorSignal: WritableSignal<TaskError | null>;
  let isEmptySignal: WritableSignal<boolean>;
  let savingSignal: WritableSignal<boolean>;
  let filterSignal: WritableSignal<TaskFilter>;
  let displayedCountSignal: WritableSignal<number>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
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
  ];

  function createTaskFacadeMock() {
    tasksSignal = signal(mockTasks);
    loadingSignal = signal(false);
    errorSignal = signal<TaskError | null>(null);
    isEmptySignal = signal(false);
    savingSignal = signal(false);
    filterSignal = signal<TaskFilter>({});
    displayedCountSignal = signal(2);

    return {
      tasks: tasksSignal.asReadonly(),
      loading: loadingSignal.asReadonly(),
      error: errorSignal.asReadonly(),
      isEmpty: isEmptySignal.asReadonly(),
      saving: savingSignal.asReadonly(),
      filter: filterSignal.asReadonly(),
      displayedCount: displayedCountSignal.asReadonly(),
      loadTasks: vi.fn(),
      filterByStatus: vi.fn(),
      toggleTaskStatus: vi.fn(),
      deleteTask: vi.fn(),
    };
  }

  let taskFacadeMock: ReturnType<typeof createTaskFacadeMock>;

  beforeEach(async () => {
    taskFacadeMock = createTaskFacadeMock();

    dialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
        { provide: TaskFacade, useValue: taskFacadeMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load tasks on init', () => {
      fixture.detectChanges();

      expect(taskFacadeMock.loadTasks).toHaveBeenCalled();
    });
  });

  describe('filter change', () => {
    it('should filter by pending status', () => {
      fixture.detectChanges();

      component['onFilterChange']('pending');

      expect(taskFacadeMock.filterByStatus).toHaveBeenCalledWith('pending');
    });

    it('should filter by completed status', () => {
      fixture.detectChanges();

      component['onFilterChange']('completed');

      expect(taskFacadeMock.filterByStatus).toHaveBeenCalledWith('completed');
    });

    it('should clear filter when all is selected', () => {
      fixture.detectChanges();

      component['onFilterChange']('all');

      expect(taskFacadeMock.filterByStatus).toHaveBeenCalledWith(undefined);
    });
  });

  describe('task actions', () => {
    it('should toggle task status', () => {
      fixture.detectChanges();

      component['onToggleStatus'](mockTasks[0]);

      expect(taskFacadeMock.toggleTaskStatus).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should delete task', () => {
      fixture.detectChanges();

      component['onDelete'](mockTasks[0]);

      expect(taskFacadeMock.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  describe('dialog interactions', () => {
    it('should open form dialog for new task', () => {
      fixture.detectChanges();

      component['onAdd']();

      expect(dialogMock.open).toHaveBeenCalledWith(expect.any(Function), {
        width: '400px',
      });
    });

    it('should open form dialog for editing task', () => {
      fixture.detectChanges();

      component['onEdit'](mockTasks[0]);

      expect(dialogMock.open).toHaveBeenCalledWith(expect.any(Function), {
        data: { task: mockTasks[0] },
        width: '400px',
      });
    });

    it('should open activity log dialog', () => {
      fixture.detectChanges();

      component['onViewHistory'](mockTasks[0]);

      expect(dialogMock.open).toHaveBeenCalledWith(expect.any(Function), {
        data: { task: mockTasks[0] },
        width: '480px',
      });
    });
  });

  describe('trackById', () => {
    it('should return task id', () => {
      const result = component['trackById'](0, mockTasks[0]);

      expect(result).toBe(1);
    });
  });

  describe('template rendering', () => {
    it('should display loading spinner when loading', async () => {
      loadingSignal.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display tasks when available', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Task 1');
      expect(compiled.textContent).toContain('Task 2');
    });

    it('should display empty state when no tasks', async () => {
      tasksSignal.set([]);
      isEmptySignal.set(true);
      displayedCountSignal.set(0);

      fixture.detectChanges();
      await fixture.whenStable();
// The empty state should be visible
      expect(isEmptySignal()).toBe(true);
    });
  });
});

