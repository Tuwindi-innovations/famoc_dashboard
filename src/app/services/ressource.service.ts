import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Ressource } from "../models/Ressource";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RessourceService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ressource`;

  /**
   * Créer une ressource avec une image (Multipart/form-data)
   */
  createRessource(
    ressource: Ressource,
    imageFile: File
  ): Observable<Ressource> {
    const formData = new FormData();

    formData.append("ressource", JSON.stringify(ressource));
    formData.append("image", imageFile);

    return this.http.post<Ressource>(this.apiUrl, formData);
  }

  /**
   * Récupérer toutes les ressources
   */
  getAllRessources(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(this.apiUrl);
  }

  /**
   * Récupérer une ressource par son ID
   */
  getRessourceById(id: string): Observable<Ressource> {
    return this.http.get<Ressource>(`${this.apiUrl}/${id}`);
  }

  /**
   * Supprimer une ressource
   */
  deleteRessource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
