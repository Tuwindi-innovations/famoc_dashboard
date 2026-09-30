import { Component, inject, InjectionToken } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionRequestDTO } from '../../models/Question';

/** Paramètres d'ouverture de la modale. */
export interface DonneesQuestion {
  titre: string;
  /** Valeurs de départ ; absentes en création. */
  valeurs: QuestionRequestDTO | null;
  edition: boolean;
}

/**
 * `NgbModalRef` n'expose ni `componentRef` ni `setInput` : l'injection est la
 * voie typée pour transmettre ces paramètres, comme pour les autres modales.
 */
export const DONNEES_QUESTION = new InjectionToken<DonneesQuestion>('DONNEES_QUESTION');

@Component({
  selector: 'app-question-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './question-modal.component.html',
})
export class QuestionModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  protected readonly donnees = inject(DONNEES_QUESTION);

  protected readonly questionForm = this.fb.group({
    texte: ['', [Validators.required]],
    type: ['QCM', [Validators.required]],
    points: [1, [Validators.required, Validators.min(1)]],
    reponseOptions: this.fb.array([]),
  });

  constructor() {
    const valeurs = this.donnees.valeurs;

    if (valeurs) {
      this.questionForm.patchValue({
        texte: valeurs.texte,
        type: valeurs.type,
        points: valeurs.points,
      });
      for (const option of valeurs.reponseOptions ?? []) {
        this.ajouterOption(option.texte, option.estCorrecte);
      }
    }

    // Un choix multiple n'a pas de sens en dessous de deux propositions.
    while (this.options.length < 2) {
      this.ajouterOption();
    }
  }

  protected get options(): FormArray {
    return this.questionForm.get('reponseOptions') as FormArray;
  }

  protected ajouterOption(texte = '', estCorrecte = false): void {
    this.options.push(
      this.fb.group({
        texte: [texte, Validators.required],
        estCorrecte: [estCorrecte],
      }),
    );
  }

  /** La dernière paire d'options est conservée : en retirer plus casserait le quiz. */
  protected retirerOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  protected soumettre(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    this.activeModal.close(this.questionForm.getRawValue());
  }
}
