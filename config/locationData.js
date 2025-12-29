// utils/locationData.js  ← Ye naya file banao
const indiaData = require("../data/india-state-citys.json");

if (!indiaData?.states || !Array.isArray(indiaData.states)) {
  console.error("FATAL: india-state-citys.json not loaded properly!");
  throw new Error("Location data missing!");
}

console.log(`Location Data Loaded: ${indiaData.states.length} states`);

module.exports = indiaData;