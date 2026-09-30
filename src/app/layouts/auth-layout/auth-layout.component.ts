import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  // Argon applique le fond sombre sur `body.bg-default` ; comme le layout est
  // monté dans le DOM Angular, on le porte ici via `host` plutôt que par un
  // `@HostBinding`.
  host: { class: 'bg-default d-block min-vh-100' },
  imports: [RouterOutlet],
  template: `
    <div class="main-content">
      <router-outlet />
    </div>

    <footer class="py-5">
      <div class="container">
        <div class="row align-items-center justify-content-xl-between">
          <div class="col-xl-6">
            <div class="copyright text-center text-xl-left text-muted">
              &copy; {{ annee }}
              <span class="font-weight-bold ml-1">FAMOC</span> &middot; Tuwindi
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class AuthLayoutComponent {
  protected readonly annee = new Date().getFullYear();

  constructor() {
    // Argon annule la marge réservée au menu latéral via `html.auth-layout`
    // (`angular-differences/_sidebar-and-main-panel.scss`). Sans cette classe,
    // les pages de connexion restaient décalées de la largeur du menu.
    const racine = inject(DOCUMENT).documentElement;
    racine.classList.add('auth-layout');
    inject(DestroyRef).onDestroy(() => racine.classList.remove('auth-layout'));
  }
}
