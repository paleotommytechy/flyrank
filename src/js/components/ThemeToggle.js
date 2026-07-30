import { store } from '../services/store.js';

export function renderThemeToggle(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentTheme = store.getState().theme;

  container.innerHTML = `
    <button type="button" id="btn-theme-toggle" class="btn btn-secondary btn-icon-only" title="Toggle Light/Dark Theme" aria-label="Switch between light and dark theme">
      <span id="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  `;

  const btn = document.getElementById('btn-theme-toggle');
  btn.addEventListener('click', () => {
    const nextTheme = store.getState().theme === 'dark' ? 'light' : 'dark';
    store.setTheme(nextTheme);
  });
}
