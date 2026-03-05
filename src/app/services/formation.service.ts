import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { FormationRequest, FormationResponse } from "../models/Formation";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/formation`;

  constructor(private http: HttpClient) {}

  ajouterFormation(
    formation: FormationRequest,
    images: File[]
  ): Observable<FormationResponse> {
    const formData = new FormData();

    // formData.append(
    //   "formation",
    //   new Blob([JSON.stringify(formation)], {
    //     type: "application/json",
    //   })
    // );
    formData.append("formation", JSON.stringify(formation));

    images.forEach((file) => {
      formData.append("images", file);
    });

    return this.http.post<FormationResponse>(this.apiUrl, formData);
  }

  afficherFormations(): Observable<FormationResponse[]> {
    return this.http.get<FormationResponse[]>(this.apiUrl);
  }

  getFormationById(id: number): Observable<FormationResponse> {
    return this.http.get<FormationResponse>(`${this.apiUrl}/${id}`);
  }

  modifier(
    id: number,
    formation: FormationRequest
  ): Observable<FormationResponse> {
    return this.http.put<FormationResponse>(`${this.apiUrl}/${id}`, formation);
  }

  deleteFormation(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
