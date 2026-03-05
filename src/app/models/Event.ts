import { Categorie } from "./Categorie";
import { MediaResponseDTO } from "./Media";

export interface Event {
  idEvent: string;
  titre: string;
  description: string;
  image: string;
  dateCreation: string;
  dateDebutEvent: string;
  dateFinEvent: string;
  lieu: string;
  organisateur: string;
  categorie: Categorie;
  active: boolean;
}

export interface EventResponse {
  id: string;
  titre: string;
  description: string;
  dateDebutEvent: string;
  dateFinEvent: string;
  organisateur: string;
  categorieId: string;
  lieu: string;
  media: MediaResponseDTO[];
  active: boolean;
}

export interface EventRequest {
  titre: string;
  description: string;
  dateDebutEvent: string; // Format attendu par le backend : "YYYY-MM-DD"
  dateFinEvent: string; // Format attendu par le backend : "YYYY-MM-DD"
  organisateur: string;
  categorieId: string;
  lieu: string;
}
