/**
 * DTO for login request payload sent to the API
 * POST /login
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * DTO for login response received from the API
 * Returns only the JWT token
 */
export interface LoginResponseDto {
  token: string;
}

/**
 * DTO for registration request payload
 * POST /register
 */
export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * DTO for registration response
 * Returns only the JWT token
 */
export interface RegisterResponseDto {
  token: string;
}

/**
 * DTO for refresh token response
 * POST /refresh (uses Bearer token in header)
 */
export interface RefreshTokenResponseDto {
  token: string;
}

/**
 * DTO for user data from the API
 * GET /me
 */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

