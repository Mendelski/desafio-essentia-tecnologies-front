import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { AuthFacade } from '../../../../core/auth';

/**
 * Dialog component for displaying user profile information.
 */
@Component({
  selector: 'app-user-profile-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIconButton,
    MatIcon,
  ],
  template: `
    <div class="dialog-header">
      <div class="dialog-title-wrapper">
        <div class="dialog-icon">
          <mat-icon>person</mat-icon>
        </div>
        <h2 mat-dialog-title>My Profile</h2>
      </div>
      <button mat-icon-button mat-dialog-close aria-label="Close dialog" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      @if (user(); as u) {
        <div class="profile-avatar">
          <mat-icon>account_circle</mat-icon>
        </div>

        <div class="profile-name">{{ u.name }}</div>

        <div class="profile-fields">

          <div class="profile-field">
            <div class="field-icon">
              <mat-icon>email</mat-icon>
            </div>
            <div class="field-content">
              <span class="field-label">Email</span>
              <span class="field-value">{{ u.email }}</span>
            </div>
          </div>

          <div class="profile-field">
            <div class="field-icon">
              <mat-icon>calendar_today</mat-icon>
            </div>
            <div class="field-content">
              <span class="field-label">Member since</span>
              <span class="field-value">{{ u.createdAt | date:'longDate' }}</span>
            </div>
          </div>

          <div class="profile-field">
            <div class="field-icon">
              <mat-icon>update</mat-icon>
            </div>
            <div class="field-content">
              <span class="field-label">Last updated</span>
              <span class="field-value">{{ u.updatedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
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
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .profile-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--mat-sys-primary-container);
      margin-bottom: 1rem;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mat-sys-on-primary-container);
      }
    }

    .profile-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin-bottom: 1.5rem;
    }

    .profile-fields {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .profile-field {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
    }

    .field-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-highest);

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: var(--mat-sys-primary);
      }
    }

    .field-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .field-label {
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .field-value {
      font-size: 0.9375rem;
      color: var(--mat-sys-on-surface);
      font-weight: 500;
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
export class UserProfileDialogComponent {
  private readonly authFacade = inject(AuthFacade);

  protected readonly user = this.authFacade.user;
}

