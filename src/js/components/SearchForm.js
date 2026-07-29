import { validateSearchForm } from '../services/validator.js';
import { store } from '../services/store.js';

export function renderSearchForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentQuery = store.getState().searchQuery;

  container.innerHTML = `
    <form id="flyrank-search-form" class="search-card" novalidate>
      <div class="search-grid">
        <div class="form-group" id="group-origin">
          <label for="input-origin">From (Airport / City)</label>
          <input type="text" id="input-origin" class="form-control" placeholder="e.g. JFK or New York" value="${currentQuery.origin}" required />
          <span class="form-error" id="error-origin"></span>
        </div>

        <div class="form-group" id="group-destination">
          <label for="input-destination">To (Airport / City)</label>
          <input type="text" id="input-destination" class="form-control" placeholder="e.g. LHR or London" value="${currentQuery.destination}" required />
          <span class="form-error" id="error-destination"></span>
        </div>

        <div class="form-group" id="group-departDate">
          <label for="input-departDate">Depart Date</label>
          <input type="date" id="input-departDate" class="form-control" value="${currentQuery.departDate}" required />
          <span class="form-error" id="error-departDate"></span>
        </div>

        <div class="form-group" id="group-passengers">
          <label for="input-passengers">Passengers</label>
          <select id="input-passengers" class="form-control">
            <option value="1" ${currentQuery.passengers === 1 ? 'selected' : ''}>1 Passenger</option>
            <option value="2" ${currentQuery.passengers === 2 ? 'selected' : ''}>2 Passengers</option>
            <option value="3" ${currentQuery.passengers === 3 ? 'selected' : ''}>3 Passengers</option>
            <option value="4" ${currentQuery.passengers === 4 ? 'selected' : ''}>4+ Passengers</option>
          </select>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 1rem; align-items: center;">
        <button type="submit" id="btn-search-submit" class="btn btn-primary">
          <span>Search Flights</span>
          <span>🔍</span>
        </button>
      </div>
    </form>
  `;

  const form = document.getElementById('flyrank-search-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      origin: document.getElementById('input-origin').value,
      destination: document.getElementById('input-destination').value,
      departDate: document.getElementById('input-departDate').value,
      passengers: parseInt(document.getElementById('input-passengers').value, 10)
    };

    // Reset error styling
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));

    const validation = validateSearchForm(data);
    if (!validation.isValid) {
      Object.keys(validation.errors).forEach(key => {
        const group = document.getElementById(`group-${key}`);
        const errorText = document.getElementById(`error-${key}`);
        if (group && errorText) {
          group.classList.add('has-error');
          errorText.textContent = validation.errors[key];
        }
      });
      return;
    }

    store.setSearchQuery(data);
  });
}
