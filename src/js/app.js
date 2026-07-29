import { store } from './services/store.js';
import { renderSearchForm } from './components/SearchForm.js';
import { renderRankSliderControls } from './components/RankSliderControls.js';
import { createFlightCard } from './components/FlightCard.js';
import { renderComparisonDrawer } from './components/ComparisonDrawer.js';
import { renderThemeToggle } from './components/ThemeToggle.js';

function renderFlightList() {
  const container = document.getElementById('flight-list-container');
  const countText = document.getElementById('results-count-text');
  if (!container) return;

  container.innerHTML = '';
  const { rankedFlights, activeFilter, bookmarks } = store.getState();

  let displayedFlights = rankedFlights;
  if (activeFilter === 'bookmarked') {
    displayedFlights = rankedFlights.filter(f => bookmarks.includes(f.id));
  }

  if (countText) {
    countText.textContent = `${displayedFlights.length} Flight${displayedFlights.length !== 1 ? 's' : ''} Ranked`;
  }

  if (displayedFlights.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✈️</div>
        <h3>No flights match your search criteria</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">Try adjusting your route, dates, or filter options.</p>
      </div>
    `;
    return;
  }

  displayedFlights.forEach(flight => {
    const card = createFlightCard(flight);
    container.appendChild(card);
  });
}

function initApp() {
  // Initial Theme sync
  const initialTheme = store.getState().theme;
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Render initial static component slots
  renderThemeToggle('theme-toggle-slot');
  renderSearchForm('search-form-slot');
  renderRankSliderControls('rank-sliders-slot');
  renderComparisonDrawer('comparison-drawer-slot');
  renderFlightList();

  // Filter Pill listeners
  const filterPills = document.querySelectorAll('#filter-pills .pill-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');
      store.setFilter(filter);
    });
  });

  // Store update subscription listener
  store.addEventListener('stateChange', () => {
    renderFlightList();
    renderComparisonDrawer('comparison-drawer-slot');
  });
}

document.addEventListener('DOMContentLoaded', initApp);
