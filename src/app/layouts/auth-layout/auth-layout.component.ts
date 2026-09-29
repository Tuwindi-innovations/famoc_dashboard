import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [NgOptimizedImage, RouterOutlet],
  template: `
    <div class="auth">
      <div class="auth__center">
        <div class="auth__panel">
          <div class="auth__brand">
            <img
              class="auth__logo"
              ngSrc="assets/img/brand/famocLogo.png"
              width="99"
              height="70"
              priority
              alt="FAMOC"
            />
            <p class="auth__tagline">Espace d'administration</p>
          </div>

          <router-outlet />
        </div>
      </div>

      <footer class="auth__footer">FAMOC &middot; Tuwindi &middot; {{ annee }}</footer>
    </div>
  `,
})
export class AuthLayoutComponent {
  protected readonly annee = new Date().getFullYear();
}
