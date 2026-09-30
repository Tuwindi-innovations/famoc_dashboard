import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { titrePourUrl } from '../navigation';

@Component({
  selector: 'app-navbar',
  imports: [NgbDropdownModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

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
   * L'ancienne version lisait `sessionStorage['user']`, une clé que rien
   * n'écrivait : le menu restait donc toujours vide. Le jeton ne portant ni
   * nom ni e-mail, on interroge `GET /user/{id}`.
   */
  protected readonly nomAffiche = signal(this.auth.getDisplayName() || 'Administrateur');

  protected readonly initiales = computed(() => {
    const mots = this.nomAffiche().trim().split(/[\s@._-]+/).filter(Boolean);
    if (!mots.length) {
      return '?';
    }
    return (mots[0][0] + (mots.length > 1 ? mots[1][0] : '')).toUpperCase();
  });

  constructor() {
    this.auth.getCurrentUser().subscribe((utilisateur) => {
      if (!utilisateur) {
        return;
      }
      const nom = [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' ').trim();
      this.nomAffiche.set(nom || utilisateur.email || 'Administrateur');
    });
  }

  protected deconnecter(): void {
    this.auth.logout();
  }
}
