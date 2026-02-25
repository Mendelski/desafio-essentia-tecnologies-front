import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { User } from '../domain/auth.model';
import { AuthApiService } from '../infrastructure/auth.api';
import { TokenStorageService } from '../infrastructure/token-storage.service';

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Facade for authentication operations.
 * Orchestrates API calls and state management using signals.
 * This is the only entry point for authentication in the application layer.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStorage = inject(TokenStorageService);

  // Private writable signals
  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<AuthError | null>(null);
  private readonly initializedSignal = signal(false);

  // Public readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly hasError = computed(() => this.errorSignal() !== null);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Attempts to log in with the provided credentials.
   * After successful login, fetches user data from /me endpoint.
   */
  login(email: string, password: string): void {
    this.clearError();
    this.loadingSignal.set(true);

    this.authApi
      .login(email, password)
      .pipe(
        tap((authToken) => {
          this.tokenStorage.setToken(authToken);
        }),
        switchMap(() => this.authApi.me()),
        tap((user) => {
          this.userSignal.set(user);
        }),
        catchError((error: Error) => {
          this.clearAuthState();
          this.setError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Registers a new user with the provided data.
   * After successful registration, fetches user data from /me endpoint.
   */
  register(name: string, email: string, password: string, passwordConfirmation: string): void {
    this.clearError();
    this.loadingSignal.set(true);

    this.authApi
      .register(name, email, password, passwordConfirmation)
      .pipe(
        tap((authToken) => {
          this.tokenStorage.setToken(authToken);
        }),
        switchMap(() => this.authApi.me()),
        tap((user) => {
          this.userSignal.set(user);
        }),
        catchError((error: Error) => {
          this.clearAuthState();
          this.setError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Logs out the current user.
   * Clears all authentication state regardless of API response.
   */
  logout(): void {
    this.loadingSignal.set(true);

    this.authApi
      .logout()
      .pipe(
        finalize(() => {
          this.clearAuthState();
          this.loadingSignal.set(false);
        })
      )
      .subscribe();
  }

  /**
   * Attempts to refresh the token.
   * Uses the current token (sent via interceptor) to get a new one.
   */
  refreshToken(): void {
    if (!this.tokenStorage.hasToken()) {
      this.clearAuthState();
      return;
    }

    this.authApi
      .refreshToken()
      .pipe(
        tap((authToken) => {
          this.tokenStorage.setToken(authToken);
        }),
        catchError(() => {
          this.clearAuthState();
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Fetches the current user data from /me endpoint.
   */
  fetchCurrentUser(): void {
    if (!this.tokenStorage.hasToken()) {
      return;
    }

    this.loadingSignal.set(true);

    this.authApi
      .me()
      .pipe(
        tap((user) => {
          this.userSignal.set(user);
        }),
        catchError(() => {
          this.clearAuthState();
          return of(null);
        }),
        finalize(() => {
          this.loadingSignal.set(false);
          this.initializedSignal.set(true);
        })
      )
      .subscribe();
  }

  /**
   * Clears any existing authentication error.
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Returns the current token for use in HTTP interceptors.
   */
  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  /**
   * Checks if the current token is expired.
   */
  isTokenExpired(): boolean {
    return this.tokenStorage.isTokenExpired();
  }

  /**
   * Initializes auth state from stored token on app startup.
   * If a valid token exists, fetches user data.
   */
  private initializeAuth(): void {
    if (this.tokenStorage.hasToken() && !this.tokenStorage.isTokenExpired()) {
      // Valid token exists, fetch user data
      this.fetchCurrentUser();
    } else if (this.tokenStorage.hasToken()) {
      // Token exists but might be expired, try to refresh
      this.authApi
        .refreshToken()
        .pipe(
          tap((authToken) => {
            this.tokenStorage.setToken(authToken);
          }),
          switchMap(() => this.authApi.me()),
          tap((user) => {
            this.userSignal.set(user);
          }),
          catchError(() => {
            this.clearAuthState();
            return of(null);
          }),
          finalize(() => {
            this.initializedSignal.set(true);
          })
        )
        .subscribe();
    } else {
      this.initializedSignal.set(true);
    }
  }

  private clearAuthState(): void {
    this.tokenStorage.clearToken();
    this.userSignal.set(null);
    this.errorSignal.set(null);
  }

  private setError(message: string, code?: string): void {
    this.errorSignal.set({ message, code });
  }
}

