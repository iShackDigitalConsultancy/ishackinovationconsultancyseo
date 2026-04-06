const gaService = require('./services/googleAnalyticsService');

async function testGA() {
  console.log("Testing GA Service...");
  const metrics = await gaService.getDashboardMetrics();
  console.log("Returned Metrics:", metrics);
  if (metrics.isSimulation === true && metrics.activeUsers > 0) {
    console.log("SUCCESS: Simulation data working perfectly.");
  } else {
    console.log("FAILED to generate simulation data or handle lack of credentials.");
  }
}

testGA();
