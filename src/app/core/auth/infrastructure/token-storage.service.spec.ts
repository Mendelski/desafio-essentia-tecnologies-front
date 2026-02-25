import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './token-storage.service';
import { AuthToken } from '../domain/auth.model';

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let localStorageMock: { [key: string]: string };

  const mockToken: AuthToken = {
    token: 'test-jwt-token',
    expiresAt: new Date('2026-02-25T15:00:00.000Z'),
  };

  beforeEach(() => {
    localStorageMock = {};

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should load token from localStorage on init', () => {
      const storedToken = {
        token: 'stored-token',
        expiresAt: '2026-02-25T15:00:00.000Z',
      };
      localStorageMock['auth_token'] = JSON.stringify(storedToken);

      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      expect(service.getToken()).toBe('stored-token');
      expect(service.hasToken()).toBe(true);
    });

    it('should have null token when localStorage is empty', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      expect(service.getToken()).toBeNull();
      expect(service.hasToken()).toBe(false);
    });

    it('should clear invalid stored data', () => {
      localStorageMock['auth_token'] = 'invalid-json';

      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      expect(service.getToken()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('setToken', () => {
    it('should store token in memory', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      service.setToken(mockToken);

      expect(service.getToken()).toBe('test-jwt-token');
      expect(service.hasToken()).toBe(true);
    });

    it('should persist token to localStorage', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      service.setToken(mockToken);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        expect.stringContaining('test-jwt-token')
      );
    });

    it('should store expiresAt as ISO string', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      service.setToken(mockToken);

      const storedValue = JSON.parse(localStorageMock['auth_token']);
      expect(storedValue.expiresAt).toBe('2026-02-25T15:00:00.000Z');
    });
  });

  describe('clearToken', () => {
    it('should clear token from memory', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);
      service.setToken(mockToken);

      service.clearToken();

      expect(service.getToken()).toBeNull();
      expect(service.hasToken()).toBe(false);
    });

    it('should remove token from localStorage', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);
      service.setToken(mockToken);

      service.clearToken();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('isTokenExpired', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-25T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true when no token exists', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false when token is not expired', () => {
      const futureToken: AuthToken = {
        token: 'valid-token',
        expiresAt: new Date('2026-02-25T15:00:00.000Z'), // 3 hours from "now"
      };

      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);
      service.setToken(futureToken);

      expect(service.isTokenExpired()).toBe(false);
    });

    it('should return true when token is expired', () => {
      const pastToken: AuthToken = {
        token: 'expired-token',
        expiresAt: new Date('2026-02-25T10:00:00.000Z'), // 2 hours ago
      };

      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);
      service.setToken(pastToken);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true when token expires exactly now', () => {
      const exactlyNowToken: AuthToken = {
        token: 'now-token',
        expiresAt: new Date('2026-02-25T12:00:00.000Z'), // exactly "now"
      };

      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);
      service.setToken(exactlyNowToken);

      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('token signal', () => {
    it('should provide readonly token signal', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);
      service.setToken(mockToken);

      const tokenSignal = service.token;

      expect(tokenSignal()).toEqual(mockToken);
    });

    it('should update signal when token changes', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(TokenStorageService);

      expect(service.token()).toBeNull();

      service.setToken(mockToken);

      expect(service.token()?.token).toBe('test-jwt-token');

      service.clearToken();

      expect(service.token()).toBeNull();
    });
  });
});

