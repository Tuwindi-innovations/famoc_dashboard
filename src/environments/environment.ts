export const environment = {
  production: false,
  apiUrl: 'http://localhost:7070/api/v1',
  /**
   * Passer à `true` le jour où le backend expose `GET /dashboard/stats`.
   * Tant que c'est `false`, le dashboard agrège les endpoints métier
   * existants côté client. Voir `DashboardStatsService`.
   */
  dashboardStatsEndpoint: false,
};
