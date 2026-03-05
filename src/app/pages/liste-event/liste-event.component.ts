import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { EventResponse } from "src/app/models/Event";
import { EventService } from "src/app/services/event.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-liste-event",
  templateUrl: "./liste-event.component.html",
  styleUrls: ["./liste-event.component.scss"],
})
export class ListeEventComponent implements OnInit {
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  events: EventResponse[] = [];
  isLoading: boolean = true;
  errorMessage: string = "";

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data: EventResponse[]) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des blogs", err);
        this.errorMessage = "Impossible de charger les articles.";
        this.isLoading = false;
      },
    });
  }

  getBlogImage(event: EventResponse): string {
    // 1. Vérifier si le blog possède des médias
    if (event.media && event.media.length > 0) {
      const firstMedia = event.media[0];

      // 2. Vérifier si webPath existe (généré par ton @Transient Java)
      if (firstMedia.webPath) {
        // On retourne l'URL complète vers ton backend
        // Rappel : Ton MvcConfig Spring mappe "/images/**" vers ton dossier Desktop
        return `${environment.apiUrl}${firstMedia.webPath}`;
      }
    }
    // 3. Image de secours (Placeholder) si pas de média ou erreur
    return "assets/img/theme/img-1-1000x600.jpg";
  }

  deleteEvent(id: string): void {
    // Utilisation d'une boîte de dialogue de confirmation
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
      )
    ) {
      this.isLoading = true; // Activer le loader pendant l'opération

      this.eventService.deleteEvent(id).subscribe({
        next: (response) => {
          // Notification de succès
          this.toastr.success("L'événement a été supprimé avec succès.");

          // Rafraîchir la liste localement pour éviter un rechargement complet
          this.events = this.events.filter((e) => e.id !== id);

          this.isLoading = false;
        },
        error: (err) => {
          console.error("Erreur lors de la suppression :", err);
          this.toastr.error(
            "Impossible de supprimer l'événement. Veuillez réessayer."
          );
          this.isLoading = false;
        },
      });
    }
  }

  // Activer ou Désactiver un blog
  onToggleStatus(event: EventResponse): void {
    const action = event.active
      ? this.eventService.deactivateEvent(event.id)
      : this.eventService.activateEvent(event.id);

    action.subscribe({
      next: () => {
        this.toastr.info(`Article ${event.active ? "désactivé" : "activé"}`);
        this.loadEvent();
      },
      error: (err) => {
        this.toastr.error("Erreur lors du changement de statut");
      },
    });
  }
}
