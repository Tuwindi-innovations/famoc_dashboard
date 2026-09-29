import { Component, inject, InjectionToken, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeContenu } from '../../models/Cours';

export type TypeFormulaire = 'MODULE' | 'COURS' | 'QUIZ';

/** Valeurs renvoyées à la fermeture ; le fichier n'existe que pour un cours. */
export interface ResultatFormulaire {
  titre: string;
  description: string;
  ordre: number;
  dureeEstimee: number;
  typeContenu: TypeContenu;
  contenu: string;
  videoUrl: string;
  documentUrl: string;
  duree: number;
  scoreMinimum: number;
  nombreTentatives: number;
  fichier: File | null;
}

/** Paramètres d'ouverture de la modale. */
export interface DonneesFormulaire {
  type: TypeFormulaire;
  titre: string;
  /** Valeurs de départ du formulaire, en création comme en modification. */
  valeurs: Partial<ResultatFormulaire>;
  /** Change le libellé du bouton de validation. */
  edition: boolean;
}

/**
 * `NgbModalRef` n'expose ni `componentRef` ni `setInput` : l'injection est la
 * voie typée pour transmettre ces paramètres à la modale.
 */
export const DONNEES_FORMULAIRE = new InjectionToken<DonneesFormulaire>(
  'DONNEES_FORMULAIRE',
);

/** Formats qui attendent un fichier ou une URL externe. */
const FORMATS_AVEC_FICHIER: readonly string[] = [
  TypeContenu.VIDEO,
  TypeContenu.PDF,
  TypeContenu.PRESENTATION,
];

@Component({
  selector: 'app-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './form-modal.component.html',
})
export class FormModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);

  protected readonly donnees = inject(DONNEES_FORMULAIRE);

  protected readonly fichier = signal<File | null>(null);
  protected readonly erreurFichier = signal('');

  protected readonly formulaire = this.fb.nonNullable.group({
    titre: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    ordre: [1, [Validators.required, Validators.min(1)]],
    dureeEstimee: [1, [Validators.required, Validators.min(1)]],
    typeContenu: [TypeContenu.TEXTE],
    contenu: [''],
    videoUrl: [''],
    documentUrl: [''],
    duree: [10, [Validators.required, Validators.min(1)]],
    scoreMinimum: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
    nombreTentatives: [3, [Validators.required, Validators.min(1)]],
  });

  protected readonly formatAttendFichier = signal(false);

  constructor() {
    this.formulaire.patchValue(this.donnees.valeurs);
    this.majFormatFichier();

    this.formulaire.controls.typeContenu.valueChanges.subscribe(() =>
      this.majFormatFichier(),
    );
  }

  protected surFichierChoisi(evenement: Event): void {
    const entree = evenement.target as HTMLInputElement;
    const fichier = entree.files?.[0] ?? null;
    this.fichier.set(fichier);

    if (fichier) {
      this.erreurFichier.set('');
      // Un fichier local rend l'URL externe inutile : on évite que les deux
      // partent ensemble vers le backend.
      this.formulaire.patchValue({ videoUrl: '', documentUrl: '' });
    }
  }

  protected soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    if (this.donnees.type === 'COURS' && !this.sourceContenuFournie()) {
      this.erreurFichier.set(
        'Fournissez un fichier ou une URL pour ce format de leçon.',
      );
      return;
    }

    this.activeModal.close({
      ...this.formulaire.getRawValue(),
      fichier: this.fichier(),
    } satisfies ResultatFormulaire);
  }

  protected estInvalide(champ: keyof typeof this.formulaire.controls): boolean {
    const controle = this.formulaire.controls[champ];
    return controle.invalid && controle.touched;
  }

  /** Un format vidéo ou document exige un fichier ou une URL. */
  private sourceContenuFournie(): boolean {
    const { typeContenu, videoUrl, documentUrl } = this.formulaire.getRawValue();
    if (!FORMATS_AVEC_FICHIER.includes(typeContenu)) {
      return true;
    }
    if (this.fichier()) {
      return true;
    }
    return typeContenu === TypeContenu.VIDEO ? !!videoUrl.trim() : !!documentUrl.trim();
  }

  private majFormatFichier(): void {
    const type = this.formulaire.getRawValue().typeContenu;
    this.formatAttendFichier.set(FORMATS_AVEC_FICHIER.includes(type));
    this.erreurFichier.set('');
  }
}
