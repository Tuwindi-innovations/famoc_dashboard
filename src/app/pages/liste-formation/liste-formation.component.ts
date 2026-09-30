import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { FormationResponse, Niveau } from '../../models/Formation';
import { ConfirmService } from '../../services/confirm.service';
import { FormationService } from '../../services/formation.service';

/** Libellés lisibles des niveaux renvoyés par l'API. */
const LIBELLE_NIVEAU: Record<string, string> = {
  [Niveau.DEBUTANT]: 'Débutant',
  [Niveau.Intermediaire]: 'Intermédiaire',
  [Niveau.AVANCER]: 'Avancé',
};

/**
 * Pastille Argon par niveau. L'ancienne version comparait le niveau à
 * « INTERMEDIAIRE » et « AVANCE », deux valeurs que l'API n'envoie jamais :
 * seules les formations débutantes étaient colorées.
 */
const BADGE_NIVEAU: Record<string, string> = {
  [Niveau.DEBUTANT]: 'badge-success',
  [Niveau.Intermediaire]: 'badge-warning',
  [Niveau.AVANCER]: 'badge-danger',
};

@Component({
  selector: 'app-liste-formation',
  imports: [RouterLink, NgbDropdownModule],
  templateUrl: './liste-formation.component.html',
})
export class ListeFormationComponent {
  private readonly formationService = inject(FormationService);
  private readonly confirmation = inject(ConfirmService);
  private readonly toast = inject(ToastrService);

  protected readonly formations = signal<FormationResponse[]>([]);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal('');
  protected readonly recherche = signal('');

  /**
   * Formations dont le fichier de couverture manque côté serveur.
   *
   * L'ancienne version masquait simplement la balise `img`, ce qui laissait un
   * rectangle blanc à la place de la vignette. On bascule plutôt sur le même
   * visuel de repli que les formations sans image.
   */
  protected readonly imagesCassees = signal<ReadonlySet<number>>(new Set());

  /** Filtre sur le titre, la description et la catégorie. */
  protected readonly resultats = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    if (!terme) {
      return this.formations();
    }
    return this.formations().filter((f) =>
      [f.titre, f.description, f.categorie]
        .filter(Boolean)
        .some((champ) => champ.toLowerCase().includes(terme)),
    );
  });

  constructor() {
    this.charger();
  }

  protected charger(): void {
    this.chargement.set(true);
    this.erreur.set('');

    this.formationService.afficherFormations().subscribe({
      next: (formations) => {
        this.formations.set(formations);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set(
          "Les formations n'ont pas pu être chargées. Vérifiez que l'API est démarrée.",
        );
        this.chargement.set(false);
      },
    });
  }

  protected async supprimer(formation: FormationResponse): Promise<void> {
    const confirme = await this.confirmation.supprimer(
      formation.titre,
      'Les modules, leçons et quiz de cette formation seront supprimés, ainsi que la progression des apprenants.',
    );
    if (!confirme) {
      return;
    }

    this.formationService.deleteFormation(formation.id).subscribe({
      next: () => {
        this.formations.update((liste) => liste.filter((f) => f.id !== formation.id));
        this.toast.success('Formation supprimée.');
      },
      error: () => this.toast.error("La formation n'a pas pu être supprimée."),
    });
  }

  protected urlImage(chemin: string | undefined): string {
    return chemin ? `${environment.apiUrl}/${chemin}` : '';
  }

  /** Bascule sur le visuel de repli quand le fichier est absent du serveur. */
  protected imageIndisponible(id: number): void {
    this.imagesCassees.update((cassees) => new Set(cassees).add(id));
  }

  /** Vignette affichable, ou chaîne vide si elle manque ou n'a pas chargé. */
  protected vignette(formation: FormationResponse): string {
    return this.imagesCassees().has(formation.id) ? '' : this.urlImage(formation.imageUrl);
  }

  protected libelleNiveau(niveau: string): string {
    return LIBELLE_NIVEAU[niveau] ?? niveau;
  }

  protected badgeNiveau(niveau: string): string {
    return BADGE_NIVEAU[niveau] ?? 'badge-secondary';
  }

  protected surRecherche(evenement: Event): void {
    this.recherche.set((evenement.target as HTMLInputElement).value);
  }
}
