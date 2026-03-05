import { CategorieResponse } from "./Categorie";
import { MediaResponseDTO } from "./Media";

export interface Blog {
  id: string;
  titre: string;
  description: string;
  image: string;
  dateCreation: string;
  datePublication: string;
  auteur: string;
  categorie: string;
  active: boolean;
}

export interface BlogResponse {
  id: string;
  titre: string;
  description: string;
  auteur: string;
  categorieResponse?: CategorieResponse;
  dateCreation: string;
  datePublication: string;
  media: MediaResponseDTO[];
  active: boolean;
}

export interface blogRequest {
  titre: String;
  description: String;
  categorieId: String;
  auteur: String;
}
