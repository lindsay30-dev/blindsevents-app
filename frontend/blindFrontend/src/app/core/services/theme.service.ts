import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'bigshot-theme';
  isDark = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved !== null) this.isDark.set(saved === 'dark');
    else this.isDark.set(true);
    this.applyTheme();
    effect(() => this.applyTheme());
  }

  toggle() {
    this.isDark.update(v => !v);
    localStorage.setItem(this.STORAGE_KEY, this.isDark() ? 'dark' : 'light');
  }

  private applyTheme() {
    if (this.isDark()) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}