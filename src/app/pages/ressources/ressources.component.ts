import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from "@angular/core";
import { ConfirmService } from 'src/app/services/confirm.service';
import { ToastrService } from "ngx-toastr";
import { Ressource } from "src/app/models/Ressource";
import { RessourceService } from "src/app/services/ressource.service";
import { environment } from "src/environments/environment";

@Component({
    imports: [FormsModule],
    selector: "app-ressources",
    templateUrl: "./ressources.component.html",
    styleUrls: ["./ressources.component.scss"]})
export class RessourcesComponent implements OnInit {
  private ressourceService = inject(RessourceService);
  private confirmation = inject(ConfirmService);
  private toastr = inject(ToastrService);

  ressources: Ressource[] = [];
  selectedFile: File | null = null;

  // Modèle pour le formulaire
  ressourceForm: Ressource = {
    titre: "",
    description: "",
    auteur: "",
  };

  ngOnInit(): void {
    this.loadRessources();
  }

  loadRessources(): void {
    this.ressourceService.getAllRessources().subscribe({
      next: (data) => (this.ressources = data),
      error: () =>
        this.toastr.error("Erreur lors du chargement des ressources"),
    });
  }

  getImageFullUrl(path: string | undefined): string {
    return path
      ? `${environment.apiUrl}/${path}`
      : "assets/images/ressource.jpg";
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.toastr.warning("Veuillez sélectionner une image");
      return;
    }

    this.ressourceService
      .createRessource(this.ressourceForm, this.selectedFile)
      .subscribe({
        next: () => {
          this.toastr.success("Ressource créée avec succès");
          this.resetForm();
          this.loadRessources();
        },
        error: (err) => this.toastr.error("Erreur de création"),
      });
  }

  async onDelete(id: string | undefined): Promise<void> {
    if (!id) return;
    const confirme = await this.confirmation.demander({
      titre: 'Supprimer définitivement ?',
      message: 'Vous êtes sur le point de supprimer cette ressource.',
      libelleConfirmer: 'Supprimer',
    });
    if (!confirme) {
      return;
    }
      this.ressourceService.deleteRessource(id).subscribe({
        next: () => {
          this.toastr.success("Supprimé !");
          this.loadRessources();
        },
      });
  }

  resetForm(): void {
    this.ressourceForm = { titre: "", description: "", auteur: "" };
    this.selectedFile = null;
  }
}
