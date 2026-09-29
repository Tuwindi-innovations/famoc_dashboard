import { Component, inject, DOCUMENT } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.masquerLesImagesCassees();
  }

  /**
   * Masque les vignettes dont le fichier est absent côté serveur.
   *
   * Plusieurs fichiers téléversés référencés en base n'existent plus sur le
   * disque de l'API, qui répond alors en erreur : le navigateur afficherait
   * son icône « image cassée » suivie du texte alternatif.
   *
   * L'évènement `error` d'une image ne remonte pas dans l'arbre : un écouteur
   * d'hôte ne le verrait jamais. On écoute donc en phase de capture, une seule
   * fois pour toute l'application, plutôt que d'ajouter un gestionnaire à
   * chaque balise `<img>` de chaque page.
   */
  private masquerLesImagesCassees(): void {
    this.document.addEventListener(
      'error',
      (evenement: Event) => {
        const cible = evenement.target;
        if (cible instanceof HTMLImageElement) {
          cible.style.visibility = 'hidden';
        }
      },
      true,
    );
  }
}
