import { Component, inject, signal } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NAVIGATION } from '../navigation';

@Component({
  selector: 'app-sidebar',
  imports: [NgbCollapseModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  protected readonly navigation = NAVIGATION;
  protected readonly replie = signal(true);

  protected basculer(): void {
    this.replie.update((valeur) => !valeur);
  }

  protected fermer(): void {
    this.replie.set(true);
  }

  /**
   * `AuthService.logout()` purge les deux stockages et redirige.
   *
   * L'ancienne version retirait la clé « token », que rien n'écrivait : la
   * déconnexion laissait donc la session active.
   */
  protected deconnecter(): void {
    this.auth.logout();
  }
}
