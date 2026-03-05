import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = "";

  ngOnInit() {
    this.loginForm = this.fb.group({
      identifiant: ["", Validators.required],
      motDePasse: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.errorMessage = "";
    const { identifiant, motDePasse } = this.loginForm.value;
    this.authService
      .signIn(identifiant, motDePasse)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          // Réactiver les champs après la fin de la requête
          this.loginForm.get("identifiant")?.enable();
          this.loginForm.get("motDePasse")?.enable();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(["/dashboard"]);
        },
        error: (error) => {
          console.error("Login error:", error);
          this.errorMessage =
            error.message || "Une erreur est survenue lors de la connexion";
        },
      });
  }
}
