import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, FooterComponent, SidebarComponent, TopbarComponent],
  template: `
    <a class="skip-link" href="#contenu-principal">Aller au contenu</a>

    <div class="app-shell">
      <app-sidebar [(ouvert)]="menuOuvert" />

      @if (menuOuvert()) {
        <!-- Le voile ferme le panneau au clic ; la même action reste
             accessible au clavier via la touche Échap. -->
        <button
          type="button"
          class="sidebar-scrim"
          (click)="menuOuvert.set(false)"
          aria-label="Fermer la navigation"
        ></button>
      }

      <div class="app-main">
        <app-topbar (ouvrirMenu)="menuOuvert.set(true)" />

        <main class="app-content" id="contenu-principal" tabindex="-1">
          <router-outlet />
        </main>

        <app-footer />
      </div>
    </div>
  `,
  host: { '(document:keydown.escape)': 'menuOuvert.set(false)' },
})
export class AdminLayoutComponent {
  /** Ouverture de la barre latérale en affichage mobile. */
  readonly menuOuvert = signal(false);
}
