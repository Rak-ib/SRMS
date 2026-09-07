import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  const allowedRoles = route.data['roles'] as string[];

  // If user is logged in and role matches allowed roles, grant access
  if (currentUser && allowedRoles && allowedRoles.includes(currentUser.role)) {
    return true;
  }

  // Otherwise, block routing and redirect to access-denied
  return router.createUrlTree(['/access-denied']);
};
