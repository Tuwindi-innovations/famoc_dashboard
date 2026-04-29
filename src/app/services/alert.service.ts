import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AlerteResponse } from "../models/Alerte";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AlertService {
  private serviceUrl: string;
  private baseUrl: string = "alerte";

  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  resoudreUserAlerte(
    alerteId: number,
    userId: string
  ): Observable<AlerteResponse> {
    return this.http.post<AlerteResponse>(
      `${this.serviceUrl}/${this.baseUrl}/resoudre/${alerteId}/${userId}`,
      {}
    );
  }

  // Récupérer les alertes d'un utilisateur spécifique
  getUserAlertes(userId: string): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(
      `${this.serviceUrl}/${this.baseUrl}/user/${userId}`
    );
  }

  // Récupérer une alerte précise d'un utilisateur
  getAnAlertOfUser(
    userId: string,
    alertId: number
  ): Observable<AlerteResponse> {
    return this.http.get<AlerteResponse>(
      `${this.serviceUrl}/${this.baseUrl}/user/${userId}/alerte/${alertId}`
    );
  }

  // Récupérer une alerte par son ID
  getAlerteById(id: number): Observable<AlerteResponse> {
    return this.http.get<AlerteResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${id}`
    );
  }

  // Récupérer toutes les alertes (Admin)
  getAllAlertes(): Observable<AlerteResponse[]> {
    return this.http.get<AlerteResponse[]>(
      `${this.serviceUrl}/${this.baseUrl}`
    );
  }

  // Supprimer une alerte
  deleteAlerte(id: number): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.serviceUrl}/${this.baseUrl}/${id}`
    );
  }
}
