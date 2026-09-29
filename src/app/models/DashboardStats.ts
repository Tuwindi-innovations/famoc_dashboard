/**
 * Formes de données du tableau de bord.
 *
 * Ces interfaces décrivent le contrat attendu par le dashboard, indépendamment
 * de la façon dont les chiffres sont obtenus : agrégation côté client à partir
 * des endpoints métier existants, ou futur endpoint dédié côté backend.
 */

/** Une paire libellé / valeur, pour les répartitions (camemberts, barres). */
export interface RepartitionItem {
  libelle: string;
  valeur: number;
}

/** Un point d'une série temporelle, `periode` au format `YYYY-MM`. */
export interface PointTemporel {
  periode: string;
  valeur: number;
}

export interface StatsFormations {
  total: number;
  actives: number;
  inactives: number;
  totalModules: number;
  dureeMoyenneHeures: number;
  parNiveau: RepartitionItem[];
  parCategorie: RepartitionItem[];
  creationsParMois: PointTemporel[];
}

export interface StatsApprenants {
  total: number;
  actifs: number;
}

export interface StatsUtilisateurs {
  total: number;
  actifs: number;
  parRole: RepartitionItem[];
}

export interface StatsAlertes {
  total: number;
  envoyees: number;
  enCours: number;
  resolues: number;
  parCategorie: RepartitionItem[];
}

export interface StatsContenus {
  blogs: number;
  blogsActifs: number;
  evenements: number;
  evenementsAVenir: number;
  ressources: number;
  categories: number;
  contacts: number;
}

/** Instantané complet du tableau de bord. */
export interface DashboardStats {
  formations: StatsFormations;
  apprenants: StatsApprenants;
  utilisateurs: StatsUtilisateurs;
  alertes: StatsAlertes;
  contenus: StatsContenus;
  /** Renseigné quand une source de données n'a pas répondu. */
  sourcesIndisponibles: string[];
}
