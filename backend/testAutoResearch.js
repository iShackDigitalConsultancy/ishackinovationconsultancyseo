const autoResearchAgent = require('./agents/autoResearchAgent');
const db = require('./db');
require('dotenv').config();

(async () => {
    console.log("==================================================");
    console.log("🧠 INITIATING AUTORESEARCH AI SANDBOX TEST 🧠");
    console.log("==================================================");
    try {
        // 1. Check if Agency 1 exists
        const agencyRes = await db.query('SELECT id FROM agencies LIMIT 1');
        if (agencyRes.rows.length === 0) {
           console.log("No agencies found. Creating a dummy agency...");
           await db.query(`INSERT INTO agencies (agency_name, email, password_hash) VALUES ('Sandbox Agency', 'sandbox@test.com', 'hash')`);
        }
        const agencyId = agencyRes.rows.length > 0 ? agencyRes.rows[0].id : 1;

        // 2. Create a Simulation Campaign for Log attachment
        const { rows } = await db.query(`
            INSERT INTO campaigns (agency_id, client_domain, package_tier, status) 
            VALUES ($1, 'autoresearch-sandbox.ai', 'enterprise', 'active') 
            RETURNING id
        `, [agencyId]);
        
        const campaignId = rows[0].id;
        console.log(`[Sandbox] Generated Virtual Campaign ID: ${campaignId}`);
        console.log(`[Sandbox] Handing off control directly to autoResearchAgent.js...`);
        console.log(`[Sandbox] Evaluated Model Time Budget: ~5 Minutes (Apple MPS)`);
        console.log("--------------------------------------------------\n");
        
        // 3. Trigger Agent
        await autoResearchAgent.executeTask('sandbox_test_task', campaignId, { 
            objective: "Drastically scale DOWN the model architecture for maximum speed during this test epoch. Set `DEPTH = 2` and `TOTAL_BATCH_SIZE = 2**10`. Leave the rest untouched. Return valid Python." 
        });
        
        console.log("\n==================================================");
        console.log("✅ AUTORESEARCH SANDBOX COMPLETE ✅");
        console.log("==================================================");
        process.exit(0);
    } catch(e) {
        console.error("Test Failed: ", e);
        process.exit(1);
    }
})();
