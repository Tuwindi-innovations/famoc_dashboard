import { Component, inject, InjectionToken } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/** Niveau de gravité : pilote la couleur et l'icône du bandeau. */
export type TonConfirmation = 'danger' | 'warning' | 'info';

export interface DonneesConfirmation {
  titre: string;
  message: string;
  /** Conséquence exacte de l'action : éléments liés, irréversibilité… */
  detail: string;
  ton: TonConfirmation;
  libelleConfirmer: string;
  libelleAnnuler: string;
}

/**
 * Données de la boîte de dialogue.
 *
 * `NgbModalRef` n'expose que `componentInstance` (typé `any`) et pas de
 * `setInput`, donc les entrées signal ne sont pas alimentables depuis
 * l'extérieur. L'injection est la voie typée pour passer ces données.
 */
export const DONNEES_CONFIRMATION = new InjectionToken<DonneesConfirmation>(
  'DONNEES_CONFIRMATION',
);

const ICONES: Record<TonConfirmation, string> = {
  danger: 'fa-trash-can',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

/** Pastille ronde Argon assortie au ton. */
const FONDS: Record<TonConfirmation, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
};

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="modal-body text-center pt-5 pb-4">
      <div
        class="icon icon-shape rounded-circle text-white shadow mb-4 {{ fond }}"
        aria-hidden="true"
      >
        <i class="fas {{ icone }}"></i>
      </div>

      <h2 class="h4 mb-2" id="titre-confirmation">{{ donnees.titre }}</h2>
      <p class="mb-2">{{ donnees.message }}</p>
      @if (donnees.detail) {
        <p class="text-muted text-sm mb-0">{{ donnees.detail }}</p>
      }
    </div>

    <div class="modal-footer justify-content-center">
      <button type="button" class="btn btn-secondary" (click)="modal.dismiss()">
        {{ donnees.libelleAnnuler }}
      </button>
      <button
        type="button"
        class="btn"
        [class.btn-danger]="donnees.ton === 'danger'"
        [class.btn-primary]="donnees.ton !== 'danger'"
        (click)="modal.close(true)"
      >
        {{ donnees.libelleConfirmer }}
      </button>
    </div>
  `,
  host: { role: 'alertdialog', 'aria-labelledby': 'titre-confirmation' },
})
export class ConfirmDialogComponent {
  readonly modal = inject(NgbActiveModal);
  protected readonly donnees = inject(DONNEES_CONFIRMATION);
  protected readonly icone = ICONES[this.donnees.ton];
  protected readonly fond = FONDS[this.donnees.ton];
}
