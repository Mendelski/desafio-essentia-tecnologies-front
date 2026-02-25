import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';

import { Task, TaskActivityLog } from '../../domain/task.model';
import { TaskApiService } from '../../infrastructure/task.api';

export interface TaskActivityLogDialogData {
  task: Task;
}

/**
 * Dialog component for displaying task activity log history.
 */
@Component({
  selector: 'app-task-activity-log-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinner,
    MatTooltip,
  ],
  template: `
    <div class="dialog-header">
      <div class="dialog-title-wrapper">
        <div class="dialog-icon">
          <mat-icon>history</mat-icon>
        </div>
        <div class="dialog-title-content">
          <h2 mat-dialog-title>Activity Log</h2>
          <p class="task-title">{{ data.task.title }}</p>
        </div>
      </div>
      <button mat-icon-button mat-dialog-close aria-label="Close dialog" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <div class="filter-section">
        <form [formGroup]="filterForm" class="filter-form">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Start Date</mat-label>
            <input 
              matInput 
              [matDatepicker]="startPicker" 
              formControlName="startDate"
              placeholder="From"
            />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker" />
            <mat-datepicker #startPicker />
          </mat-form-field>

          <mat-form-field appearance="outline" class="date-field">
            <mat-label>End Date</mat-label>
            <input 
              matInput 
              [matDatepicker]="endPicker" 
              formControlName="endDate"
              placeholder="To"
            />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker" />
            <mat-datepicker #endPicker />
          </mat-form-field>

          <button 
            mat-icon-button 
            type="button" 
            class="filter-btn"
            matTooltip="Apply filter"
            [disabled]="loading()"
            (click)="applyFilter()"
          >
            <mat-icon>filter_alt</mat-icon>
          </button>

          @if (hasActiveFilter()) {
            <button 
              mat-icon-button 
              type="button" 
              class="clear-filter-btn"
              matTooltip="Clear filter"
              (click)="clearFilter()"
            >
              <mat-icon>clear</mat-icon>
            </button>
          }
        </form>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40" />
          <p>Loading activity log...</p>
        </div>
      } @else if (error()) {
        <div class="error-banner" role="alert">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      } @else if (logs().length === 0) {
        <div class="empty-state">
          <div class="empty-illustration">
            <mat-icon>event_note</mat-icon>
          </div>
          <p>{{ hasActiveFilter() ? 'No activity found for the selected period' : 'No activity recorded yet' }}</p>
          @if (hasActiveFilter()) {
            <button mat-button type="button" (click)="clearFilter()">
              <span class="btn-content">
                <mat-icon>clear</mat-icon>
                <span>Clear filter</span>
              </span>
            </button>
          }
        </div>
      } @else {
        <div class="activity-timeline">
          @for (log of logs(); track log.id) {
            <div class="activity-item">
              <div class="activity-icon" [class]="getActionClass(log.action)">
                <mat-icon>{{ getActionIcon(log.action) }}</mat-icon>
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <span class="activity-action">{{ formatActionName(log.action) }}</span>
                  <span class="activity-date">{{ log.timestamp | date:'medium' }}</span>
                </div>
                @if (hasChanges(log)) {
                  <div class="activity-changes">
                    @for (change of getChanges(log); track change.field) {
                      <div class="change-item">
                        <span class="change-field">{{ formatFieldName(change.field) }}:</span>
                        @if (change.oldValue !== null && change.oldValue !== undefined) {
                          <span class="change-old">{{ change.oldValue }}</span>
                          <mat-icon class="change-arrow">arrow_forward</mat-icon>
                        }
                        <span class="change-new">{{ change.newValue }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (hasMore()) {
          <div class="load-more">
            <button 
              mat-button 
              type="button" 
              [disabled]="loadingMore()"
              (click)="loadMore()"
            >
              @if (loadingMore()) {
                <mat-spinner diameter="20" />
              } @else {
                <span class="btn-content">
                  <mat-icon>expand_more</mat-icon>
                  <span>Load more</span>
                </span>
              }
            </button>
          </div>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-flat-button mat-dialog-close class="close-action-btn">
        <span class="btn-content">
          <mat-icon>check</mat-icon>
          <span>Close</span>
        </span>
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1rem 1.5rem 0;
    }

    .dialog-title-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .dialog-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      flex-shrink: 0;
    }

    .dialog-title-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    h2[mat-dialog-title] {
      margin: 0;
      padding: 0;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.5;
    }

    .task-title {
      margin: 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .close-btn {
      color: var(--mat-sys-on-surface-variant);
    }

    mat-dialog-content {
      min-width: 420px;
      max-height: 480px;
      padding: 1.5rem;
    }

    .filter-section {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .filter-form {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-field {
      flex: 1;

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    }

    .filter-btn {
      color: var(--mat-sys-primary);
    }

    .clear-filter-btn {
      color: var(--mat-sys-error);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      gap: 1rem;

      p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      border-radius: 12px;
      font-size: 0.875rem;

      mat-icon {
        flex-shrink: 0;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 2rem;
      text-align: center;

      .empty-illustration {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--mat-sys-surface-container-highest);
        margin-bottom: 1rem;

        mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
          color: var(--mat-sys-on-surface-variant);
        }
      }

      p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      gap: 0.75rem;
    }

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      flex-shrink: 0;
      background: var(--mat-sys-surface-container-highest);
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 1.125rem;
        width: 1.125rem;
        height: 1.125rem;
      }

      &.created {
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }

      &.updated {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }

      &.deleted {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .activity-action {
      font-weight: 500;
      font-size: 0.9375rem;
      color: var(--mat-sys-on-surface);
    }

    .activity-date {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
    }

    .activity-changes {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      background: var(--mat-sys-surface-container);
      border-radius: 8px;
      font-size: 0.8125rem;
    }

    .change-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      flex-wrap: wrap;
    }

    .change-field {
      color: var(--mat-sys-on-surface-variant);
      text-transform: capitalize;
    }

    .change-old {
      color: var(--mat-sys-error);
      text-decoration: line-through;
    }

    .change-arrow {
      font-size: 0.875rem;
      width: 0.875rem;
      height: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .change-new {
      color: var(--mat-sys-primary);
      font-weight: 500;
    }

    .load-more {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem 1.5rem;
      justify-content: center;
    }

    .close-action-btn {
      min-width: 120px;
      height: 44px;
      border-radius: 12px;
    }

    .btn-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
})
export class TaskActivityLogDialogComponent implements OnInit {
  protected readonly data = inject<TaskActivityLogDialogData>(MAT_DIALOG_DATA);
  private readonly taskApi = inject(TaskApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly logs = signal<TaskActivityLog[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly error = signal<string | null>(null);
  private readonly nextCursor = signal<string | null>(null);

  protected readonly hasMore = computed(() => this.nextCursor() !== null);
  protected readonly hasActiveFilter = computed(() => {
    const { startDate, endDate } = this.filterForm.value;
    return startDate !== null || endDate !== null;
  });

  protected readonly filterForm = this.fb.group({
    startDate: [null as Date | null],
    endDate: [null as Date | null],
  });

  ngOnInit(): void {
    this.loadActivityLog();
  }

  protected applyFilter(): void {
    this.logs.set([]);
    this.nextCursor.set(null);
    this.loadActivityLog();
  }

  protected clearFilter(): void {
    this.filterForm.reset();
    this.logs.set([]);
    this.nextCursor.set(null);
    this.loadActivityLog();
  }

  protected loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loadingMore()) return;

    this.loadingMore.set(true);

    const filter = this.buildFilter();
    filter.cursor = cursor;

    this.taskApi.getActivityLog(this.data.task.id, filter).subscribe({
      next: (response) => {
        this.logs.update((current) => [...current, ...response.data]);
        this.nextCursor.set(response.nextCursor);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loadingMore.set(false);
      },
    });
  }

  private buildFilter(): { startDate?: string; endDate?: string; cursor?: string } {
    const { startDate, endDate } = this.filterForm.value;
    const filter: { startDate?: string; endDate?: string; cursor?: string } = {};

    if (startDate) {
      filter.startDate = this.formatDateForApi(startDate);
    }
    if (endDate) {
      filter.endDate = this.formatDateForApi(endDate);
    }

    return filter;
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  protected getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'created':
        return 'add_circle';
      case 'updated':
      case 'completed':
        return 'edit';
      case 'deleted':
        return 'delete';
      default:
        return 'info';
    }
  }

  protected getActionClass(action: string): string {
    const normalized = action.toLowerCase();
    if (normalized === 'completed' || normalized === 'updated') {
      return 'updated';
    }
    return normalized;
  }

  protected formatActionName(action: string): string {
    const actionMap: Record<string, string> = {
      'created': 'Task Created',
      'updated': 'Task Updated',
      'completed': 'Task Completed',
      'deleted': 'Task Deleted',
    };
    return actionMap[action.toLowerCase()] || action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
  }

  protected formatFieldName(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  protected hasChanges(log: TaskActivityLog): boolean {
    if (log.action.toLowerCase() === 'created') {
      return false; // Don't show changes for created, just show the action
    }
    if (!log.before || !log.after) {
      return false;
    }
    // Compare relevant fields
    const fieldsToCompare = ['title', 'description', 'status'];
    return fieldsToCompare.some(field =>
      log.before?.[field] !== log.after?.[field]
    );
  }

  protected getChanges(log: TaskActivityLog): Array<{ field: string; oldValue: unknown; newValue: unknown }> {
    if (!log.before || !log.after) {
      return [];
    }

    const fieldsToCompare = ['title', 'description', 'status'];
    const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

    for (const field of fieldsToCompare) {
      const oldValue = log.before[field];
      const newValue = log.after[field];
      if (oldValue !== newValue) {
        changes.push({ field, oldValue, newValue });
      }
    }

    return changes;
  }

  private loadActivityLog(): void {
    this.loading.set(true);
    this.error.set(null);

    const filter = this.buildFilter();

    this.taskApi.getActivityLog(this.data.task.id, filter).subscribe({
      next: (response) => {
        this.logs.set(response.data);
        this.nextCursor.set(response.nextCursor);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const errorMessage = err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Failed to load activity log';
        this.error.set(errorMessage);
        this.loading.set(false);
      },
    });
  }
}

