import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer pt-0">
      <div class="row align-items-center justify-content-lg-between">
        <div class="col-lg-6">
          <div class="copyright text-center text-lg-left text-muted">
            &copy; {{ annee }} <span class="font-weight-bold ml-1">FAMOC</span> &middot; Tuwindi
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  /** Calculé une fois : le composant ne tourne que dans le navigateur. */
  protected readonly annee = new Date().getFullYear();
}
