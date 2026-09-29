import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Routes de l'application.
 *
 * Deux coquilles : `AdminLayout` (protégée par `authGuard`) et `AuthLayout`
 * (publique, pour la connexion). Chaque page est chargée à la demande.
 *
 * Les pages de création et de détail vivaient auparavant sous `AuthLayout` :
 * elles s'affichaient donc sans navigation ET sans garde d'authentification.
 * Elles sont désormais à leur place, sous la coquille d'administration.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: "Vue d'ensemble · FAMOC",
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      // --- Pédagogie ---------------------------------------------------------
      {
        path: 'liste-formation',
        title: 'Formations · FAMOC',
        loadComponent: () =>
          import('./pages/liste-formation/liste-formation.component').then(
            (m) => m.ListeFormationComponent,
          ),
      },
      {
        path: 'add-formation',
        title: 'Nouvelle formation · FAMOC',
        loadComponent: () =>
          import('./pages/add-up-formation/add-up-formation.component').then(
            (m) => m.AddUpFormationComponent,
          ),
      },
      {
        path: 'formations/:id/modifier',
        title: 'Modifier la formation · FAMOC',
        loadComponent: () =>
          import('./pages/add-up-formation/add-up-formation.component').then(
            (m) => m.AddUpFormationComponent,
          ),
      },
      {
        path: 'formations/detail/:id',
        title: 'Détail de la formation · FAMOC',
        loadComponent: () =>
          import('./pages/formation-detail/formation-detail.component').then(
            (m) => m.FormationDetailComponent,
          ),
      },
      {
        path: 'apprenants',
        title: 'Apprenants · FAMOC',
        loadComponent: () =>
          import('./pages/aprenants/aprenants.component').then((m) => m.AprenantsComponent),
      },

      // --- Engagement citoyen ------------------------------------------------
      {
        path: 'alerte',
        title: 'Alertes · FAMOC',
        loadComponent: () =>
          import('./pages/alerte/alerte.component').then((m) => m.AlerteComponent),
      },
      {
        path: 'contact',
        title: 'Messages reçus · FAMOC',
        loadComponent: () =>
          import('./pages/contact/contact.component').then((m) => m.ContactComponent),
      },

      // --- Contenus ----------------------------------------------------------
      {
        path: 'liste-blog',
        title: 'Articles · FAMOC',
        loadComponent: () =>
          import('./pages/liste-blog/liste-blog.component').then((m) => m.ListeBlogComponent),
      },
      {
        path: 'create-blog',
        title: 'Nouvel article · FAMOC',
        loadComponent: () =>
          import('./pages/add-up-blog/add-up-blog.component').then((m) => m.AddUpBlogComponent),
      },
      {
        path: 'update-blog/:id',
        title: "Modifier l'article · FAMOC",
        loadComponent: () =>
          import('./pages/add-up-blog/add-up-blog.component').then((m) => m.AddUpBlogComponent),
      },
      {
        path: 'liste-event',
        title: 'Évènements · FAMOC',
        loadComponent: () =>
          import('./pages/liste-event/liste-event.component').then((m) => m.ListeEventComponent),
      },
      {
        path: 'create-event',
        title: 'Nouvel évènement · FAMOC',
        loadComponent: () =>
          import('./pages/add-up-event/add-up-event.component').then(
            (m) => m.AddUpEventComponent,
          ),
      },
      {
        path: 'ressource',
        title: 'Ressources · FAMOC',
        loadComponent: () =>
          import('./pages/ressources/ressources.component').then((m) => m.RessourcesComponent),
      },
      {
        path: 'liste-headimage',
        title: "Images d'en-tête · FAMOC",
        loadComponent: () =>
          import('./pages/liste-headimage/liste-headimage.component').then(
            (m) => m.ListeHeadimageComponent,
          ),
      },

      // --- Administration ----------------------------------------------------
      {
        path: 'liste-user',
        title: 'Utilisateurs · FAMOC',
        loadComponent: () =>
          import('./pages/liste-user/liste-user.component').then((m) => m.ListeUserComponent),
      },
      {
        path: 'liste-categorie',
        title: 'Catégories · FAMOC',
        loadComponent: () =>
          import('./pages/liste-categorie/liste-categorie.component').then(
            (m) => m.ListeCategorieComponent,
          ),
      },
    ],
  },

  // --- Coquille publique ---------------------------------------------------
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        title: 'Connexion · FAMOC',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Créer un compte · FAMOC',
        loadComponent: () =>
          import('./pages/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
