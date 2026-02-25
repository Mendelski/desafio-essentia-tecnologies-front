// Public API for auth feature

// Domain
export type { User, AuthToken, AuthState, LoginCredentials, RegisterData } from './domain/auth.model';

// Application
export { AuthFacade } from './application/auth.facade';
export type { AuthError } from './application/auth.facade';

// Infrastructure (only guards and interceptor for external use)
export { authGuard, guestGuard } from './infrastructure/auth.guard';
export { authInterceptor } from './infrastructure/auth.interceptor';

