require('dotenv').config();
const db = require('./db');
const analyticsAgent = require('./agents/analyticsAgent');

async function forceGA() {
  console.log("Locating ishackaeo.com...");
  const sel = await db.query("SELECT id FROM campaigns WHERE client_domain = 'ishackaeo.com' LIMIT 1");
  if (sel.rows.length === 0) {
     console.log("Domain not found.");
     process.exit(1);
  }
  
  const id = sel.rows[0].id;
  const propertyId = process.env.GA_PROPERTY_ID || '530530568';
  
  console.log(`Binding GA Property ID ${propertyId} to Campaign ${id}`);
  await db.query("UPDATE campaigns SET ga_property_id = $1 WHERE id = $2", [propertyId, id]);
  
  console.log(`Triggering AnalyticsAgent to extract Dual-Telemetry...`);
  await analyticsAgent.executeTask(id, 'ishackaeo.com');
  
  console.log("Live injection complete. The UI will now display GA metrics over SEMrush.");
  process.exit(0);
}

forceGA().catch(e => {
  console.error("Failed:", e);
  process.exit(1);
});
