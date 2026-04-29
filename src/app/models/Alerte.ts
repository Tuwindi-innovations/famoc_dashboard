export interface AlerteResponse {
  id: number;
  titre: string;
  description: string;
  categorie: CategorieAlert;
  localisation: string;
  imageUrl: string;
  dateCreation: string;
  apprenantId: string;
  statut: StatutAlerte;
}

export enum CategorieAlert {
  INFRASTRUCTURE = "INFRASTRUCTURE",
  SANTE = "SANTE",
  EDUCATION = "EDUCATION",
  ENVIRONNEMENT = "ENVIRONNEMENT",
  SECURITE = "SECURITE",
  CITOYENNETE = "CITOYENNETE",
}

export enum StatutAlerte {
  ENVOYER = "ENVOYER",
  ENCOURSDETRAITEMENT = "ENCOURSDETRAITEMENT",
  RESOLUE = "RESOLUE",
}
