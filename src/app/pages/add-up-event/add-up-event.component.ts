import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CategorieService } from "src/app/services/categorie.service";
import { EventService } from "src/app/services/event.service";

@Component({
  selector: "app-add-up-event",
  templateUrl: "./add-up-event.component.html",
  styleUrls: ["./add-up-event.component.scss"],
})
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

  constructor(
    private eventService: EventService,
    private categorieService: CategorieService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
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
    const formData = new FormData();

    // Ajout du JSON de l'événement
    formData.append(
      "event",
      new Blob([JSON.stringify(this.eventRequest)], {
        type: "application/json",
      })
    );

    // Ajout des images
    this.selectedFiles.forEach((file) => formData.append("images", file));

    this.eventService
      .ajouterUnEvent(this.eventRequest, this.selectedFiles)
      .subscribe({
        next: () => {
          this.toastr.success("Événement créé avec succès");
          this.router.navigate(["/liste-event"]);
        },
        error: (err) => {
          this.toastr.error("Erreur lors de la création");
          this.isSubmitting = false;
        },
      });
  }
}
