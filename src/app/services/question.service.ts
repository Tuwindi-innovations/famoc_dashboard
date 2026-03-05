import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { QuestionRequestDTO, QuestionResponseDTO } from "../models/Question";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QuestionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/questions`;

  /**
   * Crée une nouvelle question et l'attache à un quiz spécifique
   * POST /questions/{quizId}
   */
  createQuestion(
    quizId: number,
    request: QuestionRequestDTO
  ): Observable<QuestionResponseDTO> {
    return this.http.post<QuestionResponseDTO>(
      `${this.apiUrl}/${quizId}`,
      request
    );
  }

  /**
   * Récupère toutes les questions d'un quiz
   * GET /questions/quiz/{quizId}
   */
  getQuestionsByQuiz(quizId: number): Observable<QuestionResponseDTO[]> {
    return this.http.get<QuestionResponseDTO[]>(
      `${this.apiUrl}/quiz/${quizId}`
    );
  }

  /**
   * Supprime une question par son ID
   * DELETE /questions/{id}
   */
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
