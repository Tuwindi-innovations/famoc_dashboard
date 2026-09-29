import { Component, computed, inject, Injector, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { CoursRequestDTO, CoursResponseDTO, TypeContenu } from '../../models/Cours';
import { FormationResponse } from '../../models/Formation';
import { ModuleRequest, ModuleResponse } from '../../models/Module';
import { QuestionResponseDTO } from '../../models/Question';
import { QuizRequestDTO, QuizResponseDTO } from '../../models/Quiz';
import { ConfirmService } from '../../services/confirm.service';
import { CoursService } from '../../services/cours.service';
import { FormationService } from '../../services/formation.service';
import { ModuleService } from '../../services/module.service';
import { QuestionService } from '../../services/question.service';
import { QuizService } from '../../services/quiz.service';
import { environment } from '../../../environments/environment';
import {
  DONNEES_FORMULAIRE,
  FormModalComponent,
  type DonneesFormulaire,
  type ResultatFormulaire,
  type TypeFormulaire,
} from '../form-modal/form-modal.component';
import { QuestionModalComponent } from '../question-modal/question-modal.component';

/** Module enrichi de son contenu chargé à la demande. */
interface ModuleAffiche extends ModuleResponse {
  deplie: boolean;
  chargement: boolean;
  charge: boolean;
  cours: CoursResponseDTO[];
  quiz: QuizResponseDTO | null;
  questions: QuestionResponseDTO[];
}

/** Libellés lisibles des niveaux renvoyés par l'API. */
const LIBELLE_NIVEAU: Record<string, string> = {
  DEBUTANT: 'Débutant',
  Intermediaire: 'Intermédiaire',
  AVANCER: 'Avancé',
};

/** Libellés lisibles des formats de leçon. */
const LIBELLE_FORMAT: Record<TypeContenu, string> = {
  [TypeContenu.TEXTE]: 'Article',
  [TypeContenu.VIDEO]: 'Vidéo',
  [TypeContenu.PDF]: 'PDF',
  [TypeContenu.PRESENTATION]: 'Présentation',
};

const ICONE_FORMAT: Record<TypeContenu, string> = {
  [TypeContenu.TEXTE]: 'fa-align-left',
  [TypeContenu.VIDEO]: 'fa-play',
  [TypeContenu.PDF]: 'fa-file-pdf',
  [TypeContenu.PRESENTATION]: 'fa-display',
};

@Component({
  selector: 'app-formation-detail',
  imports: [RouterLink],
  templateUrl: './formation-detail.component.html',
})
export class FormationDetailComponent {
  private readonly modal = inject(NgbModal);
  private readonly injector = inject(Injector);
  private readonly confirmation = inject(ConfirmService);
  private readonly toast = inject(ToastrService);
  private readonly formationService = inject(FormationService);
  private readonly moduleService = inject(ModuleService);
  private readonly coursService = inject(CoursService);
  private readonly quizService = inject(QuizService);
  private readonly questionService = inject(QuestionService);

  /** Fourni par le routeur via `withComponentInputBinding`. */
  readonly id = input.required<string>();

  protected readonly formation = signal<FormationResponse | null>(null);
  protected readonly modules = signal<ModuleAffiche[]>([]);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal('');

  protected readonly libelleFormat = LIBELLE_FORMAT;

  protected libelleNiveau(niveau: string): string {
    return LIBELLE_NIVEAU[niveau] ?? niveau;
  }
  protected readonly iconeFormat = ICONE_FORMAT;

  protected readonly totalCours = computed(() =>
    this.modules().reduce((somme, m) => somme + (m.nombreCours ?? 0), 0),
  );

  constructor() {
    // `id` arrive par binding d'entrée ; on charge dès qu'il est disponible.
    queueMicrotask(() => this.charger());
  }

  protected charger(): void {
    const identifiant = Number(this.id());
    if (!Number.isFinite(identifiant)) {
      this.erreur.set('Identifiant de formation invalide.');
      this.chargement.set(false);
      return;
    }

    this.chargement.set(true);
    this.erreur.set('');

    this.formationService.getFormationById(identifiant).subscribe({
      next: (formation) => {
        this.formation.set(formation);
        this.chargerModules(identifiant);
      },
      error: () => {
        this.erreur.set("Cette formation est introuvable ou l'API est injoignable.");
        this.chargement.set(false);
      },
    });
  }

  private chargerModules(formationId: number): void {
    this.moduleService.getModulesByFormation(formationId).subscribe({
      next: (modules) => {
        this.modules.set(
          [...modules]
            .sort((a, b) => a.ordre - b.ordre)
            .map((m) => ({
              ...m,
              deplie: false,
              chargement: false,
              charge: false,
              cours: [],
              quiz: null,
              questions: [],
            })),
        );
        this.chargement.set(false);
      },
      error: () => {
        this.toast.error("Les modules n'ont pas pu être chargés.");
        this.chargement.set(false);
      },
    });
  }

  // --- Dépliage / chargement paresseux ---------------------------------------

  protected basculerModule(id: number): void {
    const module = this.modules().find((m) => m.id === id);
    if (!module) {
      return;
    }

    this.majModule(id, { deplie: !module.deplie });

    if (!module.deplie && !module.charge) {
      this.chargerContenu(id);
    }
  }

  private chargerContenu(moduleId: number): void {
    this.majModule(moduleId, { chargement: true });

    this.coursService.getCoursByModule(moduleId).subscribe({
      next: (cours) =>
        this.majModule(moduleId, {
          cours: [...cours].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)),
          chargement: false,
          charge: true,
        }),
      error: () => this.majModule(moduleId, { chargement: false, charge: true }),
    });

    // Un module sans quiz fait répondre l'API en erreur : c'est un cas normal,
    // pas une panne, d'où le repli sur `null`.
    this.quizService
      .getQuizByModule(moduleId)
      .pipe(catchError(() => of(null)))
      .subscribe((quiz) => {
        this.majModule(moduleId, { quiz });
        if (quiz?.id) {
          this.chargerQuestions(moduleId, quiz.id);
        }
      });
  }

  private chargerQuestions(moduleId: number, quizId: number): void {
    this.questionService
      .getQuestionsByQuiz(quizId)
      .pipe(catchError(() => of([] as QuestionResponseDTO[])))
      .subscribe((questions) => this.majModule(moduleId, { questions }));
  }

  /** Remplace un module par une copie modifiée, sans muter le signal en place. */
  private majModule(id: number, champs: Partial<ModuleAffiche>): void {
    this.modules.update((liste) =>
      liste.map((m) => (m.id === id ? { ...m, ...champs } : m)),
    );
  }

  // --- Modules ---------------------------------------------------------------

  protected async ajouterModule(): Promise<void> {
    const resultat = await this.ouvrirFormulaire('MODULE', 'Nouveau module', {
      ordre: this.modules().length + 1,
    });
    if (!resultat) {
      return;
    }

    const formation = this.formation();
    if (!formation) {
      return;
    }

    this.moduleService.createModule(formation.id, this.versModule(resultat)).subscribe({
      next: (module) => {
        this.modules.update((liste) => [
          ...liste,
          {
            ...module,
            deplie: false,
            chargement: false,
            charge: true,
            cours: [],
            quiz: null,
            questions: [],
          },
        ]);
        this.toast.success('Module ajouté.');
      },
      error: () => this.toast.error("Le module n'a pas pu être créé."),
    });
  }

  protected async modifierModule(module: ModuleAffiche): Promise<void> {
    const resultat = await this.ouvrirFormulaire(
      'MODULE',
      'Modifier le module',
      {
        titre: module.titre,
        description: module.description,
        ordre: module.ordre,
        dureeEstimee: module.dureeEstimee,
      },
      true,
    );
    if (!resultat) {
      return;
    }

    this.moduleService.updateModule(module.id, this.versModule(resultat)).subscribe({
      next: (misAJour) => {
        this.majModule(module.id, misAJour);
        this.trierModules();
        this.toast.success('Module mis à jour.');
      },
      error: () => this.toast.error("Le module n'a pas pu être modifié."),
    });
  }

  protected async supprimerModule(module: ModuleAffiche): Promise<void> {
    const confirme = await this.confirmation.supprimer(
      module.titre,
      'Les leçons et le quiz rattachés à ce module seront supprimés avec lui. Cette action est irréversible.',
    );
    if (!confirme) {
      return;
    }

    this.moduleService.deleteModule(module.id).subscribe({
      next: () => {
        this.modules.update((liste) => liste.filter((m) => m.id !== module.id));
        this.toast.success('Module supprimé.');
      },
      error: () => this.toast.error("Le module n'a pas pu être supprimé."),
    });
  }

  /** Déplace un module d'un cran et persiste le nouvel ordre. */
  protected deplacerModule(index: number, direction: -1 | 1): void {
    const liste = [...this.modules()];
    const cible = index + direction;
    if (cible < 0 || cible >= liste.length) {
      return;
    }

    [liste[index], liste[cible]] = [liste[cible], liste[index]];
    const reordonnee = liste.map((m, i) => ({ ...m, ordre: i + 1 }));
    this.modules.set(reordonnee);

    const formation = this.formation();
    if (!formation) {
      return;
    }

    this.moduleService
      .reorderModules(
        formation.id,
        reordonnee.map((m) => m.id),
      )
      .subscribe({
        // L'ordre affiché est déjà à jour : en cas d'échec on recharge pour
        // revenir à l'état réel du serveur plutôt que de mentir à l'écran.
        error: () => {
          this.toast.error("L'ordre n'a pas pu être enregistré.");
          this.chargerModules(formation.id);
        },
      });
  }

  // --- Leçons ----------------------------------------------------------------

  protected async ajouterCours(module: ModuleAffiche): Promise<void> {
    const resultat = await this.ouvrirFormulaire('COURS', 'Nouvelle leçon', {
      ordre: module.cours.length + 1,
    });
    if (!resultat) {
      return;
    }

    this.coursService
      .createCours(module.id, this.versCours(resultat), resultat.fichier ?? undefined)
      .subscribe({
        next: (cours) => {
          this.majModule(module.id, {
            cours: [...module.cours, cours],
            nombreCours: (module.nombreCours ?? 0) + 1,
          });
          this.toast.success('Leçon ajoutée.');
        },
        error: () => this.toast.error("La leçon n'a pas pu être créée."),
      });
  }

  protected async modifierCours(
    module: ModuleAffiche,
    cours: CoursResponseDTO,
  ): Promise<void> {
    const resultat = await this.ouvrirFormulaire(
      'COURS',
      'Modifier la leçon',
      {
        titre: cours.titre,
        contenu: cours.contenu,
        typeContenu: cours.typeContenu,
        videoUrl: cours.videoUrl,
        documentUrl: cours.documentUrl,
        ordre: cours.ordre,
      },
      true,
    );
    if (!resultat) {
      return;
    }

    this.coursService.updateCours(cours.id, this.versCours(resultat)).subscribe({
      next: (misAJour) => {
        this.majModule(module.id, {
          cours: module.cours
            .map((c) => (c.id === cours.id ? misAJour : c))
            .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)),
        });
        this.toast.success('Leçon mise à jour.');
      },
      error: () => this.toast.error("La leçon n'a pas pu être modifiée."),
    });
  }

  protected async supprimerCours(
    module: ModuleAffiche,
    cours: CoursResponseDTO,
  ): Promise<void> {
    const confirme = await this.confirmation.supprimer(cours.titre);
    if (!confirme) {
      return;
    }

    this.coursService.deleteCours(cours.id).subscribe({
      next: () => {
        this.majModule(module.id, {
          cours: module.cours.filter((c) => c.id !== cours.id),
          nombreCours: Math.max(0, (module.nombreCours ?? 1) - 1),
        });
        this.toast.success('Leçon supprimée.');
      },
      error: () => this.toast.error("La leçon n'a pas pu être supprimée."),
    });
  }

  protected deplacerCours(module: ModuleAffiche, index: number, direction: -1 | 1): void {
    const liste = [...module.cours];
    const cible = index + direction;
    if (cible < 0 || cible >= liste.length) {
      return;
    }

    [liste[index], liste[cible]] = [liste[cible], liste[index]];
    const reordonnee = liste.map((c, i) => ({ ...c, ordre: i + 1 }));
    this.majModule(module.id, { cours: reordonnee });

    this.coursService
      .reorderCours(
        module.id,
        reordonnee.map((c) => c.id),
      )
      .subscribe({
        error: () => {
          this.toast.error("L'ordre n'a pas pu être enregistré.");
          this.chargerContenu(module.id);
        },
      });
  }

  // --- Quiz ------------------------------------------------------------------

  protected async creerQuiz(module: ModuleAffiche): Promise<void> {
    const resultat = await this.ouvrirFormulaire('QUIZ', 'Créer le quiz du module', {
      titre: `Quiz — ${module.titre}`,
    });
    if (!resultat) {
      return;
    }

    this.quizService.createQuiz(module.id, this.versQuiz(resultat)).subscribe({
      next: (quiz) => {
        this.majModule(module.id, { quiz, hasQuiz: true });
        this.toast.success('Quiz créé.');
      },
      error: () =>
        this.toast.error("Le quiz n'a pas pu être créé. Ce module en a peut-être déjà un."),
    });
  }

  protected async modifierQuiz(module: ModuleAffiche): Promise<void> {
    const quiz = module.quiz;
    if (!quiz) {
      return;
    }

    const resultat = await this.ouvrirFormulaire(
      'QUIZ',
      'Modifier le quiz',
      {
        titre: quiz.titre,
        description: quiz.description,
        duree: quiz.duree,
        scoreMinimum: quiz.scoreMinimum,
        nombreTentatives: quiz.nombreTentatives,
      },
      true,
    );
    if (!resultat) {
      return;
    }

    this.quizService.updateQuiz(quiz.id, this.versQuiz(resultat)).subscribe({
      next: (misAJour) => {
        this.majModule(module.id, { quiz: misAJour });
        this.toast.success('Quiz mis à jour.');
      },
      error: () => this.toast.error("Le quiz n'a pas pu être modifié."),
    });
  }

  protected async supprimerQuiz(module: ModuleAffiche): Promise<void> {
    const quiz = module.quiz;
    if (!quiz) {
      return;
    }

    const confirme = await this.confirmation.supprimer(
      quiz.titre,
      'Les questions du quiz et les tentatives des apprenants seront perdues.',
    );
    if (!confirme) {
      return;
    }

    this.quizService.deleteQuiz(quiz.id).subscribe({
      next: () => {
        this.majModule(module.id, { quiz: null, questions: [], hasQuiz: false });
        this.toast.success('Quiz supprimé.');
      },
      error: () => this.toast.error("Le quiz n'a pas pu être supprimé."),
    });
  }

  protected ajouterQuestion(module: ModuleAffiche): void {
    const quiz = module.quiz;
    if (!quiz) {
      return;
    }

    const reference = this.modal.open(QuestionModalComponent, { size: 'lg' });
    reference.result.then(
      (resultat) => {
        if (!resultat) {
          return;
        }
        this.questionService.createQuestion(quiz.id, resultat).subscribe({
          next: () => {
            this.chargerQuestions(module.id, quiz.id);
            this.toast.success('Question ajoutée.');
          },
          error: () => this.toast.error("La question n'a pas pu être ajoutée."),
        });
      },
      () => {
        /* modale fermée sans validation */
      },
    );
  }

  protected async supprimerQuestion(
    module: ModuleAffiche,
    question: QuestionResponseDTO,
  ): Promise<void> {
    const confirme = await this.confirmation.supprimer(question.texte);
    if (!confirme) {
      return;
    }

    this.questionService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.majModule(module.id, {
          questions: module.questions.filter((q) => q.id !== question.id),
        });
        this.toast.success('Question supprimée.');
      },
      error: () => this.toast.error("La question n'a pas pu être supprimée."),
    });
  }

  // --- Utilitaires -----------------------------------------------------------

  protected urlImage(chemin: string | undefined): string {
    return chemin ? `${environment.apiUrl}/${chemin}` : '';
  }

  /** Masque l'image quand le fichier est absent côté serveur. */
  protected imageIndisponible(evenement: Event): void {
    (evenement.target as HTMLImageElement).style.display = 'none';
  }

  private trierModules(): void {
    this.modules.update((liste) => [...liste].sort((a, b) => a.ordre - b.ordre));
  }

  private async ouvrirFormulaire(
    type: TypeFormulaire,
    titre: string,
    valeurs: Partial<ResultatFormulaire>,
    edition = false,
  ): Promise<ResultatFormulaire | null> {
    // En création, `valeurs` ne porte qu'un ordre de départ ; en modification,
    // l'objet complet. Dans les deux cas la modale les applique telles quelles.
    const donnees: DonneesFormulaire = { type, titre, valeurs, edition };

    const reference = this.modal.open(FormModalComponent, {
      size: type === 'COURS' ? 'lg' : undefined,
      backdrop: 'static',
      ariaLabelledBy: 'titre-modale-contenu',
      injector: Injector.create({
        providers: [{ provide: DONNEES_FORMULAIRE, useValue: donnees }],
        parent: this.injector,
      }),
    });

    try {
      return (await reference.result) as ResultatFormulaire;
    } catch {
      return null;
    }
  }

  private versModule(r: ResultatFormulaire): ModuleRequest {
    return {
      titre: r.titre,
      description: r.description,
      ordre: r.ordre,
      dureeEstimee: r.dureeEstimee,
    };
  }

  private versCours(r: ResultatFormulaire): CoursRequestDTO {
    return {
      titre: r.titre,
      contenu: r.contenu,
      typeContenu: r.typeContenu,
      videoUrl: r.videoUrl,
      documentUrl: r.documentUrl,
      ordre: r.ordre,
    };
  }

  private versQuiz(r: ResultatFormulaire): QuizRequestDTO {
    return {
      titre: r.titre,
      description: r.description,
      duree: r.duree,
      scoreMinimum: r.scoreMinimum,
      nombreTentatives: r.nombreTentatives,
    };
  }
}
