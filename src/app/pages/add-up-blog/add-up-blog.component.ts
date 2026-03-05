import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BlogService } from "src/app/services/blog.service";
import { CategorieService } from "src/app/services/categorie.service";

@Component({
  selector: "app-add-up-blog",
  templateUrl: "./add-up-blog.component.html",
  styleUrls: ["./add-up-blog.component.scss"],
})
export class AddUpBlogComponent implements OnInit {
  blogRequest: any = {
    titre: "",
    description: "",
    categorieId: "",
    auteur: "", // À récupérer dynamiquement via AuthService plus tard
  };

  categories: any[] = [];
  selectedFiles: File[] = [];
  previews: string[] = []; // Pour afficher les images avant l'upload
  isSubmitting = false;
  isEditMode = false; // Flag pour le mode
  blogId: string | null = null;

  constructor(
    private blogService: BlogService,
    private categorieService: CategorieService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Charger les catégories pour le menu déroulant
    this.loadCategories();

    this.blogId = this.route.snapshot.paramMap.get("id");
    if (this.blogId) {
      this.isEditMode = true;
      this.loadBlogData(this.blogId);
    }
  }

  loadCategories() {
    this.categorieService
      .getAll()
      .subscribe((data) => (this.categories = data));
  }
  loadBlogData(id: string) {
    this.blogService.getBlogById(id).subscribe((blog) => {
      this.blogRequest = {
        titre: blog.titre,
        description: blog.description,
        categorieId: blog.categorieResponse?.id,
        auteur: blog.auteur,
      };
      // Si tu as des images existantes à afficher en preview, gère-les ici
    });
  }

  // Gestion de la sélection des images
  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.previews = [];

      // Générer les aperçus
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.previews.push(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  }

  // onSubmit(): void {
  //   this.isSubmitting = true;
  //   this.blogService
  //     .ajouterUnBlog(this.blogRequest, this.selectedFiles)
  //     .subscribe({
  //       next: () => {
  //         // Redirection vers la liste après succès
  //         this.router.navigate(["/liste-blog"]);
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.isSubmitting = false;
  //       },
  //     });
  // }
  onSubmit(): void {
    this.isSubmitting = true;

    if (this.isEditMode && this.blogId) {
      // Logique UPDATE
      this.blogService
        .updateBlog(this.blogId, this.blogRequest, this.selectedFiles)
        .subscribe({
          next: () => this.router.navigate(["/liste-blog"]),
          error: (err) => {
            console.error(err);
            this.isSubmitting = false;
          },
        });
    } else {
      // Logique CREATE
      this.blogService
        .ajouterUnBlog(this.blogRequest, this.selectedFiles)
        .subscribe({
          next: () => this.router.navigate(["/liste-blog"]),
          error: (err) => {
            console.error(err);
            this.isSubmitting = false;
          },
        });
    }
  }
}
