const db = require('../db');
const asanaService = require('../services/asanaService');
const researchAgent = require('./researchAgent');
const implementationAgent = require('./implementationAgent');

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
      
      // 2. Fetch pending tasks for this campaign
      const { rows: pendingTasks } = await db.query("SELECT * FROM agent_tasks WHERE campaign_id = $1 AND status = 'pending' ORDER BY created_at ASC", [campaign.id]);
      
      if (pendingTasks.length === 0) {
        // No tasks exist? This is a NEW campaign. Kick off Phase 1 (Research).
        console.log(`👔 [PM Agent] Campaign empty. Initiating Phase 1: Research.`);
        
        // Log to Asana
        const asanaTaskGid = await asanaService.assignTaskToAgent(campaign.asana_project_id, 'Keyword Research Mapping', 'Analyze competitors and map keywords', 'ResearchAgent');
        
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
          
          // Next State: When Research is done, assign Implementation
          console.log(`👔 [PM Agent] Assigning Phase 2 to ImplementationAgent.`);
          await asanaService.assignTaskToAgent(campaign.asana_project_id, 'Write Onsite Tags', 'Using the new keywords, write the title tags.', 'ImplementationAgent');
          
          await db.query(`
            INSERT INTO agent_tasks (campaign_id, assigned_agent, task_type)
            VALUES ($1, $2, $3)
          `, [campaign.id, 'ImplementationAgent', 'Phase 2: Onsite Implementation']);
          
        } else if (activeTask.assigned_agent === 'ImplementationAgent') {
          await implementationAgent.executeTask(activeTask.id, campaign.id, activeTask.payload);
          // Here, we would transition to BacklinkAgent or GuruAgent...
          console.log(`👔 [PM Agent] Implementation complete. Next step: Guru Review.`);
        }
      }
    }
  }
}

module.exports = new PMAgent();
