import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

/**
 * HTTP interceptor that automatically adds the JWT token to API requests.
 * Only adds the token to requests going to the configured API base URL.
 * Also adds Accept: application/json header as required by the API.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenStorage = inject(TokenStorageService);

  // Only modify requests to our API
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const token = tokenStorage.getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const modifiedReq = req.clone({
    setHeaders: headers,
  });

  return next(modifiedReq);
};


