

    // services/user.service.js

// Tumhara indiaData already loaded hai (require se)

const indiaData = require("../../config/locationData");
const ApiError = require("../apiError");

// console.log("====", indiaData)


// NEW FUNCTION: Validate State & City from JSON
const validateStateAndCity = (stateId, cityName) => {
  // 1. State ID check (string ya number dono chalega)
  const stateExists = indiaData.states.some(s => 
    String(s.id) === String(stateId) || s.id == stateId
  );

  if (!stateExists) {
    throw new ApiError(400, "Invalid State selected");
  }

  // 2. City check — us state ke andar city exist karti hai ya nahi
  const stateKey = String(stateId);
  const validCities = indiaData.city[stateKey] || [];

  // Case-insensitive + trim compare
  const cityExists = validCities.some(city => 
    city.toLowerCase().trim() === cityName?.toLowerCase().trim()
  );

  if (!cityExists) {
    throw new ApiError(400, `Invalid City selected for this state`);
  }

  return true; // Valid hai
};

module.exports = validateStateAndCity;