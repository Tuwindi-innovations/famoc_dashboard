import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment.prod";
import { CResponse } from "../models/CResponse";
import { User, UserResponseDTO } from "../models/User";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private serviceUrl: string;
  private baseUrl: string = "user";
  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  /** ➕ Créer un utilisateur */
  create(user: User): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/signUp`,
      user
    );
  }

  /** ✏️ Mettre à jour un utilisateur */
  update(idUser: string, user: User): Observable<CResponse> {
    return this.http.put<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${idUser}`,
      user
    );
  }

  /** 🔍 Récupérer tous les utilisateurs */
  getAllUsers(): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(
      `${this.serviceUrl}/${this.baseUrl}`
    );
  }

  /** 🔍 Récupérer un utilisateur par ID */
  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.serviceUrl}/${this.baseUrl}/${id}`);
  }

  /** 🗑️ Supprimer un utilisateur */
  deleteUser(idUser: string): Observable<CResponse> {
    return this.http.delete<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${idUser}`
    );
  }

  /** 🚫 Désactiver un utilisateur */
  deactivate(idUser: string): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/desactivate/${idUser}`,
      {}
    );
  }

  /** ✅ Activer un utilisateur */
  activate(idUser: string): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/activater/${idUser}`,
      {}
    );
  }
}
