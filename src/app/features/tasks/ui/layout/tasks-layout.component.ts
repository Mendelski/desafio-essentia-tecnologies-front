import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';

import { AuthFacade } from '../../../../core/auth';
import { ThemeToggleComponent } from '../../../../shared';
import { UserProfileDialogComponent } from '../user-profile-dialog';

/**
 * Layout shell for authenticated pages.
 * Contains header with app title, user info, theme toggle and logout.
 */
@Component({
  selector: 'app-tasks-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatTooltip,
    ThemeToggleComponent,
  ],
  template: `
    <mat-toolbar class="toolbar">
      <div class="logo">
        <mat-icon class="logo-icon">checklist</mat-icon>
        <span class="app-title">Todolist</span>
      </div>

      <span class="spacer"></span>

      @if (user(); as u) {
        <button
          type="button"
          class="user-info"
          matTooltip="View profile"
          (click)="openProfile()"
        >
          <mat-icon class="user-avatar">account_circle</mat-icon>
          <span class="user-name">{{ u.name }}</span>
        </button>
      }

      <app-theme-toggle />

      <button
        mat-icon-button
        type="button"
        aria-label="Logout"
        matTooltip="Logout"
        class="logout-btn"
        (click)="logout()"
      >
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <main class="content">
      <div class="content-wrapper">
        <router-outlet />
      </div>
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(
        135deg,
        var(--mat-sys-surface-container) 0%,
        var(--mat-sys-surface) 100%
      );
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--mat-sys-surface);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      color: var(--mat-sys-primary);
      font-size: 1.75rem;
      width: 1.75rem;
      height: 1.75rem;
    }

    .app-title {
      font-weight: 600;
      font-size: 1.25rem;
      color: var(--mat-sys-on-surface);
    }

    .spacer {
      flex: 1;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-right: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--mat-sys-surface-container-highest);
      border: none;
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--mat-sys-primary-container);
      }

      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
    }

    .user-avatar {
      color: var(--mat-sys-primary);
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .user-name {
      color: var(--mat-sys-on-surface);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .logout-btn {
      color: var(--mat-sys-error);
    }

    .content {
      flex: 1;
      padding: 2rem;
    }

    .content-wrapper {
      max-width: 800px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .content {
        padding: 1rem;
      }

      .user-info {
        display: none;
      }
    }
  `,
})
export class TasksLayoutComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  protected readonly user = this.authFacade.user;

  protected openProfile(): void {
    this.dialog.open(UserProfileDialogComponent, {
      width: '420px',
    });
  }

  protected logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/auth/login']);
  }
}

