/**
 * FlyRank Multi-Criteria Ranking Algorithm
 * Calculates normalized scores for flight options based on customizable user preference weights.
 */

export const DEFAULT_WEIGHTS = {
  price: 30,
  duration: 25,
  co2: 20,
  layovers: 15,
  rating: 10
};

export const PRESET_WEIGHTS = {
  cheapest: { price: 70, duration: 10, co2: 5, layovers: 10, rating: 5 },
  fastest: { price: 10, duration: 70, co2: 5, layovers: 10, rating: 5 },
  greenest: { price: 10, duration: 10, co2: 70, layovers: 5, rating: 5 },
  balanced: { price: 30, duration: 25, co2: 20, layovers: 15, rating: 10 }
};

/**
 * Calculates scores and ranks flights based on user weights.
 * @param {Array} flights Array of flight objects
 * @param {Object} weights Importance weight object { price, duration, co2, layovers, rating }
 * @returns {Array} Array of flights extended with score metadata, sorted descending by score.
 */
export function rankFlights(flights, weights = DEFAULT_WEIGHTS) {
  if (!flights || flights.length === 0) return [];

  // Determine min and max boundaries for normalization across dataset
  const bounds = calculateBounds(flights);
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + Number(w || 0), 0) || 1;

  const scoredFlights = flights.map(flight => {
    // Inverse metrics (lower is better: price, duration, CO2, layovers)
    const priceScore = normalizeInverse(flight.price, bounds.minPrice, bounds.maxPrice);
    const durationScore = normalizeInverse(flight.durationMinutes, bounds.minDuration, bounds.maxDuration);
    const co2Score = normalizeInverse(flight.co2EmissionsKg, bounds.minCo2, bounds.maxCo2);
    const layoverScore = normalizeInverse(flight.layovers, bounds.minLayovers, bounds.maxLayovers);

    // Direct metrics (higher is better: rating)
    const ratingScore = normalizeDirect(flight.rating, bounds.minRating, bounds.maxRating);

    // Weighted composite score calculation (0 - 100)
    const compositeScore = (
      (priceScore * (weights.price || 0)) +
      (durationScore * (weights.duration || 0)) +
      (co2Score * (weights.co2 || 0)) +
      (layoverScore * (weights.layovers || 0)) +
      (ratingScore * (weights.rating || 0))
    ) / totalWeight;

    const roundedScore = Math.round(compositeScore * 10) / 10;

    return {
      ...flight,
      score: roundedScore,
      scoreBreakdown: {
        priceScore: Math.round(priceScore),
        durationScore: Math.round(durationScore),
        co2Score: Math.round(co2Score),
        layoverScore: Math.round(layoverScore),
        ratingScore: Math.round(ratingScore)
      }
    };
  });

  // Sort descending by calculated FlyRank score
  return scoredFlights.sort((a, b) => b.score - a.score);
}

function calculateBounds(flights) {
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => f.durationMinutes);
  const co2s = flights.map(f => f.co2EmissionsKg);
  const layovers = flights.map(f => f.layovers);
  const ratings = flights.map(f => f.rating);

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    minCo2: Math.min(...co2s),
    maxCo2: Math.max(...co2s),
    minLayovers: Math.min(...layovers),
    maxLayovers: Math.max(...layovers),
    minRating: Math.min(...ratings),
    maxRating: Math.max(...ratings)
  };
}

/**
 * Normalizes inverse metrics (lower raw value -> higher 0-100 score)
 */
function normalizeInverse(val, min, max) {
  if (max === min) return 100;
  const score = 100 - ((val - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, score));
}

/**
 * Normalizes direct metrics (higher raw value -> higher 0-100 score)
 */
function normalizeDirect(val, min, max) {
  if (max === min) return 100;
  const score = ((val - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, score));
}
