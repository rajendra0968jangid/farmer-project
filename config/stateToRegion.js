const stateToRegion = require('../data/stateToRegion.json');
const ApiError = require("../utils/apiError");

if(!stateToRegion || typeof stateToRegion !== 'object'){
  throw new ApiError(400, "State to Region mapping data is missing");
}

module.exports = stateToRegion;