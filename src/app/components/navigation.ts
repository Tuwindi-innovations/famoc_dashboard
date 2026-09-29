/**
 * Plan de navigation de l'espace d'administration.
 *
 * Source unique : la barre latérale l'affiche, la barre supérieure y lit le
 * titre de la page courante. Ajouter une page = ajouter une entrée ici et la
 * route correspondante dans `admin-layout.routing.ts`.
 */

export interface ElementNav {
  readonly chemin: string;
  readonly titre: string;
  /** Classe FontAwesome, rendue avec `aria-hidden` (purement décorative). */
  readonly icone: string;
}

export interface GroupeNav {
  /** Absent pour le groupe de tête, qui n'a pas besoin d'intitulé. */
  readonly titre?: string;
  readonly elements: readonly ElementNav[];
}

export const NAVIGATION: readonly GroupeNav[] = [
  {
    elements: [
      { chemin: '/dashboard', titre: "Vue d'ensemble", icone: 'fa-chart-line' },
    ],
  },
  {
    titre: 'Pédagogie',
    elements: [
      { chemin: '/liste-formation', titre: 'Formations', icone: 'fa-graduation-cap' },
      { chemin: '/apprenants', titre: 'Apprenants', icone: 'fa-users' },
    ],
  },
  {
    titre: 'Engagement citoyen',
    elements: [
      { chemin: '/alerte', titre: 'Alertes', icone: 'fa-triangle-exclamation' },
      { chemin: '/contact', titre: 'Messages reçus', icone: 'fa-envelope' },
    ],
  },
  {
    titre: 'Contenus',
    elements: [
      { chemin: '/liste-blog', titre: 'Articles', icone: 'fa-newspaper' },
      { chemin: '/liste-event', titre: 'Évènements', icone: 'fa-calendar-days' },
      { chemin: '/ressource', titre: 'Ressources', icone: 'fa-folder-open' },
      { chemin: '/liste-headimage', titre: "Images d'en-tête", icone: 'fa-image' },
    ],
  },
  {
    titre: 'Administration',
    elements: [
      { chemin: '/liste-user', titre: 'Utilisateurs', icone: 'fa-user-shield' },
      { chemin: '/liste-categorie', titre: 'Catégories', icone: 'fa-tags' },
    ],
  },
];

/**
 * Pages sans entrée de menu, mais qui méritent un titre propre en barre
 * supérieure (écrans de détail et d'édition atteints depuis une liste).
 */
const TITRES_HORS_MENU: readonly ElementNav[] = [
  { chemin: '/formations/detail', titre: 'Détail de la formation', icone: '' },
  { chemin: '/add-formation', titre: 'Nouvelle formation', icone: '' },
  { chemin: '/formations', titre: 'Modifier la formation', icone: '' },
  { chemin: '/create-blog', titre: 'Nouvel article', icone: '' },
  { chemin: '/update-blog', titre: "Modifier l'article", icone: '' },
  { chemin: '/create-event', titre: 'Nouvel évènement', icone: '' },
  { chemin: '/evenements', titre: "Modifier l'évènement", icone: '' },
];

/** Tous les éléments à plat, pour la résolution du titre de page. */
export const ELEMENTS_NAV: readonly ElementNav[] = [
  ...NAVIGATION.flatMap((groupe) => groupe.elements),
  ...TITRES_HORS_MENU,
];

/**
 * Titre de la page correspondant à une URL.
 *
 * Retient la correspondance la plus longue afin qu'une route enfant
 * (`/liste-formation/12`) hérite du titre de son parent.
 */
export function titrePourUrl(url: string): string {
  const correspondance = ELEMENTS_NAV.filter((e) => url.startsWith(e.chemin)).sort(
    (a, b) => b.chemin.length - a.chemin.length,
  )[0];
  return correspondance?.titre ?? 'Administration';
}
