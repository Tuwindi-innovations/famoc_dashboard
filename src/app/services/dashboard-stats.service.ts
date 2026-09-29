import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AlerteResponse, StatutAlerte } from '../models/Alerte';
import { BlogResponse } from '../models/Blog';
import { Categorie } from '../models/Categorie';
import { Contact } from '../models/Contact';
import {
  DashboardStats,
  PointTemporel,
  RepartitionItem,
  StatsAlertes,
  StatsApprenants,
  StatsContenus,
  StatsFormations,
  StatsUtilisateurs,
} from '../models/DashboardStats';
import { EventResponse } from '../models/Event';
import { FormationResponse } from '../models/Formation';
import { Ressource } from '../models/Ressource';
import { UserResponseDTO } from '../models/User';
import { AlertService } from './alert.service';
import { AprenantsService } from './aprenants.service';
import { BlogService } from './blog.service';
import { CategorieService } from './categorie.service';
import { ContactService } from './contact.service';
import { EventService } from './event.service';
import { FormationService } from './formation.service';
import { RessourceService } from './ressource.service';
import { UserService } from './user.service';

/** Nombre de mois affichés dans la série temporelle des créations. */
const MOIS_HISTORIQUE = 12;

/**
 * Fournit l'instantané statistique du tableau de bord.
 *
 * Deux sources sont possibles et transparentes pour l'appelant :
 * - `GET /dashboard/stats` si le backend l'expose (un seul aller-retour) ;
 * - sinon, agrégation côté client des endpoints métier existants.
 *
 * Le basculement se fait par `environment.dashboardStatsEndpoint`. Aucune
 * modification du composant dashboard n'est nécessaire le jour où l'endpoint
 * backend arrive.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStatsService {
  private readonly http = inject(HttpClient);
  private readonly formations = inject(FormationService);
  private readonly apprenants = inject(AprenantsService);
  private readonly utilisateurs = inject(UserService);
  private readonly alertes = inject(AlertService);
  private readonly blogs = inject(BlogService);
  private readonly evenements = inject(EventService);
  private readonly ressources = inject(RessourceService);
  private readonly categories = inject(CategorieService);
  private readonly contacts = inject(ContactService);

  /** Charge les statistiques depuis la meilleure source disponible. */
  charger(): Observable<DashboardStats> {
    return environment.dashboardStatsEndpoint
      ? this.chargerDepuisBackend()
      : this.agregerDepuisEndpointsMetier();
  }

  /** Lit l'instantané pré-calculé par le backend. */
  private chargerDepuisBackend(): Observable<DashboardStats> {
    return this.http
      .get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`)
      .pipe(catchError(() => this.agregerDepuisEndpointsMetier()));
  }

  /**
   * Agrège les endpoints métier existants.
   *
   * Chaque source est isolée : si l'une échoue, elle est signalée dans
   * `sourcesIndisponibles` et le reste du tableau de bord s'affiche quand même.
   */
  private agregerDepuisEndpointsMetier(): Observable<DashboardStats> {
    const indisponibles: string[] = [];
    const resister = <T>(nom: string, repli: T) =>
      catchError<T, Observable<T>>(() => {
        indisponibles.push(nom);
        return of(repli);
      });

    // `forkJoin` suffit : chaque source ci-dessous intercepte déjà ses erreurs
    // et émet une valeur de repli, donc aucune ne peut interrompre l'ensemble.
    return forkJoin({
      formations: this.formations
        .afficherFormations()
        .pipe(resister('formations', [] as FormationResponse[])),
      apprenants: this.apprenants
        .getAllApprenants()
        .pipe(resister('apprenants', [] as UserResponseDTO[])),
      utilisateurs: this.utilisateurs
        .getAllUsers()
        .pipe(resister('utilisateurs', [] as UserResponseDTO[])),
      alertes: this.alertes
        .getAllAlertes()
        .pipe(resister('alertes', [] as AlerteResponse[])),
      blogs: this.blogs.getAllBlogs().pipe(resister('blogs', [] as BlogResponse[])),
      evenements: this.evenements
        .getAllEvents()
        .pipe(resister('évènements', [] as EventResponse[])),
      ressources: this.ressources
        .getAllRessources()
        .pipe(resister('ressources', [] as Ressource[])),
      categories: this.categories.getAll().pipe(resister('catégories', [] as Categorie[])),
      contacts: this.contacts
        .getAllContacts()
        .pipe(resister('contacts', [] as Contact[])),
    }).pipe(
      map((sources) => ({
        formations: this.calculerFormations(sources.formations),
        apprenants: this.calculerApprenants(sources.apprenants),
        utilisateurs: this.calculerUtilisateurs(sources.utilisateurs),
        alertes: this.calculerAlertes(sources.alertes),
        contenus: this.calculerContenus(
          sources.blogs,
          sources.evenements,
          sources.ressources,
          sources.categories,
          sources.contacts,
        ),
        sourcesIndisponibles: indisponibles,
      })),
    );
  }

  private calculerFormations(formations: readonly FormationResponse[]): StatsFormations {
    const actives = formations.filter((f) => f.active).length;
    const totalModules = formations.reduce((somme, f) => somme + (f.nombreModules ?? 0), 0);
    const dureeTotale = formations.reduce((somme, f) => somme + (f.dureeEstimee ?? 0), 0);

    return {
      total: formations.length,
      actives,
      inactives: formations.length - actives,
      totalModules,
      dureeMoyenneHeures: formations.length
        ? Math.round((dureeTotale / formations.length) * 10) / 10
        : 0,
      parNiveau: repartir(formations, (f) => f.niveau ?? 'Non défini'),
      parCategorie: repartir(formations, (f) => f.categorie?.trim() || 'Sans catégorie'),
      creationsParMois: serieMensuelle(formations, (f) => f.dateCreation),
    };
  }

  private calculerApprenants(apprenants: readonly UserResponseDTO[]): StatsApprenants {
    return {
      total: apprenants.length,
      // `active` est optionnel côté API : un apprenant sans drapeau est actif.
      actifs: apprenants.filter((a) => a.active !== false).length,
    };
  }

  private calculerUtilisateurs(utilisateurs: readonly UserResponseDTO[]): StatsUtilisateurs {
    return {
      total: utilisateurs.length,
      actifs: utilisateurs.filter((u) => u.active !== false).length,
      parRole: repartir(utilisateurs, (u) => u.role?.trim() || 'Sans rôle'),
    };
  }

  private calculerAlertes(alertes: readonly AlerteResponse[]): StatsAlertes {
    const compter = (statut: StatutAlerte) =>
      alertes.filter((a) => a.statut === statut).length;

    return {
      total: alertes.length,
      envoyees: compter(StatutAlerte.ENVOYER),
      enCours: compter(StatutAlerte.ENCOURSDETRAITEMENT),
      resolues: compter(StatutAlerte.RESOLUE),
      parCategorie: repartir(alertes, (a) => a.categorie ?? 'Non catégorisée'),
    };
  }

  private calculerContenus(
    blogs: readonly BlogResponse[],
    evenements: readonly EventResponse[],
    ressources: readonly Ressource[],
    categories: readonly Categorie[],
    contacts: readonly Contact[],
  ): StatsContenus {
    const maintenant = Date.now();

    return {
      blogs: blogs.length,
      blogsActifs: blogs.filter((b) => b.active).length,
      evenements: evenements.length,
      evenementsAVenir: evenements.filter((e) => {
        const debut = Date.parse(e.dateDebutEvent);
        return Number.isFinite(debut) && debut >= maintenant;
      }).length,
      ressources: ressources.length,
      categories: categories.length,
      contacts: contacts.length,
    };
  }
}

/** Compte les occurrences puis trie par effectif décroissant. */
function repartir<T>(items: readonly T[], cle: (item: T) => string): RepartitionItem[] {
  const compteurs = new Map<string, number>();
  for (const item of items) {
    const libelle = cle(item);
    compteurs.set(libelle, (compteurs.get(libelle) ?? 0) + 1);
  }
  return [...compteurs.entries()]
    .map(([libelle, valeur]) => ({ libelle, valeur }))
    .sort((a, b) => b.valeur - a.valeur);
}

/**
 * Construit une série sur les `MOIS_HISTORIQUE` derniers mois, mois vides
 * inclus, afin que le graphique n'ait pas de trous.
 */
function serieMensuelle<T>(
  items: readonly T[],
  date: (item: T) => string | undefined,
): PointTemporel[] {
  const compteurs = new Map<string, number>();
  const reference = new Date();

  for (let recul = MOIS_HISTORIQUE - 1; recul >= 0; recul--) {
    const mois = new Date(reference.getFullYear(), reference.getMonth() - recul, 1);
    compteurs.set(clePeriode(mois), 0);
  }

  for (const item of items) {
    const brut = date(item);
    if (!brut) {
      continue;
    }
    const horodatage = Date.parse(brut);
    if (!Number.isFinite(horodatage)) {
      continue;
    }
    const cle = clePeriode(new Date(horodatage));
    // Hors fenêtre d'historique : on ignore sans créer de période parasite.
    if (compteurs.has(cle)) {
      compteurs.set(cle, (compteurs.get(cle) ?? 0) + 1);
    }
  }

  return [...compteurs.entries()].map(([periode, valeur]) => ({ periode, valeur }));
}

function clePeriode(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
