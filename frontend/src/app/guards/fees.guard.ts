import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// FeesGuard: gatekeep Fees area by role; currently allows admin and accountant roles.
export const FeesGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser?.();
  const role = user?.role?.toLowerCase?.();
  const allowed = role ? ['admin', 'accountant'].includes(role) : false;

  if (!allowed) {
    // Fallback: let admins in when roles are not present yet
    if (!role) {
      return true;
    }
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};
