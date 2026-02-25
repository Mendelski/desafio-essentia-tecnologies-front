import { Injectable, signal } from '@angular/core';

import { AuthToken } from '../domain/auth.model';

const STORAGE_KEY = 'auth_token';

/**
 * Service responsible for persisting and retrieving authentication token.
 * Stores token both in memory (signals) and localStorage for persistence.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly tokenSignal = signal<AuthToken | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Returns the current token signal (readonly)
   */
  get token() {
    return this.tokenSignal.asReadonly();
  }

  /**
   * Returns the current token string or null
   */
  getToken(): string | null {
    return this.tokenSignal()?.token ?? null;
  }

  /**
   * Stores token in memory and localStorage
   */
  setToken(authToken: AuthToken): void {
    this.tokenSignal.set(authToken);
    this.saveToStorage(authToken);
  }

  /**
   * Clears token from memory and localStorage
   */
  clearToken(): void {
    this.tokenSignal.set(null);
    this.removeFromStorage();
  }

  /**
   * Checks if the current token is expired
   */
  isTokenExpired(): boolean {
    const authToken = this.tokenSignal();
    if (!authToken) {
      return true;
    }
    return new Date() >= authToken.expiresAt;
  }

  /**
   * Checks if token exists (not checking expiration)
   */
  hasToken(): boolean {
    return this.tokenSignal() !== null;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredToken;
        const authToken: AuthToken = {
          token: parsed.token,
          expiresAt: new Date(parsed.expiresAt),
        };
        this.tokenSignal.set(authToken);
      }
    } catch {
      // If parsing fails, clear invalid data
      this.removeFromStorage();
    }
  }

  private saveToStorage(authToken: AuthToken): void {
    try {
      const toStore: StoredToken = {
        token: authToken.token,
        expiresAt: authToken.expiresAt.toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Storage might be full or disabled, silently fail
    }
  }

  private removeFromStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage might be disabled, silently fail
    }
  }
}

/**
 * Type for the structure stored in localStorage
 */
interface StoredToken {
  token: string;
  expiresAt: string; // ISO string
}

