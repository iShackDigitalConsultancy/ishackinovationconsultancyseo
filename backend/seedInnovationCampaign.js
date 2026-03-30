const db = require('./db');
const asanaService = require('./services/asanaService');
const pmAgent = require('./agents/pmAgent');

(async () => {
  try {
    console.log("🚀 Seeding Innovation Consultancy Master Campaign...");

    const domain = 'ishackaeo.com';
    const asanaProjectGid = process.env.ASANA_PROJECT_GID; // or create a new one

    // 1. Get Agency ID
    const agencyRes = await db.query('SELECT id FROM agencies LIMIT 1');
    const agencyId = agencyRes.rows.length > 0 ? agencyRes.rows[0].id : 1;

    // 2. Insert Campaign
    const { rows } = await db.query(`
      INSERT INTO campaigns (agency_id, client_domain, package_tier, status) 
      VALUES ($1, $2, 'enterprise', 'active') 
      RETURNING id
    `, [agencyId, domain]);
    
    const campaignId = rows[0].id;
    console.log(`✅ Queued iShack AEO and SEO partner services Campaign ID: ${campaignId}`);

    // 3. Draft The Intelligent Strategy Payload
    const customPayload = {
      domain: domain,
      targetAudience_1: 'White-Label Agency Resellers looking to outsource SEO services B2B to increase margins.',
      targetAudience_2: 'AI DIY Teams and Businesses trying to replace expensive SEO agencies with autonomous AI Agents.',
      directives: 'Focus purely on transactional SaaS keywords and high-DR Backlinks from B2B directories like Clutch and LinkedIn.'
    };

    // 4. Assign Phase 1 Task to Asana
    const asanaTaskGid = await asanaService.assignTaskToAgent(
      asanaProjectGid, 
      `[${domain}] Keyword Research Mapping (B2B SaaS)`, 
      'Strategize for Resellers & AI Teams.', 
      'ResearchAgent'
    );

    // 5. Inject the Custom Task into the Agent Queue
    await db.query(`
      INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type, payload)
      VALUES ($1, $2, $3, $4)
    `, [campaignId, 'ResearchAgent', 'Phase 1: Deep B2B Strategy Mappings', JSON.stringify({ ...customPayload, asanaTaskGid })]);

    console.log(`🧠 Explicit Strategic Directives injected for OpenClaw Phase 1.`);
    console.log(`⏱️ Triggering Project Manager Orchestrator...`);

    // 6. Force PM Agent Tick
    await pmAgent.tick();

    console.log(`🏁 Campaign Kickoff Initiated! Check the God-Mode CRM or Asana Board!`);
    process.exit(0);

  } catch (e) {
    console.error("Failed to execute master campaign seed:", e.message);
    process.exit(1);
  }
})();
