const cron = require('node-cron');
const pmAgent = require('../agents/pmAgent');
const veraAgent = require('../agents/veraAgent');

let isPmTickRunning = false;

function initSchedulers() {
  console.log("⏰ Starting AI Agent CRON Schedulers...");

  // Project Manager Agent runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    if (isPmTickRunning) {
      console.log("⏰ Task Skipped: Previous PMAgent.tick() is still evaluating Neural parameters.");
      return;
    }
    isPmTickRunning = true;
    try {
      console.log("⏰ Task Fired: PMAgent.tick()");
      await pmAgent.tick();
    } catch (e) {
      console.error("PMAgent Failed on Schedule", e);
    } finally {
      isPmTickRunning = false;
    }
  });

  // Vera Sharp runs every day at 17:00 (5:00 PM) Server Time
  cron.schedule('0 17 * * *', async () => {
    try {
      console.log("⏰ Task Fired: VeraAgent.runDailyReport()");
      await veraAgent.runDailyReport();
    } catch (e) {
      console.error("VeraAgent Failed on Schedule", e);
    }
  });

  console.log("⏰ Schedulers successfully bound.");
}

module.exports = { initSchedulers };
