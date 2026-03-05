import { QuestionResponseDTO } from "./Question";

export interface QuizRequestDTO {
  titre: string;
  description?: string;
  duree: number;
  scoreMinimum: number;
  nombreTentatives: number;
}

export interface QuizResponseDTO {
  id: number;
  titre: string;
  description: string;
  duree: number;
  scoreMinimum: number;
  nombreTentatives: number;
  nombreQuestions: number;
  pointsTotal: number;
  questions: QuestionResponseDTO[];
}
