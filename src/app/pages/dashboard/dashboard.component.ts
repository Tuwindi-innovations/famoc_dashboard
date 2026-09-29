import { DecimalPipe } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, type ChartConfiguration } from 'chart.js/auto';
import type { DashboardStats, PointTemporel, RepartitionItem } from '../../models/DashboardStats';
import { DashboardStatsService } from '../../services/dashboard-stats.service';

/** Libellés lisibles pour les niveaux renvoyés par l'API. */
const LIBELLES_NIVEAU: Record<string, string> = {
  DEBUTANT: 'Débutant',
  Intermediaire: 'Intermédiaire',
  AVANCER: 'Avancé',
};

/** Ordre pédagogique des niveaux, indépendant de leur effectif. */
const ORDRE_NIVEAU = ['DEBUTANT', 'Intermediaire', 'AVANCER'];

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly statsService = inject(DashboardStatsService);

  private readonly canvasCreations =
    viewChild<ElementRef<HTMLCanvasElement>>('canvasCreations');

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal(false);

  /** Bascule entre le graphique et son équivalent tabulaire. */
  protected readonly vueTableau = signal(false);

  private graphique?: Chart;

  constructor() {
    this.charger();

    // Le graphique est (re)construit après chaque rendu où les données ou la
    // vue changent ; `afterRenderEffect` garantit que le canvas existe.
    afterRenderEffect(() => {
      const donnees = this.stats()?.formations.creationsParMois;
      const canvas = this.canvasCreations()?.nativeElement;

      this.graphique?.destroy();
      this.graphique = undefined;

      if (donnees && canvas) {
        this.graphique = new Chart(canvas, this.configurationCreations(donnees));
      }
    });
  }

  protected charger(): void {
    this.chargement.set(true);
    this.erreur.set(false);

    this.statsService.charger().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set(true);
        this.chargement.set(false);
      },
    });
  }

  // --- Données dérivées ------------------------------------------------------

  /** Niveaux dans l'ordre pédagogique, avec libellés lisibles. */
  protected readonly niveaux = computed<RepartitionItem[]>(() => {
    const brut = this.stats()?.formations.parNiveau ?? [];
    return [...brut]
      .sort((a, b) => indexNiveau(a.libelle) - indexNiveau(b.libelle))
      .map((item) => ({
        libelle: LIBELLES_NIVEAU[item.libelle] ?? item.libelle,
        valeur: item.valeur,
      }));
  });

  /** Les six premières catégories ; le reste est replié dans « Autres ». */
  protected readonly categories = computed<RepartitionItem[]>(() => {
    const brut = this.stats()?.formations.parCategorie ?? [];
    if (brut.length <= 6) {
      return brut;
    }
    const tete = brut.slice(0, 6);
    const reste = brut.slice(6).reduce((somme, item) => somme + item.valeur, 0);
    return [...tete, { libelle: 'Autres', valeur: reste }];
  });

  protected readonly roles = computed<RepartitionItem[]>(
    () => this.stats()?.utilisateurs.parRole ?? [],
  );

  /** Série temporelle avec libellés de mois formatés pour le tableau. */
  protected readonly creations = computed(() =>
    (this.stats()?.formations.creationsParMois ?? []).map((point) => ({
      ...point,
      libelle: libelleMois(point.periode),
    })),
  );

  /** Part des alertes résolues, pour la jauge de traitement. */
  protected readonly tauxResolution = computed(() => {
    const alertes = this.stats()?.alertes;
    if (!alertes?.total) {
      return 0;
    }
    return Math.round((alertes.resolues / alertes.total) * 100);
  });

  /** Plus grande valeur d'une répartition, pour dimensionner les barres. */
  protected maximum(items: readonly RepartitionItem[]): number {
    return items.reduce((max, item) => Math.max(max, item.valeur), 0);
  }

  /** Largeur de barre en pourcentage, jamais nulle pour une valeur non nulle. */
  protected largeur(valeur: number, items: readonly RepartitionItem[]): number {
    const max = this.maximum(items);
    return max ? (valeur / max) * 100 : 0;
  }

  // --- Configuration du graphique -------------------------------------------

  /**
   * Série unique : donc rampe bleue, pas de palette catégorielle et pas de
   * légende (le titre de la carte nomme la série).
   */
  private configurationCreations(points: readonly PointTemporel[]): ChartConfiguration {
    const styles = getComputedStyle(document.documentElement);
    const lire = (token: string) => styles.getPropertyValue(token).trim();

    const trait = lire('--viz-2') || '#2a78d6';
    const remplissage = lire('--viz-fill') || 'rgba(42, 120, 214, 0.14)';
    const encreDiscrete = lire('--ink-muted') || '#898781';
    const ligneGrille = lire('--grid-line') || '#e1e0d9';
    const surface = lire('--surface') || '#fcfcfb';
    const encre = lire('--ink') || '#0b0b0b';

    return {
      type: 'line',
      data: {
        labels: points.map((p) => libelleMois(p.periode)),
        datasets: [
          {
            label: 'Formations créées',
            data: points.map((p) => p.valeur),
            borderColor: trait,
            backgroundColor: remplissage,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointBackgroundColor: trait,
            // Anneau de la couleur de surface : le point reste lisible même
            // superposé à la courbe.
            pointHoverBorderColor: surface,
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // Réticule : la valeur de tous les points du mois survolé.
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: encre,
            titleColor: surface,
            bodyColor: surface,
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: (contexte) => {
                const valeur = contexte.parsed.y;
                return `${valeur} formation${valeur === 1 ? '' : 's'}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: ligneGrille },
            ticks: { color: encreDiscrete, font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: ligneGrille },
            border: { display: false },
            ticks: {
              color: encreDiscrete,
              font: { size: 11 },
              // Un compteur de formations est entier : pas de demi-graduation.
              precision: 0,
            },
          },
        },
      },
    };
  }
}

function indexNiveau(niveau: string): number {
  const index = ORDRE_NIVEAU.indexOf(niveau);
  return index === -1 ? ORDRE_NIVEAU.length : index;
}

/** `2026-03` → `mars 26`. */
function libelleMois(periode: string): string {
  const [annee, mois] = periode.split('-').map(Number);
  if (!annee || !mois) {
    return periode;
  }
  const date = new Date(annee, mois - 1, 1);
  const nom = date.toLocaleDateString('fr-FR', { month: 'short' });
  return `${nom} ${String(annee).slice(2)}`;
}
