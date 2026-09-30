import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * N'autorise l'accès qu'avec un jeton valide et non expiré.
 *
 * En cas de refus, l'URL demandée est conservée dans `redirectTo` pour que la
 * connexion puisse y ramener l'utilisateur.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url },
  });
};
