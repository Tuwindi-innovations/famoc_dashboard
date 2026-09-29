import { Component, inject, OnInit } from "@angular/core";
import { ConfirmService } from 'src/app/services/confirm.service';
import { ToastrService } from "ngx-toastr";
import { UserResponseDTO } from "src/app/models/User";
import { AprenantsService } from "src/app/services/aprenants.service";

@Component({
    selector: "app-aprenants",
    templateUrl: "./aprenants.component.html",
    styleUrls: ["./aprenants.component.scss"]})
export class AprenantsComponent implements OnInit {
  private service = inject(AprenantsService);
  private confirmation = inject(ConfirmService);
  private toastr = inject(ToastrService);

  apprenants: UserResponseDTO[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.service.getAllApprenants().subscribe({
      next: (data) => {
        this.apprenants = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error("Erreur de récupération");
        this.isLoading = false;
      },
    });
  }

  async onDelete(id: string): Promise<void> {
    const confirme = await this.confirmation.demander({
      titre: 'Supprimer définitivement ?',
      message: 'Vous êtes sur le point de supprimer cet apprenant.',
      detail: 'Sa progression dans les formations sera perdue.',
      libelleConfirmer: 'Supprimer',
    });
    if (!confirme) {
      return;
    }
      this.service.deleteApprenant(id).subscribe(() => {
        this.apprenants = this.apprenants.filter((u) => u.id !== id);
        this.toastr.success("Supprimé !");
      });
  }

  onEdit(user: UserResponseDTO) {
    // Logique pour ouvrir une modale de modification
    console.log("Modifier :", user);
  }
}
