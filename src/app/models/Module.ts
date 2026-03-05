export interface ModuleRequest {
  titre: string;
  description: string;
  ordre: number;
  dureeEstimee: number;
}

export interface ModuleResponse {
  id: number;
  titre: string;
  description: string;
  ordre: number;
  dureeEstimee: number;
  nombreCours: number;
  hasQuiz: boolean;
}
