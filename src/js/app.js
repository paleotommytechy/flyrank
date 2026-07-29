/**
 * App Main Entry Point
 */

import { ThemeManager } from './theme.js';
import { SettingsController } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
  // Global Theme Initialization
  ThemeManager.init();

  // Header quick theme toggle button
  const themeToggle = document.getElementById('header-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      ThemeManager.toggle();
    });
  }

  // Initialize Settings Page Controller if present
  if (document.getElementById('settings-page')) {
    SettingsController.init();
  }
});
