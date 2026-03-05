import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { FormationRequest, Niveau } from "src/app/models/Formation";
import { FormationService } from "src/app/services/formation.service";

@Component({
  selector: "app-add-up-formation",
  templateUrl: "./add-up-formation.component.html",
  styleUrls: ["./add-up-formation.component.scss"],
})
export class AddUpFormationComponent implements OnInit {
  private toastr = inject(ToastrService);
  private formationService = inject(FormationService);
  private router = inject(Router);

  ngOnInit(): void {}

  formation: FormationRequest = {
    titre: "",
    description: "",
    dureeEstimee: "",
    niveau: Niveau.DEBUTANT,
    categorie: "",
  };

  selectedFiles: File[] = [];

  onFileSelect(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit() {
    this.formationService
      .ajouterFormation(this.formation, this.selectedFiles)
      .subscribe({
        next: (res) => {
          this.toastr.success("Formation créée !");
          this.router.navigate(["liste-formation"]);
        },
        error: (err) => this.toastr.error("Erreur lors de l'envoi"),
      });
  }
}
