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

/** Libellés lisibles des catégories, partagés par toutes les vues. */
export const LIBELLE_CATEGORIE: Record<string, string> = {
  INFRASTRUCTURE: 'Infrastructure',
  SANTE: 'Santé',
  EDUCATION: 'Éducation',
  ENVIRONNEMENT: 'Environnement',
  SECURITE: 'Sécurité',
  CITOYENNETE: 'Citoyenneté',
};

/** Libellés lisibles des statuts. */
export const LIBELLE_STATUT: Record<string, string> = {
  ENVOYER: 'En attente',
  ENCOURSDETRAITEMENT: 'En cours',
  RESOLUE: 'Résolue',
};

export function libelleCategorie(categorie: string | null | undefined): string {
  if (!categorie) {
    return 'Sans catégorie';
  }
  return LIBELLE_CATEGORIE[categorie] ?? categorie;
}
