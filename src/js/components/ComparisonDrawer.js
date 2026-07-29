import { store } from '../services/store.js';

export function renderComparisonDrawer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { comparisonList, rankedFlights } = store.getState();
  const comparedFlights = rankedFlights.filter(f => comparisonList.includes(f.id));

  container.innerHTML = `
    <!-- Floating Bottom Comparison Action Bar -->
    <div class="comparison-bar ${comparedFlights.length > 0 ? 'active' : ''}">
      <div>
        <strong style="color:var(--accent-primary);">${comparedFlights.length}</strong> flight(s) selected for side-by-side comparison
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <button type="button" id="btn-open-compare-modal" class="btn btn-primary">
          Compare Side-by-Side 📊
        </button>
        <button type="button" id="btn-clear-compare" class="btn btn-secondary btn-icon-only" title="Clear selection">
          ✖
        </button>
      </div>
    </div>

    <!-- Comparison Modal Overlay -->
    <div id="compare-modal-backdrop" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Side-by-Side Flight Comparison</h2>
          <button type="button" id="btn-close-compare-modal" class="modal-close">✖</button>
        </div>

        <div class="compare-grid">
          ${comparedFlights.map(f => `
            <div class="compare-col">
              <div style="font-size:1.4rem; font-weight:900; color:var(--accent-primary); margin-bottom:0.5rem;">
                FlyScore: ${f.score} / 100
              </div>
              <h3 style="font-size:1.1rem;">${f.airline}</h3>
              <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">${f.flightNumber}</div>

              <div class="compare-feature">
                <span>Price</span>
                <strong>$${f.price}</strong>
              </div>
              <div class="compare-feature">
                <span>Duration</span>
                <strong>${Math.floor(f.durationMinutes / 60)}h ${f.durationMinutes % 60}m</strong>
              </div>
              <div class="compare-feature">
                <span>CO2 Emissions</span>
                <strong>${f.co2EmissionsKg} kg</strong>
              </div>
              <div class="compare-feature">
                <span>Layovers</span>
                <strong>${f.layovers === 0 ? 'Direct' : `${f.layovers} Stop(s)`}</strong>
              </div>
              <div class="compare-feature">
                <span>Airline Rating</span>
                <strong>★ ${f.rating} / 5.0</strong>
              </div>

              <div style="margin-top:1.25rem; font-size:0.85rem;">
                <div style="font-weight:700; margin-bottom:0.5rem; color:var(--text-secondary);">Score Breakdown:</div>
                <div style="display:flex; flex-direction:column; gap:0.25rem;">
                  <small>Price score: ${f.scoreBreakdown.priceScore}/100</small>
                  <small>Speed score: ${f.scoreBreakdown.durationScore}/100</small>
                  <small>Eco score: ${f.scoreBreakdown.co2Score}/100</small>
                  <small>Comfort score: ${f.scoreBreakdown.ratingScore}/100</small>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  const openBtn = document.getElementById('btn-open-compare-modal');
  const closeBtn = document.getElementById('btn-close-compare-modal');
  const clearBtn = document.getElementById('btn-clear-compare');
  const modal = document.getElementById('compare-modal-backdrop');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => store.clearComparison());
  }
}
