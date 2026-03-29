const db = require('./db');

(async () => {
  try {
    console.log("🌱 Seeding Native Agency Domain into Database...");

    // 1. Get Agency ID
    const agencyRes = await db.query('SELECT id FROM agencies LIMIT 1');
    const agencyId = agencyRes.rows.length > 0 ? agencyRes.rows[0].id : 1;

    // 2. Insert Campaign
    const { rows } = await db.query(`
      INSERT INTO campaigns (agency_id, client_domain, package_tier, status) 
      VALUES ($1, 'ishack.co.za', 'enterprise', 'active') 
      RETURNING id
    `, [agencyId]);

    console.log(`✅ Successfully queued 'ishack.co.za' as Enterprise Tier! (Campaign ID: ${rows[0].id})`);
    console.log(`The OpenClaw Orchestrator will seamlessly apply AEO (AI Engine Optimization) tactics to this domain.`);
    process.exit(0);

  } catch (e) {
    console.error("Failed to seed iShack domain:", e.message);
    process.exit(1);
  }
})();
