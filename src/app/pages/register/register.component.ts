import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm!: FormGroup;

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      nom: ["", Validators.required],
      prenom: ["", Validators.required],
      username: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      telephone: ["", Validators.required],
      role: ["", Validators.required],
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      const signupData = this.registerForm.value;
      this.authService.signUp(signupData).subscribe({
        next: (response) => {
          console.log("Inscription réussie !", response);
          // Redirection vers la page de connexion après succès
          this.router.navigate(["/login"]);
        },
        error: (err) => {
          console.error("Erreur lors de l’inscription", err);
        },
      });
    }
  }
}
