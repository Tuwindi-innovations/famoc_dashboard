import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, FooterComponent, NavbarComponent, SidebarComponent],
  // `.navbar-top` est positionné en absolu par Argon (`custom/_content.scss`) :
  // c'est l'en-tête coloré de chaque page, avec son `pt-md-8`, qui lui réserve
  // la place. Le `container-fluid mt--6` qui enveloppait le routeur venait
  // d'Argon PRO et remontait les pages par-dessus le bandeau, le rendant
  // inaccessible ; il est donc retiré.
  template: `
    <a class="skip-link sr-only sr-only-focusable" href="#panel">Aller au contenu</a>

    <app-sidebar />
    <div class="main-content" id="panel">
      <app-navbar />
      <router-outlet />
      <div class="container-fluid">
        <app-footer />
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {}
