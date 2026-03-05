import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError, of } from "rxjs";
import { JwtHelperService, JWT_OPTIONS } from "@auth0/angular-jwt";
import { User } from "../models/User";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { catchError, tap, filter, switchMap, take } from "rxjs/operators";

// 1. Requête de connexion (LoginRequest)
interface LoginRequest {
  identifiant: string;
  motDePasse: string;
}

// 2. Requête d'inscription (SignupRequest)
interface SignupRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: string;
}

// 3. Réponse de Connexion (JwtResponse)
interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private serviceUrl: string;
  private baseUrl: string = "auth";
  constructor(
    private http: HttpClient,
    @Inject(JWT_OPTIONS) private jwtOptions: any,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {
    this.serviceUrl = environment.apiUrl;
    this.isAuthenticatedSubject.next(this.isLoggedIn());
  }

  signIn(identifiant: string, motDePasse: string): Observable<JwtResponse> {
    const authRequest: LoginRequest = { identifiant, motDePasse };
    return this.http
      .post<JwtResponse>(
        `${this.serviceUrl}/${this.baseUrl}/login`,
        authRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .pipe(
        tap((tokens) => this.saveTokens(tokens)),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = "Une erreur est survenue";
          if (error.status === 401) {
            errorMessage = "Identifiant ou mot de passe incorrect";
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * 2. Inscription d'un nouvel utilisateur
   * Endpoint: POST /api-infotech/auth/signup
   */
  signUp(userData: SignupRequest): Observable<User> {
    return this.http.post<User>(
      `${this.serviceUrl}/${this.baseUrl}/signup`,
      userData
    );
  }

  public refreshTokens(refreshToken: string): Observable<JwtResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${refreshToken}`,
    });

    // Le corps de la requête POST est vide ({}) car toutes les infos sont dans le header.
    return this.http.post<JwtResponse>(
      `${this.serviceUrl}/${this.baseUrl}/refresh`,
      {},
      { headers }
    );
  }

  private saveTokens(tokens: JwtResponse): void {
    const storage = localStorage && sessionStorage;
    storage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  public signOut() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("username");
  }

  logout(): void {
    [window.localStorage, window.sessionStorage].forEach((storage) => {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
    });
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(["/login"]);
  }

  getAccessToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
    );
  }

  getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  getDisplayName(): string {
    const token = this.getAccessToken();
    if (!token) {
      return "";
    }
    try {
      const payload: any = this.jwtHelper.decodeToken(token);
      const name =
        payload?.name ||
        payload?.fullName ||
        (payload?.given_name && payload?.family_name
          ? `${payload.given_name} ${payload.family_name}`
          : "") ||
        payload?.username ||
        payload?.preferred_username ||
        payload?.email ||
        payload?.sub ||
        "";
      return typeof name === "string" ? name : "";
    } catch {
      return "";
    }
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  refreshToken(): Observable<JwtResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error("No refresh token"));
    }

    return this.http
      .post<JwtResponse>(`${this.serviceUrl}/${this.baseUrl}/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((tokens) => this.saveTokens(tokens)),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        })
      );
  }
}
