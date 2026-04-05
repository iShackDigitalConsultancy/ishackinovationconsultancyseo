require('dotenv').config();
const semrushService = require('./services/semrushService');

async function run() {
  console.log("Testing SEMRush integration for apple.com locally...");
  try {
    const data = await semrushService.getDomainOrganicKeywords('apple.com', 'us', 10);
    console.log("=== API RESPONSE ===");
    console.log(data);
    console.log("=== END API RESPONSE ===");
  } catch(e) {
    console.error("Test failed:", e);
  }
}

run();
