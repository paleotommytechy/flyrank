/**
 * Search & Input Validation Utilities
 */

export function validateSearchForm(data) {
  const errors = {};

  if (!data.origin || data.origin.trim().length === 0) {
    errors.origin = "Origin airport or city is required";
  }

  if (!data.destination || data.destination.trim().length === 0) {
    errors.destination = "Destination airport or city is required";
  } else if (data.origin && data.origin.trim().toUpperCase() === data.destination.trim().toUpperCase()) {
    errors.destination = "Destination cannot be identical to origin";
  }

  if (!data.departDate) {
    errors.departDate = "Departure date is required";
  }

  if (data.returnDate && data.departDate && new Date(data.returnDate) < new Date(data.departDate)) {
    errors.returnDate = "Return date cannot be earlier than departure date";
  }

  if (data.passengers && (isNaN(data.passengers) || Number(data.passengers) < 1 || Number(data.passengers) > 9)) {
    errors.passengers = "Passengers must be between 1 and 9";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
