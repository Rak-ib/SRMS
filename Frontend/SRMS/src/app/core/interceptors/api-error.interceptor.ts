import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface NormalizedError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        let message = 'An error occurred while communicating with the server.';
        let validationErrors: Record<string, string[]> | undefined;

        const errorBody = err.error;

        // Extract error payload details from typical ASP.NET Core structures
        if (errorBody) {
          // 1. Check for ASP.NET Core ValidationProblemDetails containing field validation issues
          if (errorBody.errors && typeof errorBody.errors === 'object') {
            validationErrors = errorBody.errors;
            message = errorBody.title || 'Validation failed. Please verify your inputs.';
          }
          // 2. Check for RFC 7807 standard ProblemDetails or custom error structures
          else if (typeof errorBody.detail === 'string') {
            message = errorBody.detail;
          } else if (typeof errorBody.message === 'string') {
            message = errorBody.message;
          }
        } else {
          // Fallback to HTTP status text if body is empty
          message = err.statusText || message;
        }

        const normalized: NormalizedError = {
          message,
          errors: validationErrors,
          status: err.status
        };

        // Re-throw normalized error object
        return throwError(() => normalized);
      }
      
      // Fallback for non-HTTP errors
      return throwError(() => err);
    })
  );
};
