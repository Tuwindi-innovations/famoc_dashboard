import { Component, inject, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AlerteResponse } from "src/app/models/Alerte";
import { AlertService } from "src/app/services/alert.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-alerte",
  templateUrl: "./alerte.component.html",
  styleUrls: ["./alerte.component.scss"],
})
export class AlerteComponent implements OnInit {
  private alerteService = inject(AlertService);
  private toastr = inject(ToastrService);

  alertes: AlerteResponse[] = [];

  isLoading = true;

  ngOnInit(): void {
    this.loadAlertes();
  }

  loadAlertes() {
    this.isLoading = true;
    this.alerteService.getAllAlertes().subscribe({
      next: (res) => {
        this.alertes = res;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Erreur de chargement");
        this.isLoading = false;
      },
    });
  }

  onResoudre(alerte: AlerteResponse) {
    const userId = alerte.apprenantId;

    if (!userId) {
      this.toastr.warning("Impossible de résoudre : ID utilisateur manquant");
      return;
    }

    this.alerteService.resoudreUserAlerte(alerte.id, userId).subscribe({
      next: (res) => {
        // Mise à jour locale du statut sans recharger toute la liste
        const index = this.alertes.findIndex((a) => a.id === alerte.id);
        if (index !== -1) {
          this.alertes[index] = res;
        }
        this.toastr.success("Alerte résolue et notification envoyée !");
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Erreur lors de la résolution de l'alerte");
      },
    });
  }

  onDelete(id: number) {
    if (confirm("Supprimer cette alerte ?")) {
      this.alerteService.deleteAlerte(id).subscribe(() => {
        this.alertes = this.alertes.filter((a) => a.id !== id);
        this.toastr.success("Alerte supprimée");
      });
    }
  }

  get alertesEnAttente() {
    return this.alertes.filter((a) => a.statut !== "RESOLUE");
  }

  getAlerteImage(imageUrl: string | null | undefined): string {
    if (!imageUrl || imageUrl.trim() === "") {
      return "assets/img/theme/img-1-1000x600.jpg";
    }

    //éviter les doubles slashes ou les slashes manquants
    const baseUrl = environment.apiUrl.endsWith("/")
      ? environment.apiUrl
      : `${environment.apiUrl}/`;

    const cleanImagePath = imageUrl.startsWith("/")
      ? imageUrl.substring(1)
      : imageUrl;

    return `${baseUrl}${cleanImagePath}`;
  }
}
