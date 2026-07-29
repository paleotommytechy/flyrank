import { describe, it, expect } from 'vitest';
import { rankFlights, DEFAULT_WEIGHTS, PRESET_WEIGHTS } from '../src/js/services/ranker.js';

const sampleFlights = [
  {
    id: "f1",
    airline: "Airline A",
    price: 100,
    durationMinutes: 100,
    co2EmissionsKg: 100,
    layovers: 0,
    rating: 5.0
  },
  {
    id: "f2",
    airline: "Airline B",
    price: 500,
    durationMinutes: 500,
    co2EmissionsKg: 500,
    layovers: 2,
    rating: 1.0
  }
];

describe('FlyRank Ranking Algorithm (ranker.js)', () => {
  it('should rank optimal flight first under balanced weights', () => {
    const ranked = rankFlights(sampleFlights, DEFAULT_WEIGHTS);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].id).toBe('f1');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it('should compute scores between 0 and 100', () => {
    const ranked = rankFlights(sampleFlights, DEFAULT_WEIGHTS);
    ranked.forEach(flight => {
      expect(flight.score).toBeGreaterThanOrEqual(0);
      expect(flight.score).toBeLessThanOrEqual(100);
      expect(flight.scoreBreakdown).toBeDefined();
    });
  });

  it('should score cheapest flight highest when price weight dominates', () => {
    const cheapestPreset = PRESET_WEIGHTS.cheapest;
    const ranked = rankFlights(sampleFlights, cheapestPreset);
    expect(ranked[0].id).toBe('f1');
    expect(ranked[0].scoreBreakdown.priceScore).toBe(100);
    expect(ranked[1].scoreBreakdown.priceScore).toBe(0);
  });

  it('should handle empty flight array gracefully', () => {
    const ranked = rankFlights([], DEFAULT_WEIGHTS);
    expect(ranked).toEqual([]);
  });
});
