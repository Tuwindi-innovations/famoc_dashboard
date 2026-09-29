import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { FormationRequest, Niveau } from '../../models/Formation';
import { FormationService } from '../../services/formation.service';

/** Niveaux proposés, avec le libellé affiché à l'administrateur. */
const NIVEAUX: readonly { valeur: Niveau; libelle: string }[] = [
  { valeur: Niveau.DEBUTANT, libelle: 'Débutant' },
  { valeur: Niveau.Intermediaire, libelle: 'Intermédiaire' },
  { valeur: Niveau.AVANCER, libelle: 'Avancé' },
];

const TAILLE_MAX_IMAGE = 5 * 1024 * 1024; // 5 Mo

@Component({
  selector: 'app-add-up-formation',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-up-formation.component.html',
})
export class AddUpFormationComponent {
  private readonly formationService = inject(FormationService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  /** Présent sur la route de modification, absent sur celle de création. */
  readonly id = input<string | undefined>();

  protected readonly niveaux = NIVEAUX;
  protected readonly modeEdition = computed(() => !!this.id());

  protected readonly chargement = signal(false);
  protected readonly envoiEnCours = signal(false);
  protected readonly erreurImage = signal('');
  protected readonly apercu = signal<string | null>(null);

  private fichiers: File[] = [];

  protected readonly formulaire = this.fb.nonNullable.group({
    titre: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    categorie: [''],
    dureeEstimee: [1, [Validators.required, Validators.min(1)]],
    niveau: [Niveau.DEBUTANT, [Validators.required]],
  });

  constructor() {
    queueMicrotask(() => {
      if (this.modeEdition()) {
        this.chargerFormation(Number(this.id()));
      }
    });
  }

  private chargerFormation(identifiant: number): void {
    this.chargement.set(true);

    this.formationService.getFormationById(identifiant).subscribe({
      next: (formation) => {
        this.formulaire.patchValue({
          titre: formation.titre,
          description: formation.description,
          categorie: formation.categorie ?? '',
          dureeEstimee: formation.dureeEstimee,
          niveau: formation.niveau,
        });
        if (formation.imageUrl) {
          this.apercu.set(`${environment.apiUrl}/${formation.imageUrl}`);
        }
        this.chargement.set(false);
      },
      error: () => {
        this.toast.error('Cette formation est introuvable.');
        this.chargement.set(false);
        this.router.navigate(['/liste-formation']);
      },
    });
  }

  protected surImageChoisie(evenement: Event): void {
    const entree = evenement.target as HTMLInputElement;
    const fichiers = Array.from(entree.files ?? []);
    this.erreurImage.set('');

    const tropVolumineux = fichiers.find((f) => f.size > TAILLE_MAX_IMAGE);
    if (tropVolumineux) {
      this.erreurImage.set(`« ${tropVolumineux.name} » dépasse 5 Mo.`);
      entree.value = '';
      return;
    }

    this.fichiers = fichiers;

    // Aperçu local : l'administrateur voit ce qu'il envoie avant de valider.
    const premier = fichiers[0];
    if (premier) {
      const lecteur = new FileReader();
      lecteur.onload = () => this.apercu.set(String(lecteur.result));
      lecteur.readAsDataURL(premier);
    }
  }

  protected soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    if (!this.modeEdition() && !this.fichiers.length) {
      this.erreurImage.set('Ajoutez une image de couverture pour la formation.');
      return;
    }

    this.envoiEnCours.set(true);
    const valeurs = this.formulaire.getRawValue();

    // Le backend attend `dureeEstimee` en chaîne dans le JSON de création.
    const requete: FormationRequest = {
      titre: valeurs.titre,
      description: valeurs.description,
      categorie: valeurs.categorie,
      dureeEstimee: String(valeurs.dureeEstimee),
      niveau: valeurs.niveau,
    };

    const operation = this.modeEdition()
      ? this.formationService.modifier(Number(this.id()), requete)
      : this.formationService.ajouterFormation(requete, this.fichiers);

    operation.subscribe({
      next: (formation) => {
        this.envoiEnCours.set(false);
        this.toast.success(
          this.modeEdition() ? 'Formation mise à jour.' : 'Formation créée.',
        );
        this.router.navigate(['/formations', 'detail', formation.id]);
      },
      error: () => {
        this.envoiEnCours.set(false);
        this.toast.error(
          this.modeEdition()
            ? "La formation n'a pas pu être modifiée."
            : "La formation n'a pas pu être créée.",
        );
      },
    });
  }

  protected estInvalide(champ: keyof typeof this.formulaire.controls): boolean {
    const controle = this.formulaire.controls[champ];
    return controle.invalid && controle.touched;
  }
}
