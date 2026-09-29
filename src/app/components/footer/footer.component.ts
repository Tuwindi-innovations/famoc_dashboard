import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="app-footer">
      FAMOC &middot; Espace d'administration &middot; {{ annee }}
    </footer>
  `,
})
export class FooterComponent {
  /**
   * Calculé une fois à la construction. `new Date()` est acceptable ici : le
   * composant ne tourne que dans le navigateur.
   */
  protected readonly annee = new Date().getFullYear();
}
