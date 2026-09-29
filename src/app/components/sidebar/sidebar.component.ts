import { NgOptimizedImage } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NAVIGATION } from '../navigation';

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  /**
   * Ouverture du panneau en affichage mobile. Piloté par la barre supérieure,
   * d'où le `model()` plutôt qu'une paire input/output.
   */
  readonly ouvert = model(false);

  protected readonly navigation = NAVIGATION;

  protected fermer(): void {
    this.ouvert.set(false);
  }

  protected deconnecter(): void {
    // `AuthService.logout()` purge les deux stockages et redirige : c'est la
    // seule voie de sortie, pour éviter les clés oubliées.
    this.auth.logout();
  }
}
