import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(
      routes,
      // Les paramètres de route arrivent directement en `input()` des pages.
      withComponentInputBinding(),
      // Une nouvelle page s'ouvre en haut ; un retour arrière retrouve sa
      // position de défilement.
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideToastr({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
    // `JwtHelperService` ne sert qu'à décoder le jeton et vérifier son
    // expiration côté client ; l'envoi de l'en-tête Authorization est du
    // ressort de `authInterceptor`, d'où une configuration minimale ici.
    { provide: JWT_OPTIONS, useValue: {} },
    JwtHelperService,
  ],
};
