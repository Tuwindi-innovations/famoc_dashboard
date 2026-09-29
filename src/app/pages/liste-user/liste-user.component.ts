import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from "@angular/core";
import { ConfirmService } from "src/app/services/confirm.service";
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { UserResponseDTO } from "src/app/models/User";
import { UserService } from "src/app/services/user.service";

@Component({
    imports: [FormsModule, NgClass, NgbDropdownModule],
    selector: "app-liste-user",
    templateUrl: "./liste-user.component.html",
    styleUrls: ["./liste-user.component.scss"]})
export class ListeUserComponent implements OnInit {
  newUser = {
    id: "",
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    telephone: "",
    role: "ADMIN",
  };
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private confirmation = inject(ConfirmService);
  users: UserResponseDTO[] = [];
  isLoading = true;
  isEditMode = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data: UserResponseDTO[]) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Erreur lors du chargement des utilisateurs");
        this.isLoading = false;
      },
    });
  }

  async delete(id: string): Promise<void> {
    const confirme = await this.confirmation.demander({
      titre: 'Supprimer définitivement ?',
      message: 'Vous êtes sur le point de supprimer cet utilisateur.',
      detail: 'Le compte et ses accès seront définitivement retirés.',
      libelleConfirmer: 'Supprimer',
    });
    if (!confirme) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.toastr.success("Utilisateur supprimé");
        this.loadUsers();
      },
      error: () => this.toastr.error("Erreur lors de la suppression"),
    });
  }

  // Basculer l'état (Activer / Désactiver)
  toggleStatus(u: UserResponseDTO): void {
    // On suppose que ton DTO a un champ 'enabled' ou 'active'
    const action = u.active
      ? this.userService.deactivate(u.id)
      : this.userService.activate(u.id);

    action.subscribe({
      next: () => {
        this.toastr.success(`Utilisateur ${u.active ? "désactivé" : "activé"}`);
        this.loadUsers();
      },
    });
  }

  editUser(u: UserResponseDTO, content: any) {
    this.isEditMode = true;
    this.newUser = { ...u } as any;
    this.modalService.open(content, { centered: true });
  }

  openAddModal(content: any) {
    this.isEditMode = false;
    this.resetNewUser();
    this.modalService.open(content, { centered: true });
  }

  resetNewUser() {
    this.newUser = {
      id: "",
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      telephone: "",
      role: "ROLE",
    };
  }

  onSubmitUser(modal: any) {
    if (this.isEditMode) {
      // Appel à ton service de mise à jour (ex: update(id, data))
      this.userService
        .update(this.newUser["id"], this.newUser as any)
        .subscribe({
          next: () => {
            this.toastr.success("Utilisateur mis à jour !");
            this.loadUsers();
            modal.close();
          },
          error: (err) => this.toastr.error("Erreur lors de la modification"),
        });
    } else {
      this.onCreateUser(modal);
    }
  }

  onCreateUser(modal: any) {
    this.userService.create(this.newUser as any).subscribe({
      next: () => {
        this.toastr.success("Utilisateur créé avec succès");
        this.loadUsers(); // Recharge la liste
        modal.close(); // Ferme le modal
      },
      error: (err) => {
        this.toastr.error(err.error?.message || "Erreur lors de la création");
      },
    });
  }
}
