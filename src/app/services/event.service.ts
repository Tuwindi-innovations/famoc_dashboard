import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { CResponse } from "../models/CResponse";
import { Observable } from "rxjs";
import { EventRequest, EventResponse } from "../models/Event";

@Injectable({
  providedIn: "root",
})
export class EventService {
  private serviceUrl: string;
  private baseUrl: string = "event";
  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  ajouterUnEvent(
    eventData: EventRequest,
    images: File[]
  ): Observable<EventResponse> {
    const formData = new FormData();
    // 1. On transforme l'objet blog en string JSON
    formData.append("event", JSON.stringify(eventData));

    // 2. On ajoute chaque image au tableau "images"
    images.forEach((file) => {
      formData.append("images", file, file.name);
    });

    // 3. On envoie le tout (Angular gère le Content-Type automatiquement pour FormData)
    return this.http.post<EventResponse>(
      `${this.serviceUrl}/${this.baseUrl}`,
      formData
    );
  }

  /**
   * Met à jour un événement existant en utilisant multipart/form-data.
   * Le backend gère la suppression/mise à jour de l'ancienne image si une nouvelle est fournie.
   */
  // updateEvent(
  //   idEvent: string,
  //   titre: string,
  //   description: string,
  //   lieu: string,
  //   dateDebut: string,
  //   dateFin: string,
  //   categorieId: string,
  //   imageFile: File | null
  // ): Observable<CResponse> {
  //   const formData = new FormData();
  //   formData.append("titre", titre);
  //   formData.append("description", description);
  //   formData.append("lieu", lieu);
  //   formData.append("dateDebut", dateDebut);
  //   formData.append("dateFin", dateFin);
  //   formData.append("categorie_id", categorieId);

  //   if (imageFile) {
  //     formData.append("image", imageFile, imageFile.name);
  //   }

  //   return this.http.put<CResponse>(
  //     `${this.serviceUrl}/${this.baseUrl}/${idEvent}`,
  //     formData
  //   );
  // }

  updateEvent(
    idEvent: string,
    eventData: any // On passe l'objet correspondant au EventRequest du Back
  ): Observable<EventResponse> {
    // Pas de FormData ici car le Back attend du JSON (@RequestBody)
    return this.http.put<EventResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${idEvent}`,
      eventData
    );
  }

  /**
   * Récupère tous les événements.
   */
  getAllEvents(): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(`${this.serviceUrl}/${this.baseUrl}`);
  }

  /**
   * Récupère un événement par son ID.
   */
  getEventById(idEvent: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${this.baseUrl}/${idEvent}`
    );
  }

  /**
   * Récupère les événements par ID de catégorie.
   */
  getEventsByCategory(idCategorie: string): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(
      `${this.serviceUrl}/${this.baseUrl}/${this.baseUrl}/getEventByCategory/${idCategorie}`
    );
  }

  /**
   * Supprime un événement.
   */
  deleteEvent(idEvent: string): Observable<Boolean> {
    return this.http.delete<Boolean>(
      `${this.serviceUrl}/${this.baseUrl}/${idEvent}`
    );
  }

  /**
   * Désactive un événement.
   */
  deactivateEvent(idEvent: string): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/desactive/${idEvent}`,
      {}
    );
  }

  /**
   * Active un événement.
   */
  activateEvent(idEvent: string): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/active/${idEvent}`,
      {}
    );
  }
}
