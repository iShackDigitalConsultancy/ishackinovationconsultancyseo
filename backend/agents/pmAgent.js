const db = require('../db');
const asanaService = require('../services/asanaService');
const researchAgent = require('./researchAgent');
const implementationAgent = require('./implementationAgent');
const backlinkAgent = require('./backlinkAgent');
const guruAgent = require('./guruAgent');
const autoResearchAgent = require('./autoResearchAgent');
const analyticsAgent = require('./analyticsAgent');

/**
 * The Orchestrator - Manages the State Machine
 */
class PMAgent {
  async tick() {
    console.log("👔 [PM Agent] Running daily heartbeat orchestrator...");

    const { rows: campaigns } = await db.query("SELECT * FROM campaigns WHERE status = 'active'");
    
    for (const campaign of campaigns) {
      console.log(`👔 [PM Agent] Evaluating Campaign: ${campaign.client_domain}`);
      
      // Fetch newest task explicitly
      const { rows: allTasks } = await db.query("SELECT * FROM agent_tasks WHERE campaign_id = $1 ORDER BY created_at DESC", [campaign.id]);
      
      if (allTasks.length === 0) {
        console.log(`👔 [PM Agent] Campaign empty. Initiating Phase 1: Research.`);
        const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;
        const asanaTaskGid = await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Keyword Research Mapping`, 'Analyze competitors and map keywords', 'ResearchAgent');
        
        await db.query(`
          INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type, payload)
          VALUES ($1, $2, $3, $4)
        `, [campaign.id, 'ResearchAgent', 'Phase 1: Keyword Research', JSON.stringify({ domain: campaign.client_domain, asanaTaskGid, target_territory: campaign.target_territory })]);
        continue;
      }

      const activeTask = allTasks[0]; // Most recent task in sequence

      if (activeTask.status === 'pending') {
        // EXECUTION PHASE
        console.log(`👔 [PM Agent] Executing assigned logic for ${activeTask.assigned_agent}...`);

        if (activeTask.assigned_agent === 'ResearchAgent') {
          await researchAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
        } else if (activeTask.assigned_agent === 'ImplementationAgent') {
          await implementationAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
        } else if (activeTask.assigned_agent === 'BacklinkAgent') {
          await backlinkAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
        } else if (activeTask.assigned_agent === 'GuruAgent') {
          await guruAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
        } else if (activeTask.assigned_agent === 'AutoResearchAgent') {
          await autoResearchAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
        } else if (activeTask.assigned_agent === 'AnalyticsAgent') {
          // Analytics Agent doesn't require a payload mapped from prior nodes
          await analyticsAgent.executeTask(campaign.id, campaign.client_domain);
          // And automatically complete it since its solely querying telemetry
          await db.query(`UPDATE agent_tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`, [activeTask.id]);
        }
      } 
      else if (activeTask.status === 'awaiting_approval') {
        console.log(`👔 [PM Agent] Campaign paused. Awaiting manual human approval for ${activeTask.task_type}.`);
      }
      else if (activeTask.status === 'completed') {
        // PROGRESSION PHASE (Determine Next Step)
        const tierName = campaign.package_tier || 'basic';
        const { rows: pkgs } = await db.query("SELECT max_ai_phase FROM packages WHERE tier_name = $1", [tierName.toLowerCase()]);
        const max_ai_phase = pkgs.length > 0 ? pkgs[0].max_ai_phase : 2;

        const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;

        if (activeTask.task_type.includes('Phase 1')) {
          console.log(`👔 [PM Agent] Phase 1 Approved. Assigning Phase 2 to ImplementationAgent.`);
          await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Write Onsite Tags`, 'Using the new keywords, write the title tags.', 'ImplementationAgent');
          await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type, payload) VALUES ($1, $2, $3, $4)`, 
            [campaign.id, 'ImplementationAgent', 'Phase 2: Onsite Implementation', activeTask.result_payload]);

        } else if (activeTask.task_type.includes('Phase 2')) {
          if (max_ai_phase < 3) {
            console.log(`👔 [PM Agent] Max AI limits reached. Marking campaign finished.`);
            await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
          } else {
            console.log(`👔 [PM Agent] Escalating to Phase 3 Backlinking for ${campaign.client_domain}.`);
            await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Backlink Procurement`, 'Generate 5 high DR link targets and an outreach email.', 'BacklinkAgent');
            await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type, payload) VALUES ($1, $2, $3, $4)`, 
              [campaign.id, 'BacklinkAgent', 'Phase 3: Offsite Link Building Outreach', activeTask.result_payload]);
          }

        } else if (activeTask.task_type.includes('Phase 3')) {
          if (max_ai_phase < 4) {
            console.log(`👔 [PM Agent] Max AI limits reached. Marking campaign finished.`);
            await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
          } else {
            console.log(`👔 [PM Agent] Escalating to Phase 4 Guru Audit for ${campaign.client_domain}.`);
            await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Enterprise Guru Audit`, 'Perform historical RAG audit against iShack guidelines.', 'GuruAgent');
            await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type) VALUES ($1, $2, $3)`, 
              [campaign.id, 'GuruAgent', 'Phase 4: RAG Expert Audit']);
          }

        } else if (activeTask.task_type.includes('Phase 4')) {
          if (max_ai_phase < 5) {
            await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
          } else {
            console.log(`👔 [PM Agent] Escalating to Phase 5: Autonomous ML Optimization for ${campaign.client_domain}.`);
            await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] PyTorch Model Optimization (AutoResearch)`, 'Spawn Karpathy AutoResearch loop for 5-minute training epoch analysis.', 'AutoResearchAgent');
            await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type) VALUES ($1, $2, $3)`, 
              [campaign.id, 'AutoResearchAgent', 'Phase 5: Autonomous ML Parameter Iteration']);
          }

        } else if (activeTask.task_type.includes('Phase 5')) {
          if (max_ai_phase < 6) {
            await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
          } else {
            console.log(`👔 [PM Agent] ML Optimization completed for ${campaign.client_domain}. Triggering SEMrush Telemetry.`);
            await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type) VALUES ($1, $2, $3)`, 
              [campaign.id, 'AnalyticsAgent', 'Phase 6: Live Data Hooked to SEMrush']);
          }

        } else if (activeTask.task_type.includes('Phase 6')) {
          if (max_ai_phase < 7) {
            console.log(`👔 [PM Agent] SEMrush Telemetry successfully mapped. Flow completed for ${campaign.client_domain}.`);
            await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
          } else {
            console.log(`👔 [PM Agent] Entering Continuous Autonomous Loop (Phase 7+) for ${campaign.client_domain}.`);
             await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Continuous Growth Advisory`, 'Research new AEO/SEO techniques and identify progression mechanics.', 'ResearchAgent');
             await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type) VALUES ($1, $2, $3)`, 
               [campaign.id, 'ResearchAgent', 'Phase 7: Continuous Optimization Advisory']);
             await db.query("UPDATE campaigns SET status = 'optimizing' WHERE id = $1", [campaign.id]);
          }
          
        } else if (activeTask.task_type.includes('Phase 7')) {
            console.log(`👔 [PM Agent] Advisory Loop Complete. Queuing Implementation of New Techniques.`);
            await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Rollout New Advised Techniques`, 'Deploy newfound AEO/SEO strategies onsite.', 'ImplementationAgent');
            await db.query(`INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type, payload) VALUES ($1, $2, $3, $4)`, 
               [campaign.id, 'ImplementationAgent', 'Phase 8: Continuous Action Pipeline', activeTask.result_payload]);
               
        } else if (activeTask.task_type.includes('Phase 8') || activeTask.task_type.includes('Ad-Hoc')) {
            // Drop back into optimizing status where it will hang until SuperAdmin manually triggers another check
            await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
        }
      }
    }
  }
}

module.exports = new PMAgent();
