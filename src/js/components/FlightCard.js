import { store } from '../services/store.js';

export function createFlightCard(flight) {
  const { comparisonList, bookmarks } = store.getState();
  const isCompared = comparisonList.includes(flight.id);
  const isBookmarked = bookmarks.includes(flight.id);

  const depTime = new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrTime = new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const hours = Math.floor(flight.durationMinutes / 60);
  const mins = flight.durationMinutes % 60;

  const card = document.createElement('div');
  card.className = 'flight-card';
  card.id = `flight-card-${flight.id}`;

  card.innerHTML = `
    <div class="score-badge" title="FlyRank Multi-Criteria Composite Score">
      <span class="score-num">${flight.score}</span>
      <span class="score-label">FlyScore</span>
    </div>

    <div class="flight-main-info">
      <div class="airline-row">
        <div class="airline-logo">${flight.airline.charAt(0)}</div>
        <div>
          <div class="airline-name">${flight.airline} <span style="font-size:0.85rem; color:var(--text-muted);">(${flight.flightNumber})</span></div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">★ ${flight.rating} / 5.0</div>
        </div>
      </div>

      <div class="timeline-row">
        <div class="time-box">
          <div class="time-val">${depTime}</div>
          <div class="city-val">${flight.origin} (${flight.originCity})</div>
        </div>

        <div class="flight-duration-bar">
          <span class="dur-text">${hours}h ${mins}m</span>
          <div class="line-visual"></div>
          <span class="dur-text">${flight.layovers === 0 ? 'Direct' : `${flight.layovers} stop`}</span>
        </div>

        <div class="time-box">
          <div class="time-val">${arrTime}</div>
          <div class="city-val">${flight.destination} (${flight.destinationCity})</div>
        </div>
      </div>

      <div class="flight-meta-tags">
        ${flight.co2EmissionsKg <= 250 ? `<span class="tag tag-eco">🌱 Low CO2 (${flight.co2EmissionsKg} kg)</span>` : `<span class="tag" style="background:rgba(255,255,255,0.05); color:var(--text-muted);">${flight.co2EmissionsKg} kg CO2</span>`}
        ${flight.layovers === 0 ? '<span class="tag tag-layover">⚡ Non-Stop</span>' : ''}
        <span class="tag" style="background:var(--bg-surface); color:var(--text-secondary); border:1px solid var(--border-color);">${flight.cabinClass}</span>
      </div>
    </div>

    <div class="flight-pricing">
      <div class="price-val">$${flight.price}</div>
      <div class="price-sub">per passenger</div>
      <div class="card-actions">
        <button type="button" class="btn btn-secondary btn-icon-only toggle-bookmark" title="Bookmark flight">
          ${isBookmarked ? '❤️' : '🤍'}
        </button>
        <button type="button" class="btn btn-secondary toggle-compare">
          <input type="checkbox" ${isCompared ? 'checked' : ''} pointer-events="none" />
          <span>Compare</span>
        </button>
      </div>
    </div>
  `;

  // Bind internal event listeners
  const bookmarkBtn = card.querySelector('.toggle-bookmark');
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    store.toggleBookmark(flight.id);
  });

  const compareBtn = card.querySelector('.toggle-compare');
  compareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    store.toggleComparison(flight.id);
  });

  return card;
}
