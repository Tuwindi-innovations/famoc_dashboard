import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { Categorie } from "src/app/models/Categorie";
import { CategorieService } from "src/app/services/categorie.service";

@Component({
  selector: "app-liste-categorie",
  templateUrl: "./liste-categorie.component.html",
  styleUrls: ["./liste-categorie.component.scss"],
})
export class ListeCategorieComponent implements OnInit {
  categories: Categorie[] = [];
  isLoading = true;

  isEditMode = false;
  selectedCategorie: any = {};

  newCategorie = {
    id: "",
    nom: "",
    typeCategorie: "BLOG", // Valeur par défaut
    description: "",
    active: true,
  };

  constructor(
    private categorieService: CategorieService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
        this.toastr.success("Catégories chargées avec succès");
      },
      error: (err) => {
        console.error("Erreur détaillée :", err);
        this.isLoading = false;

        // Better error handling
        if (err.status === 0) {
          this.toastr.error("Impossible de se connecter au serveur");
        } else if (err.status === 401) {
          this.toastr.error("Authentification requise");
        } else if (err.status === 403) {
          this.toastr.error("Accès non autorisé");
        } else {
          this.toastr.error("Erreur lors du chargement des catégories");
        }
      },
    });
  }

  reload(): void {
    this.loadCategories();
  }

  editCategorie(cat: Categorie, content: any): void {
    this.isEditMode = true;
    this.newCategorie = { ...cat };
    this.modalService.open(content, {
      backdrop: false,
      keyboard: true,
      centered: true,
    });
  }

  deleteCategorie(id: string): void {
    if (confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
      this.categorieService.delete(id).subscribe({
        next: () => {
          this.toastr.success("Catégorie supprimée avec succès");
          this.loadCategories();
        },
        error: (err) => {
          console.error("Erreur suppression:", err);
          this.toastr.error("Erreur lors de la suppression");
        },
      });
    }
  }

  openAddModal(content: any) {
    this.isEditMode = false;
    this.resetForm();
    this.modalService.open(content, {
      backdrop: false,
      keyboard: true,
      centered: true,
    });
  }

  ajouterCategorie(modal: any) {
    this.categorieService.create(this.newCategorie).subscribe({
      next: (res) => {
        this.toastr.success("Catégorie ajoutée avec succès");
        this.reload(); // Rafraîchir la liste
        modal.close();
        this.resetForm();
      },
      error: (err) => {
        console.error("Erreur", err);
        this.toastr.error("Erreur lors de l'ajout");
      },
    });
  }

  resetForm() {
    this.newCategorie = {
      id: "",
      nom: "",
      typeCategorie: "BLOG",
      description: "",
      active: true,
    };
  }

  saveCategorie(modal: any) {
    if (this.isEditMode) {
      // On récupère l'ID depuis l'objet qu'on a modifié
      const id = this.newCategorie.id;

      if (!id) {
        this.toastr.error("Erreur : ID de catégorie manquant");
        return;
      }

      this.categorieService.update(id, this.newCategorie).subscribe({
        next: (res) => {
          this.toastr.success("Modifié avec succès");
          this.reload();
          modal.close();
        },
        error: (err) => {
          console.error("Erreur update:", err);
          this.toastr.error("Erreur lors de la modification");
        },
      });
    } else {
      this.ajouterCategorie(modal);
    }
  }
}
