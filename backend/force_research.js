require('dotenv').config();
const db = require('./db');
const analyticsAgent = require('./agents/analyticsAgent');

async function forceRun() {
  console.log("Forcing SEMrush extraction for existing URLs...");
  const campaigns = await db.query("SELECT * FROM campaigns");
  
  for (let c of campaigns.rows) {
     console.log(`Processing: ${c.client_domain} (ID: ${c.id})`);
     await analyticsAgent.executeTask(c.id, c.client_domain);
  }
  
  console.log("Finished semantic data extraction.");
  process.exit(0);
}

forceRun().catch(e => {
  console.error("Force run failed:", e);
  process.exit(1);
});
