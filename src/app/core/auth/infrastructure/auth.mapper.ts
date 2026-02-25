import { AuthToken, User } from '../domain/auth.model';
import { LoginResponseDto, RegisterResponseDto, RefreshTokenResponseDto, UserDto } from './auth.dto';

/**
 * Decodes a JWT token and extracts the payload
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
}

/**
 * Maps DTOs from the API to domain models
 */
export const AuthMapper = {
  /**
   * Maps UserDto to User domain model
   */
  toUser(dto: UserDto): User {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  },

  /**
   * Maps token response to AuthToken domain model
   * Decodes JWT to extract expiration time
   */
  toAuthToken(dto: LoginResponseDto | RegisterResponseDto | RefreshTokenResponseDto): AuthToken {
    const payload = decodeJwtPayload(dto.token);

    let expiresAt: Date;
    if (payload?.exp) {
      // JWT exp is in seconds, convert to milliseconds
      expiresAt = new Date(payload.exp * 1000);
    } else {
      // Fallback: assume 1 hour expiration
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
    }

    return {
      token: dto.token,
      expiresAt,
    };
  },
};

