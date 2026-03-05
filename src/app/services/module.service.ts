import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ModuleRequest, ModuleResponse } from '../models/Module';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/modules`;

  /**
   * Crée un nouveau module pour une formation donnée
   * POST /modules/{formationId}
   */
  createModule(
    formationId: number,
    module: ModuleRequest
  ): Observable<ModuleResponse> {
    return this.http.post<ModuleResponse>(
      `${this.apiUrl}/${formationId}`,
      module
    );
  }

  /**
   * Récupère un module par son ID
   * GET /modules/{id}
   */
  getModuleById(id: number): Observable<ModuleResponse> {
    return this.http.get<ModuleResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère tous les modules d'une formation
   * GET /modules?formationId=...
   */
  getModulesByFormation(formationId: number): Observable<ModuleResponse[]> {
    const params = new HttpParams().set('formationId', formationId.toString());
    return this.http.get<ModuleResponse[]>(this.apiUrl, { params });
  }

  /**
   * Met à jour un module existant
   * PUT /modules/{id}
   */
  updateModule(id: number, module: ModuleRequest): Observable<ModuleResponse> {
    return this.http.put<ModuleResponse>(`${this.apiUrl}/${id}`, module);
  }

  /**
   * Supprime un module
   * DELETE /modules/{id}
   */
  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Réorganise l'ordre des modules
   * PUT /modules/reorder?formationId=...
   */
  reorderModules(formationId: number, moduleIds: number[]): Observable<void> {
    const params = new HttpParams().set('formationId', formationId.toString());
    return this.http.put<void>(`${this.apiUrl}/reorder`, moduleIds, { params });
  }

  /**
   * Récupère les stats (nb cours, quiz, durée)
   * GET /modules/{id}/stats
   */
  getModuleStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }
}
