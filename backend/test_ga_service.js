const gaService = require('./services/googleAnalyticsService');

async function testGA() {
  console.log("Testing GA Service...");
  const metrics = await gaService.getDashboardMetrics();
  console.log("Returned Metrics:", metrics);
  if (metrics.isMock === true && metrics.activeUsers > 0) {
    console.log("SUCCESS: Mock data working perfectly.");
  } else {
    console.log("FAILED to generate mock data or handle lack of credentials.");
  }
}

testGA();
