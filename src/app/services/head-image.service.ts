import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class HeadImageService {
  private serviceUrl: string;
  private baseUrl: string = "headImage";
  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  /**
   * Créer une nouvelle image d'en-tête
   */
  createHeadImage(
    pageName: string,
    description: string,
    imageFile?: File,
    ownerId?: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append("pageName", pageName);
    formData.append("description", description);
    if (ownerId) formData.append("ownerId", ownerId);
    if (imageFile) formData.append("image", imageFile);

    return this.http.post(
      `${this.serviceUrl}/${this.baseUrl}/create`,
      formData
    );
  }

  /**
   * Récupérer l'image d'en-tête d'une page donnée
   */
  getHeadImageByPage(pageName: string): Observable<any> {
    return this.http.get(`${this.serviceUrl}/${this.baseUrl}/page/${pageName}`);
  }

  /**
   * Mettre à jour l'image d'en-tête existante
   */
  updateHeadImage(
    idHeadImage: string,
    description?: string,
    imageFile?: File
  ): Observable<any> {
    const formData = new FormData();
    if (description) formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    return this.http.put(
      `${this.serviceUrl}/${this.baseUrl}/update/${idHeadImage}`,
      formData
    );
  }

  /**
   * Supprimer une image d'en-tête
   */
  deleteHeadImage(idHeadImage: string): Observable<any> {
    return this.http.delete(
      `${this.serviceUrl}/${this.baseUrl}/delete/${idHeadImage}`
    );
  }
}
