/**
 * Ranker Engine - Computes composite scores for flights based on user customizable weights.
 */

export const MOCK_FLIGHTS = [
  {
    id: 'FL-101',
    airline: 'SkyLine Airways',
    flightNo: 'SK-402',
    origin: 'JFK',
    destination: 'LHR',
    priceUSD: 450,
    durationMinutes: 410, // 6h 50m
    co2Kg: 210,
    layovers: 0,
    airlineRating: 4.8,
    badge: 'Fastest & Best Rated'
  },
  {
    id: 'FL-204',
    airline: 'EcoFly Express',
    flightNo: 'EF-891',
    origin: 'JFK',
    destination: 'LHR',
    priceUSD: 380,
    durationMinutes: 520, // 8h 40m
    co2Kg: 145, // Super low emission
    layovers: 1,
    airlineRating: 4.2,
    badge: 'Eco Champion'
  },
  {
    id: 'FL-309',
    airline: 'Global Wings',
    flightNo: 'GW-112',
    origin: 'JFK',
    destination: 'LHR',
    priceUSD: 310, // Cheapest
    durationMinutes: 630, // 10h 30m
    co2Kg: 280,
    layovers: 2,
    airlineRating: 3.9,
    badge: 'Lowest Price'
  },
  {
    id: 'FL-415',
    airline: 'AeroLux Business',
    flightNo: 'AL-007',
    origin: 'JFK',
    destination: 'LHR',
    priceUSD: 620,
    durationMinutes: 400,
    co2Kg: 230,
    layovers: 0,
    airlineRating: 4.9,
    badge: 'Premium Comfort'
  }
];

export class RankerEngine {
  /**
   * Score flights using a normalized multi-criteria weighted sum model.
   * Higher composite score = better rank (100 is max score).
   */
  static calculateScores(flights, weights) {
    const totalWeight = (weights.price + weights.duration + weights.emissions + weights.layovers + weights.rating) || 100;

    // Find min and max for normalization
    const prices = flights.map(f => f.priceUSD);
    const durations = flights.map(f => f.durationMinutes);
    const emissions = flights.map(f => f.co2Kg);
    const layovers = flights.map(f => f.layovers);
    const ratings = flights.map(f => f.airlineRating);

    const minPrice = Math.min(...prices), maxPrice = Math.max(...prices);
    const minDuration = Math.min(...durations), maxDuration = Math.max(...durations);
    const minCo2 = Math.min(...emissions), maxCo2 = Math.max(...emissions);
    const minLayover = Math.min(...layovers), maxLayover = Math.max(...layovers);
    const minRating = Math.min(...ratings), maxRating = Math.max(...ratings);

    return flights.map(flight => {
      // Normalize values (0 to 1 where 1 is best)
      const priceScore = maxPrice === minPrice ? 1 : (maxPrice - flight.priceUSD) / (maxPrice - minPrice);
      const durationScore = maxDuration === minDuration ? 1 : (maxDuration - flight.durationMinutes) / (maxDuration - minDuration);
      const emissionScore = maxCo2 === minCo2 ? 1 : (maxCo2 - flight.co2Kg) / (maxCo2 - minCo2);
      const layoverScore = maxLayover === minLayover ? 1 : (maxLayover - flight.layovers) / (maxLayover - minLayover);
      const ratingScore = maxRating === minRating ? 1 : (flight.airlineRating - minRating) / (maxRating - minRating);

      // Calculate weighted sum score out of 100
      const score = (
        (priceScore * weights.price) +
        (durationScore * weights.duration) +
        (emissionScore * weights.emissions) +
        (layoverScore * weights.layovers) +
        (ratingScore * weights.rating)
      ) / totalWeight * 100;

      return {
        ...flight,
        score: Math.round(score * 10) / 10,
        breakdown: {
          price: Math.round(priceScore * 100),
          duration: Math.round(durationScore * 100),
          emissions: Math.round(emissionScore * 100),
          layovers: Math.round(layoverScore * 100),
          rating: Math.round(ratingScore * 100)
        }
      };
    }).sort((a, b) => b.score - a.score);
  }
}
