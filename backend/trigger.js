const db = require('./db.js');
const pmAgent = require('./agents/pmAgent.js');

(async () => {
   try {
     const { rows } = await db.query('SELECT id FROM agencies LIMIT 1');
     if (rows.length > 0) {
       await db.query("INSERT INTO campaigns (agency_id, client_domain) VALUES ($1, $2)", [rows[0].id, 'ishack.co.za']);
       console.log("✅ Simulation SEO Campaign inserted for: ishack.co.za");
       
       console.log("⚡ Forcing PM Agent to execute Task Identification Protocol...");
       await pmAgent.tick();
       console.log("🚀 Agent Swarm Successfully Initialized.");
     } else {
       console.log("No agencies found in the database. Cannot start campaign.");
     }
   } catch(e) {
     console.error("Execution Failed:", e);
   }
   process.exit(0);
})();
