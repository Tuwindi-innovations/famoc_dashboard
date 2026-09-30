import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Les routes d'authentification ne doivent jamais porter le jeton d'accès. */
const ROUTES_SANS_JETON = ['/auth/login', '/auth/refresh', '/auth/signup'];

function avecJeton<T>(requete: HttpRequest<T>, jeton: string): HttpRequest<T> {
  return requete.clone({ setHeaders: { Authorization: `Bearer ${jeton}` } });
}

/**
 * Ajoute le jeton d'accès à chaque appel et rejoue une fois la requête après
 * rafraîchissement si le serveur répond 401.
 *
 * Le rejeu est tenté une seule fois : si la requête rafraîchie échoue encore,
 * l'erreur remonte. `AuthService.refreshToken()` déconnecte de son côté quand
 * le jeton de rafraîchissement est lui aussi invalide.
 */
export const authInterceptor: HttpInterceptorFn = (requete, suivant) => {
  if (ROUTES_SANS_JETON.some((route) => requete.url.includes(route))) {
    return suivant(requete);
  }

  const auth = inject(AuthService);
  const jeton = auth.getAccessToken();
  const requeteSortante = jeton ? avecJeton(requete, jeton) : requete;

  return suivant(requeteSortante).pipe(
    catchError((erreur: HttpErrorResponse) => {
      if (erreur.status !== 401) {
        return throwError(() => erreur);
      }

      return auth
        .refreshToken()
        .pipe(switchMap((jetons) => suivant(avecJeton(requete, jetons.accessToken))));
    }),
  );
};
