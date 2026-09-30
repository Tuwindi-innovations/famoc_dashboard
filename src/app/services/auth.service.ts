import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, finalize, Observable, of, share, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserResponseDTO } from '../models/User';

interface LoginRequest {
  identifiant: string;
  motDePasse: string;
}

interface SignupRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

/** Charge utile JWT : seuls les champs que l'on sait lire sont déclarés. */
interface ChargeJwt {
  name?: string;
  fullName?: string;
  given_name?: string;
  family_name?: string;
  username?: string;
  preferred_username?: string;
  email?: string;
  sub?: string;
}

const CLE_ACCES = 'access_token';
const CLE_RAFRAICHISSEMENT = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly jwt = inject(JwtHelperService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /**
   * Rafraîchissement en cours, partagé entre les appelants.
   *
   * Sans cela, plusieurs requêtes recevant un 401 simultanément déclenchent
   * chacune leur propre rafraîchissement : les jetons se écrasent et toutes
   * échouent sauf une.
   */
  private rafraichissementEnCours?: Observable<JwtResponse>;

  private readonly _connecte = signal(this.jetonValide());

  /** Vrai tant qu'un jeton d'accès non expiré est disponible. */
  readonly connecte = computed(() => this._connecte());

  signIn(identifiant: string, motDePasse: string): Observable<JwtResponse> {
    const corps: LoginRequest = { identifiant, motDePasse };

    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, corps).pipe(
      tap((jetons) => this.enregistrerJetons(jetons)),
      catchError((erreur: HttpErrorResponse) =>
        throwError(() => new Error(this.messageDeConnexion(erreur))),
      ),
    );
  }

  signUp(donnees: SignupRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/signup`, donnees);
  }

  /**
   * Échange le jeton de rafraîchissement contre un nouveau couple de jetons.
   *
   * Les appels concurrents partagent la même requête réseau ; un échec
   * déconnecte, car le jeton de rafraîchissement n'est plus exploitable.
   */
  refreshToken(): Observable<JwtResponse> {
    if (this.rafraichissementEnCours) {
      return this.rafraichissementEnCours;
    }

    const jetonRafraichissement = this.getRefreshToken();
    if (!jetonRafraichissement) {
      this.logout();
      return throwError(() => new Error('Session expirée.'));
    }

    this.rafraichissementEnCours = this.http
      .post<JwtResponse>(
        `${this.baseUrl}/refresh`,
        {},
        { headers: new HttpHeaders({ Authorization: `Bearer ${jetonRafraichissement}` }) },
      )
      .pipe(
        tap((jetons) => this.enregistrerJetons(jetons)),
        catchError((erreur) => {
          this.logout();
          return throwError(() => erreur);
        }),
        finalize(() => (this.rafraichissementEnCours = undefined)),
        // `share` évite de relancer la requête pour chaque abonné.
        share(),
      );

    return this.rafraichissementEnCours;
  }

  logout(): void {
    for (const stockage of [localStorage, sessionStorage]) {
      try {
        stockage.removeItem(CLE_ACCES);
        stockage.removeItem(CLE_RAFRAICHISSEMENT);
      } catch {
        // Stockage inaccessible : rien à nettoyer de ce côté.
      }
    }
    this._connecte.set(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this.lire(CLE_ACCES);
  }

  getRefreshToken(): string | null {
    return this.lire(CLE_RAFRAICHISSEMENT);
  }

  isLoggedIn(): boolean {
    return this.jetonValide();
  }

  /** Identifiant du compte connecté, lu dans la revendication `sub` du jeton. */
  getUserId(): string | null {
    const jeton = this.getAccessToken();
    if (!jeton) {
      return null;
    }
    try {
      return this.jwt.decodeToken<ChargeJwt>(jeton)?.sub ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Nom complet du compte connecté.
   *
   * Le jeton émis par cette API ne porte que `iss`, `sub`, `role`, `exp`,
   * `token_type` et `iat` : aucun nom ni e-mail. On interroge donc
   * `GET /user/{id}` pour obtenir un libellé lisible, faute de quoi la barre
   * supérieure afficherait l'UUID du compte.
   */
  getCurrentUser(): Observable<UserResponseDTO | null> {
    const id = this.getUserId();
    if (!id) {
      return of(null);
    }
    return this.http
      .get<UserResponseDTO>(`${environment.apiUrl}/user/${id}`)
      .pipe(catchError(() => of(null)));
  }

  /** Nom lisible extrait du jeton, ou chaîne vide si indisponible. */
  getDisplayName(): string {
    const jeton = this.getAccessToken();
    if (!jeton) {
      return '';
    }

    try {
      const charge = this.jwt.decodeToken<ChargeJwt>(jeton);
      const nomComplet =
        charge?.given_name && charge?.family_name
          ? `${charge.given_name} ${charge.family_name}`
          : undefined;

      // `||` et non `??` : un champ présent mais vide doit laisser la main au
      // suivant, ce que le coalescing des nuls ne ferait pas.
      return (
        charge?.name ||
        charge?.fullName ||
        nomComplet ||
        charge?.username ||
        charge?.preferred_username ||
        charge?.email ||
        charge?.sub ||
        ''
      );
    } catch {
      return '';
    }
  }

  // --- Interne ---------------------------------------------------------------

  /**
   * Conserve les jetons dans `localStorage` pour que la session survive à la
   * fermeture de l'onglet.
   *
   * La version précédente écrivait dans `localStorage && sessionStorage`, une
   * expression qui vaut toujours `sessionStorage` : la session était perdue à
   * chaque fermeture du navigateur.
   */
  private enregistrerJetons(jetons: JwtResponse): void {
    try {
      localStorage.setItem(CLE_ACCES, jetons.accessToken);
      localStorage.setItem(CLE_RAFRAICHISSEMENT, jetons.refreshToken);
    } catch {
      // Navigation privée : on retombe sur le stockage de session.
      sessionStorage.setItem(CLE_ACCES, jetons.accessToken);
      sessionStorage.setItem(CLE_RAFRAICHISSEMENT, jetons.refreshToken);
    }
    this._connecte.set(true);
  }

  private lire(cle: string): string | null {
    try {
      return localStorage.getItem(cle) ?? sessionStorage.getItem(cle);
    } catch {
      return null;
    }
  }

  private jetonValide(): boolean {
    const jeton = this.getAccessToken();
    if (!jeton) {
      return false;
    }
    try {
      return !this.jwt.isTokenExpired(jeton);
    } catch {
      return false;
    }
  }

  private messageDeConnexion(erreur: HttpErrorResponse): string {
    if (erreur.status === 401 || erreur.status === 403) {
      return 'Identifiant ou mot de passe incorrect.';
    }
    if (erreur.status === 0) {
      return "Le serveur est injoignable. Vérifiez que l'API est démarrée.";
    }
    return 'La connexion a échoué. Réessayez dans un instant.';
  }
}
