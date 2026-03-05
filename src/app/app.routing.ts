import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { AuthGuard } from "./guards/auth.guard";
import { AddUpBlogComponent } from "./pages/add-up-blog/add-up-blog.component";
import { AddUpEventComponent } from "./pages/add-up-event/add-up-event.component";
import { AddUpFormationComponent } from "./pages/add-up-formation/add-up-formation.component";
import { FormationDetailComponent } from "./pages/formation-detail/formation-detail.component";

// const routes: Routes =[
//   {
//     path: '',
//     redirectTo: 'login',
//     pathMatch: 'full',
//   }, {
//     path: '',
//     component: AdminLayoutComponent,
//     children: [
//       {
//         path: '',
//         loadChildren: () => import('src/app/layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule)
//       }
//     ]
//   }, {
//     path: '',
//     component: AuthLayoutComponent,
//     children: [
//       {
//         path: '',
//         loadChildren: () => import('src/app/layouts/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule)
//       }
//     ]
//   }, {
//     path: '**',
//     redirectTo: 'login'
//   }
// ];

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },

  {
    path: "",
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // obligatoire pour protéger le dashboard
    children: [
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/admin-layout/admin-layout.module").then(
            (m) => m.AdminLayoutModule
          ),
      },
    ],
  },

  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      {
        path: "create-blog",
        component: AddUpBlogComponent,
      },
      { path: "update-blog/:id", component: AddUpBlogComponent },
      {
        path: "create-event",
        component: AddUpEventComponent,
      },
      {
        path: "add-formation",
        component: AddUpFormationComponent,
      },
      {
        path: "formations/detail/:id",
        component: FormationDetailComponent,
      },
      {
        path: "",
        loadChildren: () =>
          import("src/app/layouts/auth-layout/auth-layout.module").then(
            (m) => m.AuthLayoutModule
          ),
      },
    ],
  },

  { path: "**", redirectTo: "login" },
  // page 404 redirige vers login
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      // useHash: true
    }),
  ],
  exports: [],
})
export class AppRoutingModule {}
