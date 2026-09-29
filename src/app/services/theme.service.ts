import { effect, Injectable, signal } from '@angular/core';

/** Les trois états possibles : `system` suit le réglage du système. */
export type Theme = 'system' | 'light' | 'dark';

const CLE_STOCKAGE = 'famoc-theme';
const THEMES: readonly Theme[] = ['system', 'light', 'dark'];

/**
 * Gère le thème visible et le conserve entre les sessions.
 *
 * Le thème est appliqué via l'attribut `data-theme` sur `<html>`, que les
 * tokens SCSS interprètent. En `system`, aucun attribut n'est posé : c'est la
 * media query `prefers-color-scheme` qui décide.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.lireStockage());

  /** Le thème choisi par l'utilisateur (lecture seule). */
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => this.appliquer(this._theme()));
  }

  definir(theme: Theme): void {
    this._theme.set(theme);
    try {
      localStorage.setItem(CLE_STOCKAGE, theme);
    } catch {
      // Stockage indisponible (navigation privée) : le thème reste en mémoire.
    }
  }

  /** Fait défiler système → clair → sombre → système. */
  suivant(): void {
    const index = THEMES.indexOf(this._theme());
    this.definir(THEMES[(index + 1) % THEMES.length]);
  }

  private appliquer(theme: Theme): void {
    const racine = document.documentElement;
    if (theme === 'system') {
      racine.removeAttribute('data-theme');
    } else {
      racine.setAttribute('data-theme', theme);
    }
  }

  private lireStockage(): Theme {
    try {
      const valeur = localStorage.getItem(CLE_STOCKAGE);
      return THEMES.includes(valeur as Theme) ? (valeur as Theme) : 'system';
    } catch {
      return 'system';
    }
  }
}
