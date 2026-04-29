import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";
import { ListeUserComponent } from "./pages/liste-user/liste-user.component";
import { ListeCategorieComponent } from "./pages/liste-categorie/liste-categorie.component";
import { ListeBlogComponent } from "./pages/liste-blog/liste-blog.component";
import { ListeEventComponent } from "./pages/liste-event/liste-event.component";
import { ListeHeadimageComponent } from "./pages/liste-headimage/liste-headimage.component";
import { AddUpUserComponent } from "./pages/add-up-user/add-up-user.component";
import { AddUpCategorieComponent } from "./pages/add-up-categorie/add-up-categorie.component";
import { AddUpHeadeimageComponent } from "./pages/add-up-headeimage/add-up-headeimage.component";
import { AddUpBlogComponent } from "./pages/add-up-blog/add-up-blog.component";
import { AddUpEventComponent } from "./pages/add-up-event/add-up-event.component";
import { CommonModule } from "@angular/common";
import { AuthInterceptor } from "./services/auth.interceptor";
import { ToastrModule } from "ngx-toastr";
import { JwtModule } from "@auth0/angular-jwt";
import { ListeFormationComponent } from "./pages/liste-formation/liste-formation.component";
import { AddUpFormationComponent } from "./pages/add-up-formation/add-up-formation.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { FormationDetailComponent } from "./pages/formation-detail/formation-detail.component";
import { FormModalComponent } from "./pages/form-modal/form-modal.component";
import { QuestionModalComponent } from "./pages/question-modal/question-modal.component";
import { RessourcesComponent } from './pages/ressources/ressources.component';
import { AprenantsComponent } from './pages/aprenants/aprenants.component';
import { AlerteComponent } from './pages/alerte/alerte.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    FormModalComponent,
    QuestionModalComponent,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:7070"], // Remplace par ton domaine backend
        disallowedRoutes: ["http://localhost:7070/api/v1/auth/login"],
      },
    }),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
    }),
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    ListeUserComponent,
    ListeCategorieComponent,
    ListeBlogComponent,
    ListeEventComponent,
    ListeHeadimageComponent,
    AddUpUserComponent,
    AddUpCategorieComponent,
    AddUpHeadeimageComponent,
    AddUpBlogComponent,
    AddUpEventComponent,
    ListeFormationComponent,
    AddUpFormationComponent,
    ContactComponent,
    FormationDetailComponent,
    RessourcesComponent,
    AprenantsComponent,
    AlerteComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function tokenGetter() {
  return localStorage.getItem("access_token");
}
