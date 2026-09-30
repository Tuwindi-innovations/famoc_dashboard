import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
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

// Les dates et les nombres s'affichaient en anglais : la locale doit être
// enregistrée explicitement, le pipe `date` ne la déduit pas du navigateur.
registerLocaleData(localeFr, 'fr');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },

    // À partir d'Angular 21, `bootstrapApplication` active le mode zoneless
    // PAR DÉFAUT. Or plusieurs pages pilotent encore leur affichage par des
    // propriétés de classe modifiées dans un `subscribe` : sans zone.js, ces
    // mutations ne déclenchent aucun rafraîchissement et les listes restent
    // bloquées sur leur écran de chargement.
    //
    // On réactive donc explicitement la détection par zone. Cette ligne pourra
    // disparaître le jour où toutes les pages auront basculé sur des signals,
    // comme l'ont déjà fait le tableau de bord, les formations et les contacts.
    provideZoneChangeDetection({ eventCoalescing: true }),
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
