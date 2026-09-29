import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly formulaire = this.fb.nonNullable.group({
    identifiant: ['', [Validators.required]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly enCours = signal(false);
  protected readonly messageErreur = signal('');
  protected readonly motDePasseVisible = signal(false);

  protected soumettre(): void {
    // Un envoi au clavier peut contourner l'état désactivé du bouton : on
    // revalide ici et on affiche les erreurs plutôt que d'échouer en silence.
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.messageErreur.set('');
    this.enCours.set(true);

    const { identifiant, motDePasse } = this.formulaire.getRawValue();

    this.auth
      .signIn(identifiant, motDePasse)
      .pipe(finalize(() => this.enCours.set(false)))
      .subscribe({
        next: () => {
          // `redirectTo` est posé par `authGuard` : on ramène l'utilisateur là
          // où il allait avant d'être renvoyé vers la connexion.
          const destination =
            this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';
          this.router.navigateByUrl(destination);
        },
        error: (erreur: Error) => {
          this.messageErreur.set(erreur.message || 'La connexion a échoué.');
        },
      });
  }

  protected estInvalide(champ: 'identifiant' | 'motDePasse'): boolean {
    const controle = this.formulaire.controls[champ];
    return controle.invalid && controle.touched;
  }
}
