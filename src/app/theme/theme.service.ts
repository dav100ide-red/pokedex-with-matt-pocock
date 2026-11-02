import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

/** The class on <html> that switches PrimeNG to dark mode (its `darkModeSelector`). */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex.theme';

/** Light or dark mode: follows the OS setting until the user picks one, which is then remembered. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly isDark = signal(this.initialIsDark());

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, this.isDark());
    });
  }

  toggle(): void {
    this.isDark.update((isDark) => !isDark);
    try {
      localStorage.setItem(STORAGE_KEY, this.isDark() ? 'dark' : 'light');
    } catch {
      // Storage is unavailable (e.g. blocked by the browser): the choice lasts until reload.
    }
  }

  private initialIsDark(): boolean {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage is unavailable: fall back to the OS setting.
    }
    if (saved) {
      return saved === 'dark';
    }
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
