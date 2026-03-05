import { inject, Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.includes("/auth/refresh") || req.url.includes("/auth/login")) {
      return next.handle(req);
    }

    const token = this.authService.getAccessToken();

    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap((tokens) => {
              return next.handle(this.addToken(req, tokens.accessToken));
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
}
