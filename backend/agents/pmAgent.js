const db = require('../db');
const asanaService = require('../services/asanaService');
const researchAgent = require('./researchAgent');
const implementationAgent = require('./implementationAgent');
const backlinkAgent = require('./backlinkAgent');
const guruAgent = require('./guruAgent');
const autoResearchAgent = require('./autoResearchAgent');

/**
 * The Orchestrator - Manages the State Machine
 */
class PMAgent {
  async tick() {
    console.log("👔 [PM Agent] Running daily heartbeat orchestrator...");

    // 1. Find all active campaigns
    const { rows: campaigns } = await db.query("SELECT * FROM campaigns WHERE status = 'active'");
    
    for (const campaign of campaigns) {
      console.log(`👔 [PM Agent] Evaluating Campaign: ${campaign.client_domain}`);
      
      // 2. Fetch all tasks for this campaign to determine historic status
      const { rows: allTasks } = await db.query("SELECT * FROM agent_tasks WHERE campaign_id = $1 ORDER BY created_at ASC", [campaign.id]);
      const pendingTasks = allTasks.filter(t => t.status === 'pending');
      
      if (pendingTasks.length === 0) {
        if (allTasks.length > 0) {
          // All tasks are completed! Mark the campaign as finished to prevent an infinite loop.
          console.log(`👔 [PM Agent] Campaign for ${campaign.client_domain} is fully operational and completed. Marking status as finished.`);
          await db.query("UPDATE campaigns SET status = 'completed' WHERE id = $1", [campaign.id]);
          continue; // Skip this campaign in future heartbeats
        }
        
        // No tasks exist at all? This is a NEW campaign. Kick off Phase 1 (Research).
        console.log(`👔 [PM Agent] Campaign empty. Initiating Phase 1: Research.`);
        
        // Log to Asana Global Server Project
        const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;
        const asanaTaskGid = await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Keyword Research Mapping`, 'Analyze competitors and map keywords', 'ResearchAgent');
        
        // Log to Database
        await db.query(`
          INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type, payload)
          VALUES ($1, $2, $3, $4)
        `, [campaign.id, 'ResearchAgent', 'Phase 1: Keyword Research', JSON.stringify({ domain: campaign.client_domain, asanaTaskGid })]);

      } else {
        // We have pending tasks! Let's execute the oldest one.
        const activeTask = pendingTasks[0];
        console.log(`👔 [PM Agent] Passing task ${activeTask.id} to ${activeTask.assigned_agent}...`);

        if (activeTask.assigned_agent === 'ResearchAgent') {
          await researchAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
          
          console.log(`👔 [PM Agent] Assigning Phase 2 to ImplementationAgent.`);
          const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;
          await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Write Onsite Tags`, 'Using the new keywords, write the title tags.', 'ImplementationAgent');
          
          await db.query(`
            INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type)
            VALUES ($1, $2, $3)
          `, [campaign.id, 'ImplementationAgent', 'Phase 2: Onsite Implementation']);
          
        } else if (activeTask.assigned_agent === 'ImplementationAgent') {
          await implementationAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
          
          // Next phase depends on Package Tier!
          const tier = campaign.package_tier || 'basic';
          const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;

          if (tier === 'basic') {
            console.log(`👔 [PM Agent] Basic Tier complete for ${campaign.client_domain}. Halting execution.`);
          } else {
            console.log(`👔 [PM Agent] Escalating to Phase 3 (Pro Tier) Backlinking for ${campaign.client_domain}.`);
            await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Backlink Procurement`, 'Generate 5 high DR link targets and an outreach email.', 'BacklinkAgent');
            await db.query(`
              INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type)
              VALUES ($1, $2, $3)
            `, [campaign.id, 'BacklinkAgent', 'Phase 3: Offsite Link Building Outreach']);
          }

        } else if (activeTask.assigned_agent === 'BacklinkAgent') {
          await backlinkAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
          
          const tier = campaign.package_tier || 'pro';
          const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;

          if (tier === 'enterprise') {
            console.log(`👔 [PM Agent] Escalating to Phase 4 (Enterprise Tier) Guru Audit for ${campaign.client_domain}.`);
            await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] Enterprise Guru Audit`, 'Perform historical RAG audit against iShack guidelines.', 'GuruAgent');
            await db.query(`
              INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type)
              VALUES ($1, $2, $3)
            `, [campaign.id, 'GuruAgent', 'Phase 4: RAG Expert Audit']);
          } else {
            console.log(`👔 [PM Agent] Pro Tier complete for ${campaign.client_domain}. Halting execution.`);
          }
          
        } else if (activeTask.assigned_agent === 'GuruAgent') {
          await guruAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
          
          const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;
          console.log(`👔 [PM Agent] Escalating to Phase 5: Autonomous ML Optimization for ${campaign.client_domain}.`);
          await asanaService.assignTaskToAgent(targetAsanaProject, `[${campaign.client_domain}] PyTorch Model Optimization (AutoResearch)`, 'Spawn Karpathy AutoResearch loop for 5-minute training epoch analysis.', 'AutoResearchAgent');
          await db.query(`
            INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type)
            VALUES ($1, $2, $3)
          `, [campaign.id, 'AutoResearchAgent', 'Phase 5: Autonomous ML Parameter Iteration']);
          
        } else if (activeTask.assigned_agent === 'AutoResearchAgent') {
          await autoResearchAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
          console.log(`👔 [PM Agent] Enterprise Tier + ML Optimization officially completed for ${campaign.client_domain}.`);
        }
      }
    }
  }
}

module.exports = new PMAgent();
