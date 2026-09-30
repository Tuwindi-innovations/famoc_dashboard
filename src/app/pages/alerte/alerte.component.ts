import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  AlerteResponse,
  libelleCategorie,
  LIBELLE_STATUT,
  StatutAlerte,
} from '../../models/Alerte';
import { AlertService } from '../../services/alert.service';
import { ConfirmService } from '../../services/confirm.service';
import { environment } from '../../../environments/environment';

/** Les trois sections de la file, dans l'ordre où on les traite. */
interface Section {
  readonly cle: 'attente' | 'encours' | 'traitees';
  readonly titre: string;
  readonly alertes: AlerteResponse[];
}

@Component({
  selector: 'app-alerte',
  imports: [DatePipe],
  templateUrl: './alerte.component.html',
})
export class AlerteComponent {
  private readonly alerteService = inject(AlertService);
  private readonly confirmation = inject(ConfirmService);
  private readonly toast = inject(ToastrService);

  protected readonly alertes = signal<AlerteResponse[]>([]);
  protected readonly chargement = signal(true);
  protected readonly indisponible = signal(false);

  /** Signalement déplié dans la file, ou `null`. */
  protected readonly ouvert = signal<number | null>(null);

  protected readonly libelleCategorie = libelleCategorie;

  constructor() {
    this.charger();
  }

  protected charger(): void {
    this.chargement.set(true);
    this.indisponible.set(false);

    this.alerteService.getAllAlertes().subscribe({
      next: (alertes) => {
        this.alertes.set(alertes);
        this.chargement.set(false);
      },
      error: () => {
        this.indisponible.set(true);
        this.chargement.set(false);
      },
    });
  }

  /**
   * La file, découpée par état et triée du plus ancien au plus récent.
   *
   * L'état d'un signalement se lit à sa place dans la page, pas à une
   * pastille supplémentaire sur chaque ligne. Le plus ancien vient en tête :
   * c'est celui qui attend depuis le plus longtemps.
   */
  protected readonly sections = computed<Section[]>(() => {
    const parAge = [...this.alertes()].sort(
      (a, b) => Date.parse(a.dateCreation ?? '') - Date.parse(b.dateCreation ?? ''),
    );

    const filtrer = (statuts: readonly string[]) =>
      parAge.filter((a) => statuts.includes(a.statut ?? StatutAlerte.ENVOYER));

    const sections: Section[] = [
      { cle: 'attente', titre: 'En attente', alertes: filtrer([StatutAlerte.ENVOYER]) },
      {
        cle: 'encours',
        titre: 'En cours de traitement',
        alertes: filtrer([StatutAlerte.ENCOURSDETRAITEMENT]),
      },
      { cle: 'traitees', titre: 'Traitées', alertes: filtrer([StatutAlerte.RESOLUE]) },
    ];

    return sections.filter((section) => section.alertes.length > 0);
  });

  protected readonly aTraiter = computed(
    () =>
      this.alertes().filter((a) => a.statut !== StatutAlerte.RESOLUE).length,
  );

  protected basculer(id: number): void {
    this.ouvert.update((courant) => (courant === id ? null : id));
  }

  protected libelleStatut(statut: string | null | undefined): string {
    return LIBELLE_STATUT[statut ?? ''] ?? 'En attente';
  }

  /** Nombre de jours écoulés depuis le signalement. */
  protected anciennete(dateCreation: string | null | undefined): number | null {
    if (!dateCreation) {
      return null;
    }
    const depuis = Date.parse(dateCreation);
    if (!Number.isFinite(depuis)) {
      return null;
    }
    return Math.max(0, Math.floor((Date.now() - depuis) / 86_400_000));
  }

  protected urlImage(imageUrl: string | null | undefined): string {
    if (!imageUrl || !imageUrl.trim()) {
      return '';
    }
    const base = environment.apiUrl.endsWith('/') ? environment.apiUrl : `${environment.apiUrl}/`;
    return base + imageUrl.replace(/^\//, '');
  }

  protected resoudre(alerte: AlerteResponse): void {
    if (!alerte.apprenantId) {
      this.toast.warning("Ce signalement n'est rattaché à aucun apprenant.");
      return;
    }

    this.alerteService.resoudreUserAlerte(alerte.id, alerte.apprenantId).subscribe({
      next: (misAJour) => {
        this.alertes.update((liste) =>
          liste.map((a) => (a.id === alerte.id ? misAJour : a)),
        );
        this.toast.success('Signalement marqué comme traité.');
      },
      error: () => this.toast.error("Le signalement n'a pas pu être clôturé."),
    });
  }

  protected async supprimer(alerte: AlerteResponse): Promise<void> {
    const confirme = await this.confirmation.supprimer(
      alerte.titre || 'Ce signalement',
      "Le signalement et sa photo seront retirés de la plateforme. L'apprenant qui l'a remonté n'en sera pas informé.",
    );
    if (!confirme) {
      return;
    }

    this.alerteService.deleteAlerte(alerte.id).subscribe({
      next: () => {
        this.alertes.update((liste) => liste.filter((a) => a.id !== alerte.id));
        this.toast.success('Signalement supprimé.');
      },
      error: () => this.toast.error("Le signalement n'a pas pu être supprimé."),
    });
  }
}
