import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { CategorieService } from "src/app/services/categorie.service";
import { EventService } from "src/app/services/event.service";

@Component({
    imports: [FormsModule, RouterLink],
    selector: "app-add-up-event",
    templateUrl: "./add-up-event.component.html",
    styleUrls: ["./add-up-event.component.scss"]})
export class AddUpEventComponent implements OnInit {
  eventRequest: any = {
    titre: "",
    description: "",
    dateDebutEvent: "",
    dateFinEvent: "",
    organisateur: "",
    categorieId: "",
    lieu: "",
  };

  selectedFiles: File[] = [];
  categories: any[] = [];
  previews: string[] = [];
  isSubmitting = false;
  isEditMode = false;
  eventId: string | null = null;

  private eventService = inject(EventService);
  private categorieService = inject(CategorieService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadCategories();

    this.eventId = this.route.snapshot.paramMap.get("id");
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEvent(this.eventId);
    }
  }

  /** Recharge l'évènement à modifier dans le formulaire. */
  loadEvent(id: string): void {
    this.eventService.getEventById(id).subscribe({
      next: (evenement) => {
        this.eventRequest = {
          titre: evenement.titre,
          description: evenement.description,
          dateDebutEvent: evenement.dateDebutEvent?.slice(0, 10) ?? "",
          dateFinEvent: evenement.dateFinEvent?.slice(0, 10) ?? "",
          organisateur: evenement.organisateur,
          categorieId: evenement.categorieId,
          lieu: evenement.lieu,
        };
      },
      error: () => {
        this.toastr.error("Cet évènement est introuvable.");
        this.router.navigate(["/liste-event"]);
      },
    });
  }

  loadCategories() {
    this.categorieService
      .getAll()
      .subscribe((data) => (this.categories = data));
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.previews = [];

      // Générer les aperçus
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.previews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit() {
    this.isSubmitting = true;

    // `EventService` construit lui-même son FormData : on lui passe l'objet et
    // les fichiers, rien de plus.
    const operation =
      this.isEditMode && this.eventId
        ? this.eventService.updateEvent(this.eventId, this.eventRequest)
        : this.eventService.ajouterUnEvent(this.eventRequest, this.selectedFiles);

    operation.subscribe({
      next: () => {
        this.toastr.success(
          this.isEditMode ? "Évènement mis à jour" : "Évènement créé"
        );
        this.router.navigate(["/liste-event"]);
      },
      error: () => {
        this.toastr.error(
          this.isEditMode
            ? "Erreur lors de la modification"
            : "Erreur lors de la création"
        );
        this.isSubmitting = false;
      },
    });
  }
}
