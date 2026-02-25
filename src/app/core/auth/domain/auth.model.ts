/**
 * Domain model representing an authenticated user
 */
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain model representing authentication token
 */
export interface AuthToken {
  token: string;
  expiresAt: Date;
}

/**
 * Domain model representing the complete authentication state
 */
export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
}

/**
 * Credentials used for login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Data required for user registration
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

