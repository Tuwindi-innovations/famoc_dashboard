import { inject, Injectable, Injector } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmDialogComponent,
  DONNEES_CONFIRMATION,
  type DonneesConfirmation,
  type TonConfirmation,
} from '../components/confirm/confirm-dialog.component';

export interface OptionsConfirmation {
  titre: string;
  message: string;
  /** Conséquence exacte de l'action : éléments liés, irréversibilité… */
  detail?: string;
  ton?: TonConfirmation;
  libelleConfirmer?: string;
  libelleAnnuler?: string;
}

/**
 * Demande une confirmation avant une action destructrice.
 *
 * Remplace `window.confirm`, qui bloque le fil d'exécution du navigateur,
 * ignore le design system et ne se prête pas à une mise en forme accessible.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);

  /** Résout à `true` si l'utilisateur confirme, `false` s'il annule. */
  async demander(options: OptionsConfirmation): Promise<boolean> {
    const donnees: DonneesConfirmation = {
      titre: options.titre,
      message: options.message,
      detail: options.detail ?? '',
      ton: options.ton ?? 'danger',
      libelleConfirmer: options.libelleConfirmer ?? 'Confirmer',
      libelleAnnuler: options.libelleAnnuler ?? 'Annuler',
    };

    const reference = this.modal.open(ConfirmDialogComponent, {
      centered: true,
      backdrop: 'static',
      size: 'sm',
      ariaLabelledBy: 'titre-confirmation',
      injector: Injector.create({
        providers: [{ provide: DONNEES_CONFIRMATION, useValue: donnees }],
        parent: this.injector,
      }),
    });

    try {
      return (await reference.result) === true;
    } catch {
      // Fermeture par Échap, clic extérieur ou bouton Annuler.
      return false;
    }
  }

  /** Raccourci pour le cas le plus fréquent : supprimer un élément nommé. */
  supprimer(nomElement: string, detail?: string): Promise<boolean> {
    return this.demander({
      titre: 'Supprimer définitivement ?',
      message: `« ${nomElement} » sera supprimé de la plateforme.`,
      detail,
      ton: 'danger',
      libelleConfirmer: 'Supprimer',
    });
  }
}
