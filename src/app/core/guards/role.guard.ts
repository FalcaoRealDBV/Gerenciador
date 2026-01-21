import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

import type { UserProfile } from '@/core/types/user-context';
import { SessionService } from '@/core/services/session.service';

export const roleGuard: CanActivateFn = route => {
  const session = inject(SessionService);
  const router = inject(Router);
  const allowed = (route.data?.['roles'] as UserProfile[] | undefined) ?? [];

  if (!allowed.length || allowed.includes(session.profile())) {
    return true;
  }

  return router.createUrlTree(['/']);
};
