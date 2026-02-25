import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiClientService } from '../../http/api-client.service';
import { AuthToken, User } from '../domain/auth.model';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserDto,
} from './auth.dto';
import { AuthMapper } from './auth.mapper';

/**
 * Infrastructure service for authentication API calls.
 * Handles all HTTP communication with the auth endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly apiClient = inject(ApiClientService);

  /**
   * POST /login
   */
  login(email: string, password: string): Observable<AuthToken> {
    const payload: LoginRequestDto = { email, password };

    return this.apiClient
      .post<LoginResponseDto, LoginRequestDto>('/login', payload)
      .pipe(map((response) => AuthMapper.toAuthToken(response)));
  }

  /**
   * POST /register
   */
  register(name: string, email: string, password: string, passwordConfirmation: string): Observable<AuthToken> {
    const payload: RegisterRequestDto = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    };

    return this.apiClient
      .post<RegisterResponseDto, RegisterRequestDto>('/register', payload)
      .pipe(map((response) => AuthMapper.toAuthToken(response)));
  }

  /**
   * POST /refresh
   * Uses Bearer token in header (handled by interceptor)
   */
  refreshToken(): Observable<AuthToken> {
    return this.apiClient
      .post<RefreshTokenResponseDto, Record<string, never>>('/refresh', {})
      .pipe(map((response) => AuthMapper.toAuthToken(response)));
  }

  /**
   * POST /logout
   * Uses Bearer token in header (handled by interceptor)
   */
  logout(): Observable<void> {
    return this.apiClient.post<void, Record<string, never>>('/logout', {});
  }

  /**
   * GET /me
   * Returns the authenticated user's data
   */
  me(): Observable<User> {
    return this.apiClient
      .get<UserDto>('/me', {})
      .pipe(map((response) => AuthMapper.toUser(response)));
  }
}

