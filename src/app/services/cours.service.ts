import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import {
  CoursRequestDTO,
  CoursResponseDTO,
  TypeContenu,
} from "../models/Cours";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CoursService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cours`;

  /**
   * Crée un cours pour un module spécifique
   * POST /cours/{moduleId}
   */
  createCours(
    moduleId: number,
    cours: CoursRequestDTO,
    fichier?: File
  ): Observable<CoursResponseDTO> {
    const formData = new FormData();

    formData.append(
      "cours",
      new Blob([JSON.stringify(cours)], {
        type: "application/json",
      })
    );

    // On ajoute le fichier s'il existe
    if (fichier) {
      formData.append("fichier", fichier);
    }

    return this.http.post<CoursResponseDTO>(
      `${this.apiUrl}/${moduleId}`,
      formData
    );
  }

  /**
   * Récupère un cours par son ID
   * GET /cours/{id}
   */
  getCoursById(id: number): Observable<CoursResponseDTO> {
    return this.http.get<CoursResponseDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère tous les cours d'un module
   * GET /cours?moduleId=...
   */
  getCoursByModule(moduleId: number): Observable<CoursResponseDTO[]> {
    const params = new HttpParams().set("moduleId", moduleId.toString());
    return this.http.get<CoursResponseDTO[]>(this.apiUrl, { params });
  }

  /**
   * Récupère les cours par type de contenu
   * GET /cours/type/{typeContenu}
   */
  getCoursByType(type: TypeContenu): Observable<CoursResponseDTO[]> {
    return this.http.get<CoursResponseDTO[]>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Met à jour un cours
   * PUT /cours/{id}
   */
  updateCours(
    id: number,
    cours: CoursRequestDTO
  ): Observable<CoursResponseDTO> {
    return this.http.put<CoursResponseDTO>(`${this.apiUrl}/${id}`, cours);
  }

  /**
   * Supprime un cours
   * DELETE /cours/{id}
   */
  deleteCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Réorganise les cours d'un module
   * PUT /cours/reorder?moduleId=...
   */
  reorderCours(moduleId: number, coursIds: number[]): Observable<void> {
    const params = new HttpParams().set("moduleId", moduleId.toString());
    return this.http.put<void>(`${this.apiUrl}/reorder`, coursIds, { params });
  }

  /**
   * Upload / Mise à jour de l'URL vidéo
   * PUT /cours/{id}/video
   */
  uploadVideo(id: number, videoUrl: string): Observable<CoursResponseDTO> {
    return this.http.put<CoursResponseDTO>(`${this.apiUrl}/${id}/video`, {
      videoUrl,
    });
  }

  /**
   * Upload / Mise à jour du document
   * PUT /cours/{id}/document
   */
  uploadDocument(
    id: number,
    documentUrl: string,
    typeContenu: TypeContenu
  ): Observable<CoursResponseDTO> {
    return this.http.put<CoursResponseDTO>(`${this.apiUrl}/${id}/document`, {
      documentUrl,
      typeContenu,
    });
  }
}
