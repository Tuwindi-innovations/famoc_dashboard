import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BlogResponse } from "src/app/models/Blog";
import { BlogService } from "src/app/services/blog.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-liste-blog",
  templateUrl: "./liste-blog.component.html",
  styleUrls: ["./liste-blog.component.scss"],
})
export class ListeBlogComponent implements OnInit {
  private blogService = inject(BlogService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  blogs: BlogResponse[] = [];
  isLoading: boolean = true;
  errorMessage: string = "";

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.blogService.getAllBlogs().subscribe({
      next: (data: BlogResponse[]) => {
        this.blogs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des blogs", err);
        this.errorMessage = "Impossible de charger les articles.";
        this.isLoading = false;
      },
    });
  }

  getBlogImage(blog: BlogResponse): string {
    if (blog.media && blog.media.length > 0) {
      const firstMedia = blog.media[0];
      if (firstMedia.webPath) {
        return `${environment.apiUrl}${firstMedia.webPath}`;
      }
    }
    return "assets/img/theme/img-1-1000x600.jpg";
  }

  // Suppression d'un blog
  onDelete(id: string): void {
    if (confirm("Voulez-vous vraiment supprimer cet article ?")) {
      this.blogService.deleteBlog(id).subscribe({
        next: () => {
          this.toastr.success("Article supprimé avec succès");
          this.loadBlogs();
        },
        error: (err) => {
          this.toastr.error("Erreur lors de la suppression");
        },
      });
    }
  }

  // Activer ou Désactiver un blog
  onToggleStatus(blog: BlogResponse): void {
    const action = blog.active
      ? this.blogService.deactivateBlog(blog.id)
      : this.blogService.activateBlog(blog.id);

    action.subscribe({
      next: () => {
        this.toastr.info(`Article ${blog.active ? "désactivé" : "activé"}`);
        this.loadBlogs();
      },
      error: (err) => {
        this.toastr.error("Erreur lors du changement de statut");
      },
    });
  }

  // Navigation vers la modification
  onEdit(id: string): void {
    this.router.navigate(["/update-blog", id]);
  }
}
