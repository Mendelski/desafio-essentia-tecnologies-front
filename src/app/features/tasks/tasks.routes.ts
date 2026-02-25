import { Routes } from '@angular/router';

import { authGuard } from '../../core';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./ui/layout/tasks-layout.component').then((m) => m.TasksLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./ui/task-list/task-list.component').then((m) => m.TaskListComponent),
      },
    ],
  },
];

