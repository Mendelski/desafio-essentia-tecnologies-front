import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ApiRequestOptions {
  headers?: HttpHeaders;
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  post<T, B>(endpoint: string, body: B, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  put<T, B>(endpoint: string, body: B, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  patch<T, B>(endpoint: string, body: B, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  private buildOptions(options?: ApiRequestOptions): { headers?: HttpHeaders; withCredentials?: boolean } {
    return {
      headers: options?.headers,
      withCredentials: options?.withCredentials,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
  }
}

