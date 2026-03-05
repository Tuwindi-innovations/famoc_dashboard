import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "ni-tv-2 text-primary",
    class: "",
  },
  // { path: '/icons', title: 'Icons',  icon:'ni-planet text-blue', class: '' },
  // { path: '/maps', title: 'Maps',  icon:'ni-pin-3 text-orange', class: '' },
  // { path: '/user-profile', title: 'User profile',  icon:'ni-single-02 text-yellow', class: '' },
  // { path: '/tables', title: 'Tables',  icon:'ni-bullet-list-67 text-red', class: '' },
  {
    path: "/liste-user",
    title: "Liste users",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/liste-categorie",
    title: "Liste categories",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/liste-blog",
    title: "Liste blog",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/liste-event",
    title: "Liste event",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/liste-formation",
    title: "Liste formation",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/contact",
    title: "Les contacts",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/liste-headimage",
    title: "Liste head image",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  {
    path: "/ressource",
    title: "Lste ressource",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  // { path: '/login', title: 'Login',  icon:'ni-key-25 text-info', class: '' },
  // { path: '/register', title: 'Register',  icon:'ni-circle-08 text-pink', class: '' }
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  public menuItems: any[] = [];
  public isCollapsed = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }

  logout() {
    // 1. Supprimer le token ou les infos de session
    localStorage.removeItem("token"); // Ou votre logique de session

    // 2. Rediriger vers la page de connexion
    this.router.navigate(["/login"]);

    console.log("Utilisateur déconnecté");
  }
}
