import { Component, computed, inject, output, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { ThemeService, type Theme } from '../../services/theme.service';
import { titrePourUrl } from '../navigation';

/** Libellé et icône associés à chaque état de thème. */
const THEME_UI: Record<Theme, { libelle: string; icone: string }> = {
  system: { libelle: 'Thème : système', icone: 'fa-circle-half-stroke' },
  light: { libelle: 'Thème : clair', icone: 'fa-sun' },
  dark: { libelle: 'Thème : sombre', icone: 'fa-moon' },
};

@Component({
  selector: 'app-topbar',
  imports: [NgbDropdownModule],
  template: `
    <header class="topbar">
      <button
        type="button"
        class="topbar__burger"
        (click)="ouvrirMenu.emit()"
        aria-label="Ouvrir la navigation"
      >
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>

      <h1 class="topbar__title">{{ titre() }}</h1>

      <div class="topbar__spacer"></div>

      <div class="topbar__actions">
        <button
          type="button"
          class="icon-button"
          (click)="basculerTheme()"
          [attr.aria-label]="themeUi().libelle"
          [title]="themeUi().libelle"
        >
          <i class="fa-solid {{ themeUi().icone }}" aria-hidden="true"></i>
        </button>

        <div ngbDropdown placement="bottom-right">
          <button type="button" class="user-menu" ngbDropdownToggle>
            <span class="user-menu__avatar" aria-hidden="true">{{ initiales() }}</span>
            <span class="user-menu__name">{{ nomAffiche() }}</span>
          </button>
          <div ngbDropdownMenu aria-label="Menu du compte">
            <button type="button" ngbDropdownItem (click)="deconnecter()">
              <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  /** Demande à la coquille d'ouvrir la barre latérale (affichage mobile). */
  readonly ouvrirMenu = output<void>();

  /** Titre dérivé de l'URL courante, via le plan de navigation. */
  protected readonly titre = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => titrePourUrl(e.urlAfterRedirects)),
      startWith(titrePourUrl(this.router.url)),
    ),
    { initialValue: titrePourUrl(this.router.url) },
  );

  /**
   * Nom du compte connecté.
   *
   * Le jeton ne contient pas de nom : on affiche d'abord ce qu'il donne (au
   * pire l'identifiant), puis on le remplace par le nom réel dès que
   * `GET /user/{id}` répond.
   */
  protected readonly nomAffiche = signal(this.auth.getDisplayName() || 'Administrateur');

  protected readonly initiales = computed(() => {
    const mots = this.nomAffiche().trim().split(/[\s@._-]+/).filter(Boolean);
    if (!mots.length) {
      return '?';
    }
    const premier = mots[0][0];
    const second = mots.length > 1 ? mots[1][0] : '';
    return (premier + second).toUpperCase();
  });

  protected readonly themeUi = computed(() => THEME_UI[this.themeService.theme()]);

  constructor() {
    this.auth.getCurrentUser().subscribe((utilisateur) => {
      if (!utilisateur) {
        return;
      }
      const nom = [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' ').trim();
      this.nomAffiche.set(nom || utilisateur.email || 'Administrateur');
    });
  }

  protected basculerTheme(): void {
    this.themeService.suivant();
  }

  protected deconnecter(): void {
    this.auth.logout();
  }
}
