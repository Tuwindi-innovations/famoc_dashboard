import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from "@angular/core";
import { ConfirmService } from 'src/app/services/confirm.service';
import { ToastrService } from "ngx-toastr";
import { AlerteResponse, libelleCategorie } from "src/app/models/Alerte";
import { AlertService } from "src/app/services/alert.service";
import { environment } from "src/environments/environment";

/** Libellés lisibles des statuts renvoyés par l'API. */
const LIBELLE_STATUT: Record<string, string> = {
  ENVOYER: 'En attente',
  ENCOURSDETRAITEMENT: 'En cours',
  RESOLUE: 'Résolue',
};

@Component({
    imports: [DatePipe],
    selector: "app-alerte",
    templateUrl: "./alerte.component.html",
    styleUrls: ["./alerte.component.scss"]})
export class AlerteComponent implements OnInit {
  private alerteService = inject(AlertService);
  private confirmation = inject(ConfirmService);
  private toastr = inject(ToastrService);

  alertes: AlerteResponse[] = [];

  isLoading = true;
  /** Vrai quand l'API n'a pas répondu : à ne pas confondre avec « 0 alerte ». */
  chargementEchoue = false;

  ngOnInit(): void {
    this.loadAlertes();
  }

  loadAlertes() {
    this.isLoading = true;
    this.chargementEchoue = false;
    this.alerteService.getAllAlertes().subscribe({
      next: (res) => {
        this.alertes = res;
        this.isLoading = false;
      },
      error: () => {
        this.chargementEchoue = true;
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

  async onDelete(id: number): Promise<void> {
    const confirme = await this.confirmation.demander({
      titre: 'Supprimer définitivement ?',
      message: 'Vous êtes sur le point de supprimer cette alerte.',
      libelleConfirmer: 'Supprimer',
    });
    if (!confirme) {
      return;
    }
      this.alerteService.deleteAlerte(id).subscribe(() => {
        this.alertes = this.alertes.filter((a) => a.id !== id);
        this.toastr.success("Alerte supprimée");
      });
  }

  get alertesEnAttente() {
    return this.alertes.filter((a) => a.statut !== "RESOLUE");
  }

  /** Libellé lisible d'une catégorie, ou « Sans catégorie ». */
  libelleCategorie = libelleCategorie;

  /** Libellé lisible d'un statut, ou « En attente » si l'API n'en donne pas. */
  libelleStatut(statut: string | null | undefined): string {
    return LIBELLE_STATUT[statut ?? ''] ?? 'En attente';
  }

  /**
   * URL de la photo jointe, ou chaîne vide si l'alerte n'en a pas.
   *
   * On ne renvoie plus d'image de remplacement : le fichier référencé
   * n'existe pas dans le projet, et le gestionnaire global masque de toute
   * façon les vignettes en échec.
   */
  getAlerteImage(imageUrl: string | null | undefined): string {
    if (!imageUrl || imageUrl.trim() === "") {
      return "";
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
