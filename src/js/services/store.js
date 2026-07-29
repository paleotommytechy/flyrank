/**
 * Central State Store for FlyRank using EventTarget
 */
import { DEFAULT_WEIGHTS, rankFlights } from './ranker.js';
import { mockFlights } from '../data/mockFlights.js';

class FlyRankStore extends EventTarget {
  constructor() {
    super();
    this.state = {
      flights: mockFlights,
      weights: { ...DEFAULT_WEIGHTS },
      searchQuery: {
        origin: 'JFK',
        destination: 'LHR',
        departDate: '2026-08-15',
        passengers: 1,
        cabinClass: 'Economy'
      },
      comparisonList: [], // Array of flight IDs
      bookmarks: JSON.parse(localStorage.getItem('flyrank_bookmarks') || '[]'),
      theme: localStorage.getItem('flyrank_theme') || 'dark',
      activeFilter: 'all' // all, eco, direct
    };

    // Initial scoring on load
    this.recalculateRankings();
  }

  getState() {
    return this.state;
  }

  setWeights(newWeights) {
    this.state.weights = { ...this.state.weights, ...newWeights };
    this.recalculateRankings();
    this.emitChange('weights');
  }

  setSearchQuery(query) {
    this.state.searchQuery = { ...this.state.searchQuery, ...query };
    this.filterFlights();
    this.recalculateRankings();
    this.emitChange('searchQuery');
  }

  setFilter(filterName) {
    this.state.activeFilter = filterName;
    this.filterFlights();
    this.recalculateRankings();
    this.emitChange('filter');
  }

  toggleComparison(flightId) {
    const index = this.state.comparisonList.indexOf(flightId);
    if (index >= 0) {
      this.state.comparisonList.splice(index, 1);
    } else {
      if (this.state.comparisonList.length < 3) {
        this.state.comparisonList.push(flightId);
      } else {
        alert("You can compare up to 3 flights simultaneously.");
        return;
      }
    }
    this.emitChange('comparison');
  }

  clearComparison() {
    this.state.comparisonList = [];
    this.emitChange('comparison');
  }

  toggleBookmark(flightId) {
    const index = this.state.bookmarks.indexOf(flightId);
    if (index >= 0) {
      this.state.bookmarks.splice(index, 1);
    } else {
      this.state.bookmarks.push(flightId);
    }
    localStorage.setItem('flyrank_bookmarks', JSON.stringify(this.state.bookmarks));
    this.emitChange('bookmarks');
  }

  setTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('flyrank_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.emitChange('theme');
  }

  filterFlights() {
    let result = [...mockFlights];
    const { origin, destination } = this.state.searchQuery;

    if (origin) {
      result = result.filter(f => f.origin.toLowerCase().includes(origin.toLowerCase()) || f.originCity.toLowerCase().includes(origin.toLowerCase()));
    }
    if (destination) {
      result = result.filter(f => f.destination.toLowerCase().includes(destination.toLowerCase()) || f.destinationCity.toLowerCase().includes(destination.toLowerCase()));
    }

    if (this.state.activeFilter === 'eco') {
      result = result.filter(f => f.co2EmissionsKg <= 250);
    } else if (this.state.activeFilter === 'direct') {
      result = result.filter(f => f.layovers === 0);
    }

    this.state.filteredRaw = result;
  }

  recalculateRankings() {
    const rawList = this.state.filteredRaw || mockFlights;
    this.state.rankedFlights = rankFlights(rawList, this.state.weights);
  }

  emitChange(reason) {
    this.dispatchEvent(new CustomEvent('stateChange', { detail: { reason, state: this.state } }));
  }
}

export const store = new FlyRankStore();
