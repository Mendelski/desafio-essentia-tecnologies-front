import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthFacade } from '../application/auth.facade';

/**
 * Route guard that protects routes requiring authentication.
 * Redirects to login page if user is not authenticated.
 */
export const authGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (authFacade.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  return router.createUrlTree(['/auth/login']);
};

/**
 * Route guard that prevents authenticated users from accessing certain routes.
 * Useful for login/register pages - redirects authenticated users away.
 */
export const guestGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (!authFacade.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated users to home
  return router.createUrlTree(['/']);
};

