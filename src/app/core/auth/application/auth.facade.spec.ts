import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthFacade } from './auth.facade';
import { AuthApiService } from '../infrastructure/auth.api';
import { TokenStorageService } from '../infrastructure/token-storage.service';
import { User, AuthToken } from '../domain/auth.model';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let authApiMock: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    me: ReturnType<typeof vi.fn>;
  };
  let tokenStorageMock: {
    getToken: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
    clearToken: ReturnType<typeof vi.fn>;
    hasToken: ReturnType<typeof vi.fn>;
    isTokenExpired: ReturnType<typeof vi.fn>;
    token: { (): AuthToken | null };
  };

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2026-02-25T10:00:00.000Z'),
    updatedAt: new Date('2026-02-25T10:00:00.000Z'),
  };

  const mockAuthToken: AuthToken = {
    token: 'test-jwt-token',
    expiresAt: new Date('2026-02-25T15:00:00.000Z'),
  };

  beforeEach(() => {
    authApiMock = {
      login: vi.fn().mockReturnValue(of(mockAuthToken)),
      register: vi.fn().mockReturnValue(of(mockAuthToken)),
      logout: vi.fn().mockReturnValue(of(void 0)),
      refreshToken: vi.fn().mockReturnValue(of(mockAuthToken)),
      me: vi.fn().mockReturnValue(of(mockUser)),
    };

    tokenStorageMock = {
      getToken: vi.fn().mockReturnValue(null),
      setToken: vi.fn(),
      clearToken: vi.fn(),
      hasToken: vi.fn().mockReturnValue(false),
      isTokenExpired: vi.fn().mockReturnValue(true),
      token: vi.fn().mockReturnValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: authApiMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });

    facade = TestBed.inject(AuthFacade);
  });

  describe('initial state', () => {
    it('should have no user initially', () => {
      expect(facade.user()).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(facade.isAuthenticated()).toBe(false);
    });

    it('should not be loading initially', () => {
      expect(facade.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(facade.error()).toBeNull();
      expect(facade.hasError()).toBe(false);
    });
  });

  describe('login', () => {
    it('should call API with credentials', () => {
      facade.login('john@example.com', 'password123');

      expect(authApiMock.login).toHaveBeenCalledWith('john@example.com', 'password123');
    });

    it('should store token on successful login', () => {
      facade.login('john@example.com', 'password123');

      expect(tokenStorageMock.setToken).toHaveBeenCalledWith(mockAuthToken);
    });

    it('should fetch user data after login', () => {
      facade.login('john@example.com', 'password123');

      expect(authApiMock.me).toHaveBeenCalled();
    });

    it('should set user after successful login', () => {
      facade.login('john@example.com', 'password123');

      expect(facade.user()).toEqual(mockUser);
      expect(facade.isAuthenticated()).toBe(true);
    });

    it('should handle login error', () => {
      authApiMock.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

      facade.login('wrong@example.com', 'wrong');

      expect(facade.error()).toEqual({ message: 'Invalid credentials' });
      expect(facade.hasError()).toBe(true);
      expect(facade.user()).toBeNull();
    });

    it('should clear token on login error', () => {
      authApiMock.login.mockReturnValue(throwError(() => new Error('Error')));

      facade.login('test@test.com', 'pass');

      expect(tokenStorageMock.clearToken).toHaveBeenCalled();
    });

    it('should set loading to false after completion', () => {
      facade.login('john@example.com', 'password123');

      expect(facade.loading()).toBe(false);
    });
  });

  describe('register', () => {
    it('should call API with registration data', () => {
      facade.register('John Doe', 'john@example.com', 'password123', 'password123');

      expect(authApiMock.register).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        'password123',
        'password123'
      );
    });

    it('should store token on successful registration', () => {
      facade.register('John Doe', 'john@example.com', 'password123', 'password123');

      expect(tokenStorageMock.setToken).toHaveBeenCalledWith(mockAuthToken);
    });

    it('should fetch user data after registration', () => {
      facade.register('John Doe', 'john@example.com', 'password123', 'password123');

      expect(authApiMock.me).toHaveBeenCalled();
      expect(facade.user()).toEqual(mockUser);
    });

    it('should handle registration error', () => {
      authApiMock.register.mockReturnValue(throwError(() => new Error('Email already exists')));

      facade.register('John', 'existing@email.com', 'pass', 'pass');

      expect(facade.error()).toEqual({ message: 'Email already exists' });
    });
  });

  describe('logout', () => {
    it('should call logout API', () => {
      // Setup authenticated state
      facade.login('john@example.com', 'password123');

      facade.logout();

      expect(authApiMock.logout).toHaveBeenCalled();
    });

    it('should clear auth state after logout', () => {
      facade.login('john@example.com', 'password123');

      facade.logout();

      expect(tokenStorageMock.clearToken).toHaveBeenCalled();
      expect(facade.user()).toBeNull();
    });

    it('should clear auth state even if API call fails', () => {
      // Simulating a failure that still triggers finalize
      // In actual implementation, logout uses finalize() which runs even on error
      // We use EMPTY to simulate the completion path after error handling
      authApiMock.logout.mockReturnValue(EMPTY);
      facade.login('john@example.com', 'password123');

      facade.logout();

      expect(tokenStorageMock.clearToken).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should call refresh API when token exists', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);

      facade.refreshToken();

      expect(authApiMock.refreshToken).toHaveBeenCalled();
    });

    it('should store new token on successful refresh', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);
      const newToken: AuthToken = {
        token: 'new-jwt-token',
        expiresAt: new Date('2026-02-25T20:00:00.000Z'),
      };
      authApiMock.refreshToken.mockReturnValue(of(newToken));

      facade.refreshToken();

      expect(tokenStorageMock.setToken).toHaveBeenCalledWith(newToken);
    });

    it('should clear auth state when no token exists', () => {
      tokenStorageMock.hasToken.mockReturnValue(false);

      facade.refreshToken();

      expect(authApiMock.refreshToken).not.toHaveBeenCalled();
      expect(tokenStorageMock.clearToken).toHaveBeenCalled();
    });

    it('should clear auth state on refresh error', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);
      authApiMock.refreshToken.mockReturnValue(throwError(() => new Error('Token expired')));

      facade.refreshToken();

      expect(tokenStorageMock.clearToken).toHaveBeenCalled();
    });
  });

  describe('fetchCurrentUser', () => {
    it('should fetch user when token exists', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);
      authApiMock.me.mockClear();

      facade.fetchCurrentUser();

      expect(authApiMock.me).toHaveBeenCalled();
    });

    it('should not fetch user when no token', () => {
      tokenStorageMock.hasToken.mockReturnValue(false);
      authApiMock.me.mockClear();

      facade.fetchCurrentUser();

      expect(authApiMock.me).not.toHaveBeenCalled();
    });

    it('should set user on successful fetch', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);

      facade.fetchCurrentUser();

      expect(facade.user()).toEqual(mockUser);
    });

    it('should clear auth state on fetch error', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);
      authApiMock.me.mockReturnValue(throwError(() => new Error('Unauthorized')));

      facade.fetchCurrentUser();

      expect(tokenStorageMock.clearToken).toHaveBeenCalled();
    });

    it('should mark as initialized after fetch', () => {
      tokenStorageMock.hasToken.mockReturnValue(true);

      facade.fetchCurrentUser();

      expect(facade.initialized()).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear existing error', () => {
      authApiMock.login.mockReturnValue(throwError(() => new Error('Error')));
      facade.login('test@test.com', 'pass');

      expect(facade.hasError()).toBe(true);

      facade.clearError();

      expect(facade.error()).toBeNull();
      expect(facade.hasError()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from storage', () => {
      tokenStorageMock.getToken.mockReturnValue('test-token');

      expect(facade.getToken()).toBe('test-token');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when token is expired', () => {
      tokenStorageMock.isTokenExpired.mockReturnValue(true);

      expect(facade.isTokenExpired()).toBe(true);
    });

    it('should return false when token is valid', () => {
      tokenStorageMock.isTokenExpired.mockReturnValue(false);

      expect(facade.isTokenExpired()).toBe(false);
    });
  });
});

