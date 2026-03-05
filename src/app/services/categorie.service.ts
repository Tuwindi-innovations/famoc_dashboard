import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Categorie, CategorieRequest } from "../models/Categorie";
import { Observable } from "rxjs";
import { CResponse } from "../models/CResponse";

@Injectable({
  providedIn: "root",
})
export class CategorieService {
  private serviceUrl: string;
  private baseUrl: string = "categorie";
  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  /** ➕ Créer une catégorie */
  create(categorie: CategorieRequest): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/create`,
      categorie
    );
  }

  /** ✏️ Mettre à jour une catégorie */
  update(idCategorie: string, categorie: Categorie): Observable<CResponse> {
    return this.http.put<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/update/${idCategorie}`,
      categorie
    );
  }

  /** 🔍 Récupérer toutes les catégories */
  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(
      `${this.serviceUrl}/${this.baseUrl}/getAllCategorie`
    );
  }

  /** 🔍 Récupérer une catégorie par ID */
  getById(idCategorie: string): Observable<Categorie> {
    return this.http.get<Categorie>(
      `${this.serviceUrl}/${this.baseUrl}/getById/${idCategorie}`
    );
  }

  /** 🗑️ Supprimer une catégorie */
  delete(idCategorie: string): Observable<void> {
    return this.http.delete<void>(
      `${this.serviceUrl}/${this.baseUrl}/delete/${idCategorie}`
    );
  }

  /** 🚫 Désactiver une catégorie */
  deactivate(idCategorie: string): Observable<void> {
    return this.http.post<void>(
      `${this.serviceUrl}/${this.baseUrl}/${idCategorie}/deactivater`,
      {}
    );
  }

  /** ✅ Activer une catégorie */
  activate(idCategorie: string): Observable<void> {
    return this.http.post<void>(
      `${this.serviceUrl}/${this.baseUrl}/${idCategorie}/activater`,
      {}
    );
  }

  /** 🔎 Trouver les catégories par type (TypeCategorie enum côté backend) */
  findByType(typeCategorie: string): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(
      `${this.serviceUrl}/${this.baseUrl}/findByTypeCategrie/${typeCategorie}`
    );
  }
}
