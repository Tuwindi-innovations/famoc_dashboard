import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { UserResponseDTO } from "../models/User";

@Injectable({
  providedIn: "root",
})
export class AprenantsService {
  private serviceUrl: string;
  private baseUrl: string = "apprenant";

  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  getApprenant(id: string): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(
      `${this.serviceUrl}/${this.baseUrl}/${id}`
    );
  }

  getAllApprenants(): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(
      `${this.serviceUrl}/${this.baseUrl}`
    );
  }

  deleteApprenant(id: string): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.serviceUrl}/${this.baseUrl}/${id}`
    );
  }
}
