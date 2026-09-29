import { Routes } from "@angular/router";

import { AuthGuard } from "src/app/guards/auth.guard";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { AlerteComponent } from "src/app/pages/alerte/alerte.component";
import { AprenantsComponent } from "src/app/pages/aprenants/aprenants.component";
import { ContactComponent } from "src/app/pages/contact/contact.component";
import { ListeBlogComponent } from "src/app/pages/liste-blog/liste-blog.component";
import { ListeCategorieComponent } from "src/app/pages/liste-categorie/liste-categorie.component";
import { ListeEventComponent } from "src/app/pages/liste-event/liste-event.component";
import { ListeFormationComponent } from "src/app/pages/liste-formation/liste-formation.component";
import { ListeHeadimageComponent } from "src/app/pages/liste-headimage/liste-headimage.component";
import { ListeUserComponent } from "src/app/pages/liste-user/liste-user.component";
import { RessourcesComponent } from "src/app/pages/ressources/ressources.component";

export const AdminLayoutRoutes: Routes = [
  { path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard] },
  { path: "liste-formation", component: ListeFormationComponent, canActivate: [AuthGuard] },
  { path: "apprenants", component: AprenantsComponent, canActivate: [AuthGuard] },
  { path: "liste-user", component: ListeUserComponent, canActivate: [AuthGuard] },
  { path: "liste-categorie", component: ListeCategorieComponent, canActivate: [AuthGuard] },
  { path: "liste-blog", component: ListeBlogComponent, canActivate: [AuthGuard] },
  { path: "liste-event", component: ListeEventComponent, canActivate: [AuthGuard] },
  { path: "liste-headimage", component: ListeHeadimageComponent, canActivate: [AuthGuard] },
  { path: "ressource", component: RessourcesComponent, canActivate: [AuthGuard] },
  { path: "alerte", component: AlerteComponent, canActivate: [AuthGuard] },
  { path: "contact", component: ContactComponent, canActivate: [AuthGuard] },
];
