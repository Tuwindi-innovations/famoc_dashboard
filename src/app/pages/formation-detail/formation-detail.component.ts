import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CoursRequestDTO, CoursResponseDTO } from "src/app/models/Cours";
import { FormationResponse } from "src/app/models/Formation";
import { ModuleResponse } from "src/app/models/Module";
import { QuizRequestDTO, QuizResponseDTO } from "src/app/models/Quiz";
import { CoursService } from "src/app/services/cours.service";
import { FormationService } from "src/app/services/formation.service";
import { ModuleService } from "src/app/services/module.service";
import { QuestionService } from "src/app/services/question.service";
import { QuizService } from "src/app/services/quiz.service";
import { environment } from "src/environments/environment";
import { FormModalComponent } from "../form-modal/form-modal.component";
import { QuestionModalComponent } from "../question-modal/question-modal.component";
import { QuestionResponseDTO } from "src/app/models/Question";

interface ModuleUI extends ModuleResponse {
  isOpen: boolean;
  cours?: CoursResponseDTO[];
  quiz?: QuizResponseDTO | null;
  question?: QuestionResponseDTO[];
  isLessonsLoading?: boolean;
}

@Component({
  selector: "app-formation-detail",
  templateUrl: "./formation-detail.component.html",
  styleUrls: ["./formation-detail.component.scss"],
})
export class FormationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private modalService = inject(NgbModal);
  private formationService = inject(FormationService);
  private courService = inject(CoursService);
  private moduleService = inject(ModuleService);
  private quizService = inject(QuizService);
  private questionService = inject(QuestionService);

  modules: ModuleUI[] = [];
  formation: FormationResponse | null = null;
  isLoading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadFormationData(Number(id));
    }
  }

  loadFormationData(id: number) {
    this.isLoading = true;
    this.formationService.getFormationById(id).subscribe({
      next: (data) => {
        this.formation = data;
        this.loadModules(id);
      },
      error: (err) => (this.isLoading = false),
    });
  }

  loadModules(formationId: number) {
    this.moduleService.getModulesByFormation(formationId).subscribe((mods) => {
      this.modules = mods.map((m) => ({ ...m, isOpen: false, cours: [] }));
      this.isLoading = false;
    });
  }

  toggleModule(index: number) {
    const module = this.modules[index];
    module.isOpen = !module.isOpen;
    if (module.isOpen && module.cours?.length === 0) {
      this.loadModuleContent(index);
    }
  }

  loadModuleContent(index: number) {
    const module = this.modules[index];
    module.isLessonsLoading = true;

    // On charge les cours
    this.courService.getCoursByModule(module.id).subscribe((cours) => {
      module.cours = cours;
      module.isLessonsLoading = false;
    });

    // On charge aussi le quiz du module
    this.quizService.getQuizByModule(module.id).subscribe((quiz) => {
      module.quiz = quiz;
      if (quiz && quiz.id) {
        this.questionService
          .getQuestionsByQuiz(quiz.id)
          .subscribe((questions) => {
            module.question = questions;
          });
      }
    });
  }

  // --- Méthodes CRUD (Actions) ---

  addModule() {
    const modalRef = this.modalService.open(FormModalComponent);
    modalRef.componentInstance.title = "Nouveau Module";
    modalRef.componentInstance.type = "MODULE";

    modalRef.result
      .then((result) => {
        if (result) {
          const newModule = {
            titre: result.titre,
            description: result.description,
            ordre: result.ordre,
            dureeEstimee: result.dureeEstimee,
          };

          this.moduleService
            .createModule(this.formation!.id, newModule)
            .subscribe((res) => {
              this.modules.push({
                ...res,
                isOpen: false,
                cours: [],
                quiz: null,
              });
            });
        }
      })
      .catch(() => {}); // Gère la fermeture sans sauvegarde
  }

  addCours(moduleId: number, index: number) {
    const modalRef = this.modalService.open(FormModalComponent);
    modalRef.componentInstance.title = "Ajouter une leçon";
    modalRef.componentInstance.type = "COURS";

    modalRef.result
      .then((result) => {
        if (result) {
          if (!this.modules[index].cours) {
            this.modules[index].cours = [];
          }

          // 1. Préparer le DTO (données textuelles)
          const newCours: CoursRequestDTO = {
            titre: result.titre,
            contenu: result.contenu,
            typeContenu: result.typeContenu,
            videoUrl: result.videoUrl,
            documentUrl: result.documentUrl,
            ordre: (this.modules[index].cours?.length || 0) + 1,
          };

          // 2. Récupérer le fichier depuis la modale
          const fichierASauvegarder = result.fichier;

          // 3. Appeler le service avec les deux arguments
          this.courService
            .createCours(moduleId, newCours, fichierASauvegarder)
            .subscribe({
              next: (res) => {
                this.modules[index].cours?.push(res);
                alert("Cours ajouté avec succès !");
              },
              error: (err) => {
                console.error("Erreur lors de la création du cours", err);
                alert("Erreur lors de l'ajout du cours au backend.");
              },
            });
        }
      })
      .catch(() => {
        /* Fermeture sans save */
      });
  }

  addQuestionToQuiz(quizId: number, index: number) {
    const modalRef = this.modalService.open(QuestionModalComponent, {
      size: "lg",
    });

    modalRef.result.then((result) => {
      if (result) {
        // result contient déjà { texte, type, points, reponseOptions: [...] }
        this.questionService.createQuestion(quizId, result).subscribe({
          next: () => {
            this.loadModuleContent(index); // Rafraîchit l'UI
            alert("Question et options ajoutées !");
          },
          error: (err) => alert("Erreur lors de l'ajout des questions."),
        });
      }
    });
  }

  manageQuiz(moduleId: number, index: number) {
    const modalRef = this.modalService.open(FormModalComponent);
    modalRef.componentInstance.title = "Configurer le Quiz du Module";
    modalRef.componentInstance.type = "QUIZ";

    modalRef.result
      .then((result) => {
        if (result) {
          // Préparation du DTO correspondant à ta capture Bruno
          const newQuiz: QuizRequestDTO = {
            titre: result.titre,
            description: result.description || "Quiz de fin de module",
            duree: result.duree,
            scoreMinimum: result.scoreMinimun,
            nombreTentatives: result.nombreTentatives,
          };

          // Appel au service avec l'ID du module
          this.quizService.createQuiz(moduleId, newQuiz).subscribe({
            next: (res) => {
              this.modules[index].quiz = res; // Mise à jour immédiate de l'UI
              alert("Le quiz a été créé avec succès !");
            },
            error: (err) => {
              console.error("Erreur creation quiz", err);
              alert(
                "Impossible de créer le quiz. Vérifiez si un quiz n'existe pas déjà."
              );
            },
          });
        }
      })
      .catch(() => {});
  }

  deleteModule(id: number) {
    if (
      confirm(
        "Attention: Supprimer ce module supprimera tous les cours et quiz associés. Continuer ?"
      )
    ) {
      this.moduleService.deleteModule(id).subscribe({
        next: () => {
          this.modules = this.modules.filter((m) => m.id !== id);
        },
        error: (err) => alert("Erreur lors de la suppression"),
      });
    }
  }

  getImageFullUrl(path: string) {
    return `${environment.apiUrl}/${path}`;
  }
}
