/**
 * Theme Manager - Handles theme toggling (dark/light/system sync)
 * and accent color variations.
 */

import { settingsStore } from './settings-store.js';

export class ThemeManager {
  static init() {
    this.applyTheme(settingsStore.get('appearance.theme'));
    this.applyAccent(settingsStore.get('appearance.accentColor'));

    // Listen for system theme changes if set to 'system'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (settingsStore.get('appearance.theme') === 'system') {
        this.applyTheme('system');
      }
    });

    // Listen for setting changes
    window.addEventListener('flyrank:settings-changed', (e) => {
      const { appearance } = e.detail.settings;
      if (appearance) {
        this.applyTheme(appearance.theme);
        this.applyAccent(appearance.accentColor);
      }
    });
  }

  static applyTheme(mode) {
    const root = document.documentElement;
    let targetTheme = mode;

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      targetTheme = prefersDark ? 'dark' : 'light';
    }

    root.setAttribute('data-theme', targetTheme);
  }

  static applyAccent(color) {
    const root = document.documentElement;
    if (color && color !== 'blue') {
      root.setAttribute('data-accent', color);
    } else {
      root.removeAttribute('data-accent');
    }
  }

  static toggle() {
    const current = settingsStore.get('appearance.theme');
    const next = current === 'dark' ? 'light' : 'dark';
    settingsStore.set('appearance.theme', next);
    return next;
  }
}
