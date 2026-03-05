export enum Niveau {
  DEBUTANT = "DEBUTANT",
  Intermediaire = "Intermediaire",
  AVANCER = "AVANCER",
}

export interface FormationResponse {
  id: number;
  titre: string;
  description: string;
  imageUrl: string;
  categorie: string;
  dureeEstimee: number;
  niveau: Niveau;
  active: boolean;
  dateCreation: string;
  nombreModules: number;
}

export interface FormationRequest {
  titre: string;
  description: string;
  categorie: String;
  dureeEstimee: string; // On garde la majuscule si ton backend l'attend ainsi dans le JSON
  niveau: Niveau;
}
