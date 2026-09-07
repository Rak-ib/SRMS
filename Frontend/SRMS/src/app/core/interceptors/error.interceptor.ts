import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // Auto-logout: clears token, resets signals, redirects to login
          authService.logout();
        } else if (err.status === 403) {
          // Non-blocking access-denied state
          authService.forbiddenError.set('Access Denied: You do not have the required permissions to access this resource.');
          
          // Clear error notification banner automatically after 5 seconds
          setTimeout(() => {
            authService.forbiddenError.set(null);
          }, 5000);
        }
      }
      return throwError(() => err);
    })
  );
};
