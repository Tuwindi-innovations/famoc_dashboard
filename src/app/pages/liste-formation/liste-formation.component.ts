import { Component, inject, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { FormationResponse } from "src/app/models/Formation";
import { FormationService } from "src/app/services/formation.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-liste-formation",
  templateUrl: "./liste-formation.component.html",
  styleUrls: ["./liste-formation.component.scss"],
})
export class ListeFormationComponent implements OnInit {
  private toastr = inject(ToastrService);
  private formationService = inject(FormationService);

  isLoading: boolean = true;
  errorMessage: string = "";
  formations: FormationResponse[] = [];

  ngOnInit(): void {
    this.loadFormations();
  }

  /**
   * Charge la liste des formations depuis le backend
   */
  loadFormations(): void {
    this.isLoading = true;
    this.formationService.afficherFormations().subscribe({
      next: (data) => {
        this.formations = data;
        this.isLoading = false;
        console.log("Formations récupérées :", data);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Erreur lors de la récupération des données.";
        this.toastr.error(this.errorMessage);
        console.error(err);
      },
    });
  }

  getImageFullUrl(path: string | undefined): string {
    return path
      ? `${environment.apiUrl}/${path}`
      : "assets/images/default-formation.jpg";
  }

  /**
   * Rafraîchir la liste manuellement
   */
  reload(): void {
    this.loadFormations();
  }

  /**
   * Supprime une formation après confirmation
   */
  deleteFormation(id: number): void {
    if (confirm("Voulez-vous vraiment supprimer cette formation ?")) {
      this.formationService.deleteFormation(id).subscribe({
        next: (success) => {
          if (success) {
            this.toastr.success("Formation supprimée avec succès.");
            // Mise à jour de la liste locale sans recharger la page
            this.formations = this.formations.filter((f) => f.id !== id);
          } else {
            this.toastr.warning(
              "La suppression a été traitée mais a échoué côté serveur."
            );
          }
        },
        error: (err) => {
          this.toastr.error("Impossible de supprimer la formation.");
          console.error(err);
        },
      });
    }
  }

  /**
   * Redirige ou ouvre la modale de modification
   */
  editFormation(formation: FormationResponse): void {
    this.toastr.info(`Modification de : ${formation.titre}`);
  }
}
