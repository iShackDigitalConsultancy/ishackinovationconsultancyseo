const cron = require('node-cron');
const pmAgent = require('../agents/pmAgent');
const veraAgent = require('../agents/veraAgent');
const autoSeoAgent = require('../agents/autoSeoAgent');
const qaAgent = require('../agents/qaAgent');
const outreachAgent = require('../agents/outreachAgent');
const growthAgent = require('../agents/growthAgent');
const uxAgent = require('../agents/uxAgent');

let isPmTickRunning = false;
let isOutreachTickRunning = false;

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

  // Autonomous Prospecting / Outreach Subroutine -- Runs every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    if (isOutreachTickRunning) return;
    isOutreachTickRunning = true;
    
    console.log('--- [CRON] Starting Autonomous Outreach Prospecting Cycle ---');
    await outreachAgent.runBacklinkEngine();
    console.log('--- [CRON] Outreach Prospecting Cycle Complete ---\n');
    
    isOutreachTickRunning = false;
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

  // Auto SEO Agent runs weekly on Sunday at Midnight Server Time
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log("⏰ Task Fired: autoSeoAgent.runWeeklyResearch()");
      await autoSeoAgent.runWeeklyResearch();
    } catch (e) {
      console.error("AutoSeoAgent Failed on Schedule", e);
    }
  });

  // Self-Healing QA Agent runs at the bottom of every hour (XX:30) to map structural platform UX degradation natively
  cron.schedule('30 * * * *', async () => {
    try {
      console.log("⏰ Task Fired: qaAgent.runHealthCheck()");
      await qaAgent.runHealthCheck('https://ishackaeo.com');
    } catch (e) {
      console.error("QAAgent Failed on Schedule", e);
    }
  });

  // AutoResearch: Growth Agent runs twice a day to dynamically split-test copy
  cron.schedule('0 9,21 * * *', async () => {
    try {
      console.log("⏰ Task Fired: growthAgent.runGrowthLoop()");
      await growthAgent.runGrowthLoop();
    } catch (e) {
      console.error("GrowthAgent Failed on Schedule", e);
    }
  });

  // AutoResearch: UX Agent runs daily at Midnight to hotfix interface friction
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log("⏰ Task Fired: uxAgent.runUXOptimization()");
      await uxAgent.runUXOptimization();
    } catch (e) {
      console.error("UXAgent Failed on Schedule", e);
    }
  });

  console.log("⏰ Schedulers successfully bound.");
}

module.exports = { initSchedulers };
