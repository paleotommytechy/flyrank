import { store } from '../services/store.js';
import { PRESET_WEIGHTS } from '../services/ranker.js';

export function renderRankSliderControls(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const weights = store.getState().weights;

  container.innerHTML = `
    <div class="ranker-section">
      <div class="ranker-header">
        <div class="ranker-title">
          <span>⚙️ Multi-Criteria Weight Preferences</span>
        </div>
        <div class="preset-pills">
          <button type="button" class="pill-btn" data-preset="balanced">Balanced</button>
          <button type="button" class="pill-btn" data-preset="cheapest">Cheapest</button>
          <button type="button" class="pill-btn" data-preset="fastest">Fastest</button>
          <button type="button" class="pill-btn" data-preset="greenest">Greenest (Low CO2)</button>
        </div>
      </div>

      <div class="sliders-grid">
        <div class="slider-card">
          <div class="slider-label-row">
            <span>Price Weight</span>
            <span class="weight-val" id="val-price">${weights.price}%</span>
          </div>
          <input type="range" id="slider-price" min="0" max="100" value="${weights.price}" aria-label="Price Weight" />
        </div>

        <div class="slider-card">
          <div class="slider-label-row">
            <span>Speed / Duration</span>
            <span class="weight-val" id="val-duration">${weights.duration}%</span>
          </div>
          <input type="range" id="slider-duration" min="0" max="100" value="${weights.duration}" aria-label="Speed and Duration Weight" />
        </div>

        <div class="slider-card">
          <div class="slider-label-row">
            <span>Eco / CO2 Footprint</span>
            <span class="weight-val" id="val-co2">${weights.co2}%</span>
          </div>
          <input type="range" id="slider-co2" min="0" max="100" value="${weights.co2}" aria-label="Eco CO2 Footprint Weight" />
        </div>

        <div class="slider-card">
          <div class="slider-label-row">
            <span>Direct Flight (Layovers)</span>
            <span class="weight-val" id="val-layovers">${weights.layovers}%</span>
          </div>
          <input type="range" id="slider-layovers" min="0" max="100" value="${weights.layovers}" aria-label="Direct Flight Layovers Weight" />
        </div>

        <div class="slider-card">
          <div class="slider-label-row">
            <span>Airline Rating</span>
            <span class="weight-val" id="val-rating">${weights.rating}%</span>
          </div>
          <input type="range" id="slider-rating" min="0" max="100" value="${weights.rating}" aria-label="Airline Rating Weight" />
        </div>
      </div>
    </div>
  `;

  // Attach slider input listeners
  const keys = ['price', 'duration', 'co2', 'layovers', 'rating'];
  keys.forEach(key => {
    const slider = document.getElementById(`slider-${key}`);
    const valText = document.getElementById(`val-${key}`);

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (valText) valText.textContent = `${val}%`;
        store.setWeights({ [key]: val });
      });
    }
  });

  // Preset button click listeners
  container.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (PRESET_WEIGHTS[presetKey]) {
        store.setWeights(PRESET_WEIGHTS[presetKey]);

        // Sync slider positions UI
        const newW = PRESET_WEIGHTS[presetKey];
        keys.forEach(k => {
          const s = document.getElementById(`slider-${k}`);
          const v = document.getElementById(`val-${k}`);
          if (s) s.value = newW[k];
          if (v) v.textContent = `${newW[k]}%`;
        });
      }
    });
  });
}
