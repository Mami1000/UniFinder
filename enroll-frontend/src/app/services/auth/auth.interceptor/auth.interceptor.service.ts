import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  // ❗ Исключаем refresh-запрос из перехвата
  if (request.url.includes('/auth/refresh')) {
    return next(request);
  }

  let clonedRequest = request;
  if (token) {
    clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
  switchMap(res => {
    // Теперь `res.token` — гарантированно новый access token
    localStorage.setItem('token', res.token); // можно оставить, для надёжности

    const retriedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${res.token}`
      }
    });
    return next(retriedRequest);
  }),
  catchError(refreshError => {
    authService.logout();
    return throwError(() => refreshError);
  })
);

      }

      return throwError(() => error);
    })
  );
};
