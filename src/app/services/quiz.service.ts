import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { QuizRequestDTO, QuizResponseDTO } from "../models/Quiz";
import { Observable } from "rxjs";

export interface TentativeQuizResponse {
  id: number;
  score: number;
  reussi: boolean;
  dateTentative: string;
  nombreReponsesCorrectes: number;
  nombreQuestions: number;
  tempsPasse: number;
  // ... autres champs
}

@Injectable({
  providedIn: "root",
})
export class QuizService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/quiz`;

  /**
   * Créer un nouveau quiz pour un module
   */
  createQuiz(
    moduleId: number,
    request: QuizRequestDTO
  ): Observable<QuizResponseDTO> {
    return this.http.post<QuizResponseDTO>(
      `${this.apiUrl}/${moduleId}`,
      request
    );
  }

  /**
   * Récupérer un quiz par son ID
   */
  getQuizById(id: number): Observable<QuizResponseDTO> {
    return this.http.get<QuizResponseDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer le quiz associé à un module
   */
  getQuizByModule(moduleId: number): Observable<QuizResponseDTO> {
    return this.http.get<QuizResponseDTO>(`${this.apiUrl}/module/${moduleId}`);
  }

  /**
   * Mettre à jour les informations d'un quiz
   */
  updateQuiz(id: number, request: QuizRequestDTO): Observable<QuizResponseDTO> {
    return this.http.put<QuizResponseDTO>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprimer un quiz
   */
  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Gestion des Tentatives ---

  /**
   * Soumettre les réponses d'un utilisateur pour un quiz
   */
  // soumettreQuiz(userId: string, quizId: number, reponses: ReponseUtilisateurRequestDTO[]): Observable<TentativeQuizResponse> {
  //   const params = new HttpParams()
  //     .set('userId', userId)
  //     .set('quizId', quizId.toString());

  //   return this.http.post<TentativeQuizResponse>(`${this.apiUrl}/tentatives`, reponses, { params });
  // }

  /**
   * Récupérer l'historique des tentatives d'un utilisateur
   */
  getTentatives(
    userId: string,
    quizId: number
  ): Observable<TentativeQuizResponse[]> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("quizId", quizId.toString());
    return this.http.get<TentativeQuizResponse[]>(`${this.apiUrl}/tentatives`, {
      params,
    });
  }

  /**
   * Récupérer la meilleure performance d'un utilisateur sur un quiz
   */
  getMeilleureTentative(
    userId: string,
    quizId: number
  ): Observable<TentativeQuizResponse> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("quizId", quizId.toString());
    return this.http.get<TentativeQuizResponse>(
      `${this.apiUrl}/tentatives/meilleure`,
      { params }
    );
  }

  /**
   * Vérifier si le quiz a été validé (score min atteint)
   */
  hasPassedQuiz(
    userId: string,
    quizId: number
  ): Observable<{ reussi: boolean }> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("quizId", quizId.toString());
    return this.http.get<{ reussi: boolean }>(
      `${this.apiUrl}/tentatives/reussi`,
      { params }
    );
  }

  /**
   * Obtenir le nombre de chances restantes
   */
  getTentativesRestantes(
    userId: string,
    quizId: number
  ): Observable<{ tentativesRestantes: number }> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("quizId", quizId.toString());
    return this.http.get<{ tentativesRestantes: number }>(
      `${this.apiUrl}/tentatives/restantes`,
      { params }
    );
  }

  /**
   * Récupérer les statistiques globales (Admin/Formateur)
   */
  getQuizStatistics(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/stats`);
  }
}
