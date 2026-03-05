import { Injectable } from "@angular/core";
import { CResponse } from "../models/CResponse";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { Blog, BlogResponse } from "../models/Blog";

interface blogRequest {
  titre: String;
  description: String;
  categorieId: String;
  auteur: String;
}
@Injectable({
  providedIn: "root",
})
export class BlogService {
  private serviceUrl: string;
  private baseUrl: string = "blogs";
  constructor(private http: HttpClient) {
    this.serviceUrl = environment.apiUrl;
  }

  ajouterUnBlog(
    blogData: blogRequest,
    images: File[]
  ): Observable<BlogResponse> {
    const formData = new FormData();

    // 1. On transforme l'objet blog en string JSON (car ton backend utilise String blogRequest)
    formData.append("blog", JSON.stringify(blogData));

    // 2. On ajoute chaque image au tableau "images"
    images.forEach((file) => {
      formData.append("images", file, file.name);
    });

    // 3. On envoie le tout (Angular gère le Content-Type automatiquement pour FormData)
    return this.http.post<BlogResponse>(
      `${this.serviceUrl}/${this.baseUrl}`,
      formData
    );
  }

  updateBlog(
    idBlog: string,
    blogData: blogRequest,
    images: File[]
  ): Observable<BlogResponse> {
    const formData = new FormData();

    formData.append("blog", JSON.stringify(blogData));

    images.forEach((file) => {
      formData.append("images", file, file.name);
    });

    return this.http.put<BlogResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${idBlog}`,
      blogData
    );
  }

  /**
   * 3. LECTURE - Tous les Blogs
   */
  getAllBlogs(): Observable<BlogResponse[]> {
    return this.http.get<BlogResponse[]>(`${this.serviceUrl}/${this.baseUrl}`);
  }

  /**
   * 4. LECTURE - Blog par ID
   */
  getBlogById(id: string): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(
      `${this.serviceUrl}/${this.baseUrl}/${id}`
    );
  }

  /**
   * 5. LECTURE - Blogs par Catégorie
   */
  getBlogByCategory(idCategorie: string): Observable<BlogResponse[]> {
    return this.http.get<BlogResponse[]>(
      `${this.serviceUrl}/${this.baseUrl}/getBlogByCategory/${idCategorie}`
    );
  }

  /**
   * 6. SUPPRESSION (DELETE)
   */
  deleteBlog(id: string): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.serviceUrl}/${this.baseUrl}/${id}`
    );
  }

  /**
   * 7. DÉSACTIVATION (POST)
   */
  deactivateBlog(id: string): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/desactive/${id}`,
      {}
    );
  }

  /**
   * 8. ACTIVATION (POST)
   */
  activateBlog(id: string): Observable<CResponse> {
    return this.http.post<CResponse>(
      `${this.serviceUrl}/${this.baseUrl}/active/${id}`,
      {}
    );
  }
}
