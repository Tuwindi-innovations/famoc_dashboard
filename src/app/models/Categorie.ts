import { Blog } from "./Blog";

export interface Categorie {
  id: string;
  nom: string;
  typeCategorie: string;
  description: string;
  active: boolean;
}

export interface CategorieResponse {
  id: string;
  nom: string;
  description: string;
  typeCategorie: string;
}

export interface CategorieRequest {
  nom: string;
  typeCategorie: string;
  description: string;
}
