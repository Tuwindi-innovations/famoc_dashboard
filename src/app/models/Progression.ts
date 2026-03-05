import { FormationResponse } from './Formation';

export interface DemarrerFormationRequest {
  formationId: number;
}

export interface ProgressionFormationResponse {
  id: number;
  apprenantId: string;
  formation: FormationResponse; // L'objet complet est maintenant inclus
  statut: 'EN_COURS' | 'TERMINE' | 'NON_COMMENCE'; // Correspond à StatutProgression
  progression: number; // Pourcentage de 0 à 100
  dateDebut: string;
  dateFin?: string;
  tempsTotal: number; // Temps passé en minutes ou secondes
}
