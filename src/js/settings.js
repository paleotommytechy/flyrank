/**
 * Settings UI Controller - Manages tabs, form synchronization, weight visualizers,
 * live preview rank recalculation, export/import modal, and toasts.
 */

import { settingsStore } from './settings-store.js';
import { ThemeManager } from './theme.js';
import { RankerEngine, MOCK_FLIGHTS } from './ranker.js';

export class SettingsController {
  static init() {
    this.bindTabNavigation();
    this.bindFormInputs();
    this.bindWeightSliders();
    this.bindAccentPickers();
    this.bindActionButtons();
    this.bindModalEvents();
    
    // Initial UI Population from Store
    this.populateFormFromStore();
    this.updateWeightVisualizer();
    this.renderLiveRankPreview();

    // Theme setup
    ThemeManager.init();
  }

  static bindTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.settings-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPanel = document.getElementById(`panel-${targetId}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  static populateFormFromStore() {
    const all = settingsStore.getAll();

    // Scoring weights
    for (const [key, val] of Object.entries(all.scoringWeights)) {
      const slider = document.getElementById(`weight-${key}`);
      const valDisplay = document.getElementById(`val-${key}`);
      if (slider) slider.value = val;
      if (valDisplay) valDisplay.textContent = `${val}%`;
    }

    // Display
    this.setInputValue('display-currency', all.display.currency);
    this.setInputValue('display-distance', all.display.distanceUnit);
    this.setInputValue('display-emissions', all.display.emissionsUnit);
    this.setInputValue('display-timeformat', all.display.timeFormat);

    // Appearance
    this.setInputValue('appearance-theme', all.appearance.theme);
    this.setInputValue('appearance-density', all.appearance.viewDensity);
    this.setCheckedValue('appearance-motion', all.appearance.reduceMotion);
    this.setActiveAccentSwatch(all.appearance.accentColor);

    // Search Defaults
    this.setInputValue('default-cabin', all.searchDefaults.cabinClass);
    this.setInputValue('default-layovers', all.searchDefaults.maxLayovers);
    this.setCheckedValue('default-direct', all.searchDefaults.directOnly);
    this.setCheckedValue('default-refundable', all.searchDefaults.refundableOnly);

    // Notifications
    this.setCheckedValue('notif-price-alerts', all.notifications.priceAlerts);
    this.setInputValue('notif-price-threshold', all.notifications.priceThreshold);
    this.setCheckedValue('notif-eco-badges', all.notifications.ecoBadges);
    this.setCheckedValue('notif-low-emissions', all.notifications.lowEmissionAlerts);
    this.setCheckedValue('notif-email-push', all.notifications.emailPush);

    // Privacy
    this.setCheckedValue('privacy-history', all.privacy.saveSearchHistory);
    this.setCheckedValue('privacy-analytics', all.privacy.analyticsOptIn);
  }

  static bindFormInputs() {
    // Selects and text/number inputs
    const inputs = [
      { id: 'display-currency', path: 'display.currency' },
      { id: 'display-distance', path: 'display.distanceUnit' },
      { id: 'display-emissions', path: 'display.emissionsUnit' },
      { id: 'display-timeformat', path: 'display.timeFormat' },
      { id: 'appearance-theme', path: 'appearance.theme', callback: (v) => ThemeManager.applyTheme(v) },
      { id: 'appearance-density', path: 'appearance.viewDensity' },
      { id: 'appearance-motion', path: 'appearance.reduceMotion', isCheckbox: true },
      { id: 'default-cabin', path: 'searchDefaults.cabinClass' },
      { id: 'default-layovers', path: 'searchDefaults.maxLayovers' },
      { id: 'default-direct', path: 'searchDefaults.directOnly', isCheckbox: true },
      { id: 'default-refundable', path: 'searchDefaults.refundableOnly', isCheckbox: true },
      { id: 'notif-price-alerts', path: 'notifications.priceAlerts', isCheckbox: true },
      { id: 'notif-price-threshold', path: 'notifications.priceThreshold', isNumber: true },
      { id: 'notif-eco-badges', path: 'notifications.ecoBadges', isCheckbox: true },
      { id: 'notif-low-emissions', path: 'notifications.lowEmissionAlerts', isCheckbox: true },
      { id: 'notif-email-push', path: 'notifications.emailPush', isCheckbox: true },
      { id: 'privacy-history', path: 'privacy.saveSearchHistory', isCheckbox: true },
      { id: 'privacy-analytics', path: 'privacy.analyticsOptIn', isCheckbox: true }
    ];

    inputs.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        const eventType = item.isCheckbox ? 'change' : 'input';
        el.addEventListener(eventType, () => {
          let val = item.isCheckbox ? el.checked : el.value;
          if (item.isNumber) val = Number(val);
          settingsStore.set(item.path, val);
          if (item.callback) item.callback(val);
          this.showToast('Setting updated', 'info');
        });
      }
    });
  }

  static bindWeightSliders() {
    const keys = ['price', 'duration', 'emissions', 'layovers', 'rating'];

    keys.forEach(key => {
      const slider = document.getElementById(`weight-${key}`);
      const valDisplay = document.getElementById(`val-${key}`);

      if (slider) {
        slider.addEventListener('input', () => {
          const val = parseInt(slider.value, 10);
          if (valDisplay) valDisplay.textContent = `${val}%`;

          settingsStore.set(`scoringWeights.${key}`, val);
          this.updateWeightVisualizer();
          this.renderLiveRankPreview();
        });
      }
    });
  }

  static updateWeightVisualizer() {
    const weights = settingsStore.get('scoringWeights');
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 100;

    for (const [key, val] of Object.entries(weights)) {
      const pct = Math.round((val / total) * 100);
      const bar = document.querySelector(`.bar-${key}`);
      const legendPct = document.getElementById(`pct-${key}`);

      if (bar) bar.style.width = `${pct}%`;
      if (legendPct) legendPct.textContent = `${pct}%`;
    }

    const totalDisplay = document.getElementById('total-weight-display');
    if (totalDisplay) {
      totalDisplay.textContent = `Total weight ratio: ${total} points`;
    }
  }

  static renderLiveRankPreview() {
    const container = document.getElementById('rank-preview-list');
    if (!container) return;

    const weights = settingsStore.get('scoringWeights');
    const ranked = RankerEngine.calculateScores(MOCK_FLIGHTS, weights);

    container.innerHTML = ranked.map((flight, idx) => `
      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; transition: transform 0.2s;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${idx === 0 ? 'var(--primary)' : 'var(--bg-base)'}; color: ${idx === 0 ? '#fff' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">
            #${idx + 1}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">${flight.airline} (${flight.flightNo})</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">$${flight.priceUSD} • ${Math.floor(flight.durationMinutes / 60)}h ${flight.durationMinutes % 60}m • ${flight.co2Kg}kg CO₂</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; color: var(--primary);">${flight.score}<span style="font-size: 0.75rem; font-weight: 400;">/100</span></div>
          <div style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 500;">${flight.badge}</div>
        </div>
      </div>
    `).join('');
  }

  static bindAccentPickers() {
    const swatches = document.querySelectorAll('.accent-option');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        settingsStore.set('appearance.accentColor', color);
        ThemeManager.applyAccent(color);
        this.setActiveAccentSwatch(color);
        this.showToast(`Accent color changed to ${color}`, 'info');
      });
    });
  }

  static setActiveAccentSwatch(color) {
    const swatches = document.querySelectorAll('.accent-option');
    swatches.forEach(s => {
      if (s.getAttribute('data-color') === (color || 'blue')) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  static bindActionButtons() {
    const saveBtn = document.getElementById('btn-save-all');
    const resetBtn = document.getElementById('btn-reset-defaults');
    const exportBtn = document.getElementById('btn-export-json');
    const importBtn = document.getElementById('btn-import-json');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        settingsStore.saveSettings();
        this.showToast('All settings saved successfully!', 'success');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to factory defaults?')) {
          settingsStore.resetToDefaults();
          this.populateFormFromStore();
          this.updateWeightVisualizer();
          this.renderLiveRankPreview();
          ThemeManager.applyTheme(settingsStore.get('appearance.theme'));
          ThemeManager.applyAccent(settingsStore.get('appearance.accentColor'));
          this.showToast('Settings reset to default values', 'warning');
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonText = settingsStore.exportJSON();
        const textarea = document.getElementById('export-import-textarea');
        if (textarea) textarea.value = jsonText;
        this.openModal('export');
      });
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const textarea = document.getElementById('export-import-textarea');
        if (textarea) textarea.value = '';
        this.openModal('import');
      });
    }
  }

  static bindModalEvents() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');
    const copyBtn = document.getElementById('modal-copy-btn');
    const applyImportBtn = document.getElementById('modal-apply-import-btn');

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', () => this.closeModal());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textarea = document.getElementById('export-import-textarea');
        if (textarea) {
          navigator.clipboard.writeText(textarea.value);
          this.showToast('Configuration copied to clipboard!', 'success');
        }
      });
    }

    if (applyImportBtn) {
      applyImportBtn.addEventListener('click', () => {
        const textarea = document.getElementById('export-import-textarea');
        if (textarea) {
          const res = settingsStore.importJSON(textarea.value);
          if (res.success) {
            this.populateFormFromStore();
            this.updateWeightVisualizer();
            this.renderLiveRankPreview();
            ThemeManager.applyTheme(settingsStore.get('appearance.theme'));
            ThemeManager.applyAccent(settingsStore.get('appearance.accentColor'));
            this.closeModal();
            this.showToast('Imported settings applied successfully!', 'success');
          } else {
            alert(`Invalid JSON settings file: ${res.error}`);
          }
        }
      });
    }
  }

  static openModal(mode) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const copyBtn = document.getElementById('modal-copy-btn');
    const applyImportBtn = document.getElementById('modal-apply-import-btn');

    if (!overlay) return;

    if (mode === 'export') {
      title.textContent = 'Export Configuration JSON';
      if (copyBtn) copyBtn.style.display = 'inline-flex';
      if (applyImportBtn) applyImportBtn.style.display = 'none';
    } else {
      title.textContent = 'Import Configuration JSON';
      if (copyBtn) copyBtn.style.display = 'none';
      if (applyImportBtn) applyImportBtn.style.display = 'inline-flex';
    }

    overlay.classList.add('open');
  }

  static closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  static setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  static setCheckedValue(id, isChecked) {
    const el = document.getElementById(id);
    if (el) el.checked = !!isChecked;
  }

  static showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : 
          type === 'warning' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' :
          '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}
