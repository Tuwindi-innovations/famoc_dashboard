import { CanActivate, CanActivateFn, Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { Injectable } from "@angular/core";

// export class AuthGuard implements CanActivate {

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   canActivate():
//     | Observable<boolean | UrlTree>
//     | Promise<boolean | UrlTree>
//     | boolean
//     | UrlTree {

//     // Vérifie si l'utilisateur est authentifié
//     if (this.authService.isAuthenticated()) {
//       return true;
//     }
//     // Sinon, redirige vers la page de connexion
//     this.router.navigate(['/login']);
//     return false;
//   }
// }

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    return this.router.parseUrl("/login");
  }
}
