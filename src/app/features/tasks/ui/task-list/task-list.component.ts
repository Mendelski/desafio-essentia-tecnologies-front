import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';

import { Task, TaskStatus } from '../../domain';
import { TaskFacade } from '../../application';
import { TaskActivityLogDialogComponent } from '../task-activity-log-dialog';
import { TaskFormDialogComponent } from '../task-form-dialog';

/**
 * Task list component.
 * Displays tasks with filtering, status toggle, edit and delete actions.
 */
@Component({
  selector: 'app-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardContent,
    MatButton,
    MatFabButton,
    MatIconButton,
    MatIcon,
    MatChipListbox,
    MatChipOption,
    MatProgressSpinner,
    MatTooltip,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private readonly taskFacade = inject(TaskFacade);
  private readonly dialog = inject(MatDialog);

  protected readonly tasks = this.taskFacade.tasks;
  protected readonly loading = this.taskFacade.loading;
  protected readonly error = this.taskFacade.error;
  protected readonly isEmpty = this.taskFacade.isEmpty;
  protected readonly saving = this.taskFacade.saving;
  protected readonly filter = this.taskFacade.filter;
  protected readonly displayedCount = this.taskFacade.displayedCount;

  ngOnInit(): void {
    this.taskFacade.loadTasks();
  }

  protected onFilterChange(status: TaskStatus | 'all'): void {
    this.taskFacade.filterByStatus(status === 'all' ? undefined : status);
  }

  protected onToggleStatus(task: Task): void {
    this.taskFacade.toggleTaskStatus(task);
  }

  protected onEdit(task: Task): void {
    this.dialog.open(TaskFormDialogComponent, {
      data: { task },
      width: '400px',
    });
  }

  protected onViewHistory(task: Task): void {
    this.dialog.open(TaskActivityLogDialogComponent, {
      data: { task },
      width: '480px',
    });
  }

  protected onDelete(task: Task): void {
    this.taskFacade.deleteTask(task.id);
  }

  protected onAdd(): void {
    this.dialog.open(TaskFormDialogComponent, {
      width: '400px',
    });
  }

  protected trackById(_index: number, task: Task): number {
    return task.id;
  }
}


