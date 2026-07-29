/**
 * SettingsStore - Centralized state manager with LocalStorage persistence
 * and pub/sub event broadcasting.
 */

export const DEFAULT_SETTINGS = {
  scoringWeights: {
    price: 40,
    duration: 25,
    emissions: 15,
    layovers: 10,
    rating: 10
  },
  display: {
    currency: 'USD',
    distanceUnit: 'km',
    emissionsUnit: 'kg',
    timeFormat: '24h'
  },
  appearance: {
    theme: 'dark', // 'dark' | 'light' | 'system'
    accentColor: 'blue', // 'blue' | 'cyan' | 'emerald' | 'purple' | 'rose'
    viewDensity: 'comfortable', // 'comfortable' | 'compact'
    reduceMotion: false
  },
  searchDefaults: {
    cabinClass: 'economy', // 'economy' | 'premium_economy' | 'business' | 'first'
    maxLayovers: 'any', // 'any' | '0' | '1' | '2'
    directOnly: false,
    refundableOnly: false
  },
  notifications: {
    priceAlerts: true,
    priceThreshold: 50, // % drop
    ecoBadges: true,
    lowEmissionAlerts: true,
    emailPush: false
  },
  privacy: {
    saveSearchHistory: true,
    analyticsOptIn: false
  }
};

const STORAGE_KEY = 'flyrank_user_settings_v1';

class SettingsStore {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with default settings to maintain schema compatibility
        return this.deepMerge(DEFAULT_SETTINGS, parsed);
      }
    } catch (e) {
      console.warn('Failed to load settings from LocalStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      window.dispatchEvent(new CustomEvent('flyrank:settings-changed', {
        detail: { settings: this.settings }
      }));
    } catch (e) {
      console.error('Failed to persist settings:', e);
    }
  }

  get(keyPath) {
    const keys = keyPath.split('.');
    let val = this.settings;
    for (const key of keys) {
      if (val && Object.prototype.hasOwnProperty.call(val, key)) {
        val = val[key];
      } else {
        return undefined;
      }
    }
    return val;
  }

  set(keyPath, value) {
    const keys = keyPath.split('.');
    let target = this.settings;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }
    target[keys[keys.length - 1]] = value;
    this.saveSettings();
  }

  getAll() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  resetToDefaults() {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.saveSettings();
    return this.settings;
  }

  exportJSON() {
    return JSON.stringify(this.settings, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.settings = this.deepMerge(DEFAULT_SETTINGS, parsed);
      this.saveSettings();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
}

export const settingsStore = new SettingsStore();
