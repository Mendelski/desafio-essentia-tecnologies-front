import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { User } from '../domain/auth.model';
import { UserDto, LoginResponseDto } from './auth.dto';
import { AuthMapper } from './auth.mapper';

describe('AuthMapper', () => {
  describe('toUser', () => {
    it('should map UserDto to User domain model', () => {
      const dto: UserDto = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2026-02-25T10:00:00.000Z',
        updated_at: '2026-02-25T12:00:00.000Z',
      };

      const result = AuthMapper.toUser(dto);

      expect(result).toEqual<User>({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date('2026-02-25T10:00:00.000Z'),
        updatedAt: new Date('2026-02-25T12:00:00.000Z'),
      });
    });

    it('should convert date strings to Date objects', () => {
      const dto: UserDto = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        created_at: '2025-01-15T08:30:00.000Z',
        updated_at: '2025-06-20T14:45:00.000Z',
      };

      const result = AuthMapper.toUser(dto);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBe(new Date('2025-01-15T08:30:00.000Z').getTime());
    });
  });

  describe('toAuthToken', () => {
    // Helper function to create a valid JWT with exp claim
    const createJwtWithExp = (expSeconds: number): string => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: expSeconds, sub: '1' }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should extract expiration from JWT payload', () => {
      // Set expiration to Feb 25, 2026 at 15:00:00 UTC
      const expSeconds = Math.floor(new Date('2026-02-25T15:00:00.000Z').getTime() / 1000);
      const token = createJwtWithExp(expSeconds);

      const dto: LoginResponseDto = { token };

      const result = AuthMapper.toAuthToken(dto);

      expect(result.token).toBe(token);
      expect(result.expiresAt.getTime()).toBe(expSeconds * 1000);
    });

    it('should return token string in result', () => {
      const expSeconds = Math.floor(Date.now() / 1000) + 3600;
      const token = createJwtWithExp(expSeconds);
      const dto: LoginResponseDto = { token };

      const result = AuthMapper.toAuthToken(dto);

      expect(result.token).toBe(token);
    });

    describe('fallback expiration', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-25T10:00:00.000Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should use fallback expiration for invalid JWT', () => {
        const dto: LoginResponseDto = { token: 'invalid-token' };

        const result = AuthMapper.toAuthToken(dto);

        // Should be 1 hour from now (fallback)
        const expectedExpiration = new Date('2026-02-25T11:00:00.000Z');
        expect(result.expiresAt.getTime()).toBe(expectedExpiration.getTime());
      });

      it('should use fallback expiration for JWT without exp claim', () => {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ sub: '1' })); // No exp claim
        const signature = 'mock-signature';
        const token = `${header}.${payload}.${signature}`;
        const dto: LoginResponseDto = { token };

        const result = AuthMapper.toAuthToken(dto);

        // Should be 1 hour from now (fallback)
        const expectedExpiration = new Date('2026-02-25T11:00:00.000Z');
        expect(result.expiresAt.getTime()).toBe(expectedExpiration.getTime());
      });
    });
  });
});

