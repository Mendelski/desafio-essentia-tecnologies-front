import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';

import { Task, TaskStatus } from '../../domain/task.model';
import { TaskFacade } from '../../application/task.facade';

export interface TaskFormDialogData {
  task?: Task;
}

/**
 * Dialog component for creating or editing a task.
 */
@Component({
  selector: 'app-task-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatPrefix,
    MatIcon,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatProgressSpinner,
  ],
  template: `
    <div class="dialog-header">
      <div class="dialog-title-wrapper">
        <div class="dialog-icon" [class.editing]="isEditing">
          <mat-icon>{{ isEditing ? 'edit_note' : 'add_task' }}</mat-icon>
        </div>
        <h2 mat-dialog-title>{{ isEditing ? 'Edit Task' : 'New Task' }}</h2>
      </div>
      <button mat-icon-button mat-dialog-close aria-label="Close dialog" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" id="task-form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <mat-icon matPrefix>title</mat-icon>
          <input
            matInput
            formControlName="title"
            autocomplete="off"
            placeholder="What needs to be done?"
            [attr.aria-describedby]="form.controls.title.invalid && form.controls.title.touched ? 'title-error' : null"
          />
          @if (form.controls.title.hasError('required') && form.controls.title.touched) {
            <mat-error id="title-error">Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <mat-icon matPrefix>notes</mat-icon>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Add more details (optional)"
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-icon matPrefix>flag</mat-icon>
          <mat-select formControlName="status">
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button type="button" mat-dialog-close class="cancel-btn">
        <span class="btn-content">
          <mat-icon>close</mat-icon>
          <span>Cancel</span>
        </span>
      </button>
      <button
        mat-flat-button
        type="submit"
        form="task-form"
        class="submit-btn"
        [disabled]="saving()"
      >
        @if (saving()) {
          <mat-spinner diameter="20" />
        } @else {
          <span class="btn-content">
            <mat-icon>{{ isEditing ? 'save' : 'add_circle' }}</mat-icon>
            <span>{{ isEditing ? 'Save Changes' : 'Create Task' }}</span>
          </span>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem 0;
    }

    .dialog-title-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .dialog-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);

      &.editing {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 40px;
    }

    .close-btn {
      color: var(--mat-sys-on-surface-variant);
    }

    mat-dialog-content {
      min-width: 340px;
      padding: 1.5rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    mat-form-field {
      width: 100%;

      mat-icon[matPrefix] {
        margin-right: 0.5rem;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem 1.5rem;
      gap: 0.75rem;
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .submit-btn {
      min-width: 140px;
      height: 44px;
      border-radius: 12px;


      mat-spinner {
        margin: 0 auto;
      }
    }
  `,
})
export class TaskFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly taskFacade = inject(TaskFacade);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  private readonly data = inject<TaskFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  protected readonly saving = this.taskFacade.saving;
  protected readonly isEditing = !!this.data?.task;

  protected readonly form = this.fb.nonNullable.group({
    title: [this.data?.task?.title ?? '', [Validators.required]],
    description: [this.data?.task?.description ?? ''],
    status: [this.data?.task?.status ?? 'pending' as TaskStatus],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, status } = this.form.getRawValue();

    if (this.isEditing && this.data?.task) {
      this.taskFacade.updateTask(this.data.task.id, {
        title,
        description: description || undefined,
        status,
      });
    } else {
      this.taskFacade.createTask({
        title,
        description: description || undefined,
        status,
      });
    }

    this.dialogRef.close();
  }
}

