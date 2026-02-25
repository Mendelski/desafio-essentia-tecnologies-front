import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app_theme';

/**
 * Service responsible for managing application theme.
 * Persists theme preference in localStorage and applies it to the DOM.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    effect(() => {
      this.applyTheme(this.themeSignal());
    });
  }

  /**
   * Toggles between light and dark theme
   */
  toggle(): void {
    this.themeSignal.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  /**
   * Sets a specific theme
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  /**
   * Returns true if dark theme is active
   */
  isDark(): boolean {
    return this.themeSignal() === 'dark';
  }

  private getInitialTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Fallback to system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // localStorage might be unavailable
    }
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage might be full or disabled
    }
  }
}

