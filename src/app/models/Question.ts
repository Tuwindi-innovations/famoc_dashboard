import {
  ReponseOptionRequestDTO,
  ReponseOptionResponseDTO,
} from "./ReponseOption";
import { TypeQuestion } from "./TypeQuestion";

export interface QuestionRequestDTO {
  texte: string;
  type: TypeQuestion;
  points: number;
  reponseOptions: ReponseOptionRequestDTO[];
}

export interface QuestionResponseDTO {
  id: number;
  texte: string;
  type: TypeQuestion;
  points: number;
  reponseOptions: ReponseOptionResponseDTO[];
}
