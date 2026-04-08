const db = require('../db');
const asanaService = require('../services/asanaService');
const researchAgent = require('./researchAgent');
const implementationAgent = require('./implementationAgent');
const backlinkAgent = require('./backlinkAgent');
const guruAgent = require('./guruAgent');
const autoResearchAgent = require('./autoResearchAgent');
const analyticsAgent = require('./analyticsAgent');

// Helper to run promises in parallel with strict concurrency limit to prevent Node loop block
async function concurrentChunkedExecute(items, limit, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

/**
 * The Swarm Orchestrator - Manages State Machine at the URL Level
 */
class PMAgent {
  async tick() {
    console.log("👔 [PM Agent] Running Swarm heartbeat orchestrator...");

    const { rows: campaigns } = await db.query("SELECT * FROM campaigns WHERE status IN ('active', 'optimizing')");
    
    for (const campaign of campaigns) {
       console.log(`👔 [PM Agent] Evaluating Campaign Swarm: ${campaign.client_domain}`);
       
       // 1. Fetch package limits
       const tierName = campaign.package_tier || 'basic';
       const { rows: pkgs } = await db.query("SELECT max_ai_phase, max_urls, max_keywords_per_url FROM packages WHERE tier_name = $1", [tierName.toLowerCase()]);
       const max_ai_phase = pkgs.length > 0 ? pkgs[0].max_ai_phase : 2;
       const max_urls = pkgs.length > 0 ? pkgs[0].max_urls : 5;
       const max_keywords_per_url = pkgs.length > 0 ? pkgs[0].max_keywords_per_url : 3;

       const targetAsanaProject = process.env.ASANA_PROJECT_GID || campaign.asana_project_id;
       
       // 2. Resolve URL Backlog (Enforcing Package limits)
       const { rows: urls } = await db.query("SELECT * FROM campaign_urls WHERE campaign_id = $1 ORDER BY created_at ASC LIMIT $2", [campaign.id, max_urls]);
       
       if (urls.length === 0) {
         console.log(`👔 [PM Agent] No URLs discovered for ${campaign.client_domain}. Initiating URL discovery and mapping.`);
         
         // Create the root URL automatically mapping to the target keywords
         const targetKeywordsObj = { terms: [ campaign.client_domain, "seo" ].slice(0, max_keywords_per_url) };
         const { rows: inserted } = await db.query(`
           INSERT INTO campaign_urls (campaign_id, url_path, target_keywords) 
           VALUES ($1, $2, $3) RETURNING id
         `, [campaign.id, `https://${campaign.client_domain}/`, JSON.stringify(targetKeywordsObj)]);

         // Assign initial task for the new URL
         await db.query(`
           INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type, payload)
           VALUES ($1, $2, $3, $4, $5)
         `, [campaign.id, inserted[0].id, 'ResearchAgent', 'Phase 1: Keyword Research', JSON.stringify({ domain: campaign.client_domain, url_path: `https://${campaign.client_domain}/`, target_territory: campaign.target_territory, max_keywords: max_keywords_per_url })]);
         continue; // Move to next campaign, let next tick pick this up
       }

       // 3. Process URL Swarm Concurrently (Max 3 parallel task resolutions across URLs)
       await concurrentChunkedExecute(urls, 3, async (urlRecord) => {
          
          // Find the most recent active task for this specific URL
          const { rows: tasks } = await db.query("SELECT * FROM agent_tasks WHERE campaign_id = $1 AND url_id = $2 ORDER BY created_at DESC LIMIT 1", [campaign.id, urlRecord.id]);
          
          if (tasks.length === 0) return; // Wait for initial payload mapping
          
          const activeTask = tasks[0];

          if (activeTask.status === 'pending') {
            console.log(`👔 [PM Agent] Executing assigned logic for ${activeTask.assigned_agent} on URL ${urlRecord.url_path}...`);
            
            // Execute Agent logic
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
               await analyticsAgent.executeTask(campaign.id, urlRecord.url_path);
               await db.query(`UPDATE agent_tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`, [activeTask.id]);
            }

          } else if (activeTask.status === 'awaiting_approval') {
              console.log(`👔 [PM Agent] URL ${urlRecord.url_path} paused. Awaiting manual approval.`);
          } else if (activeTask.status === 'completed') {
              // URL Progression Phase Engine

              if (activeTask.task_type.includes('Phase 1')) {
                await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type, payload) VALUES ($1, $2, $3, $4, $5)`, 
                  [campaign.id, urlRecord.id, 'ImplementationAgent', 'Phase 2: Onsite Implementation', activeTask.result_payload]);
      
              } else if (activeTask.task_type.includes('Phase 2')) {
                if (max_ai_phase >= 3) {
                  await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type, payload) VALUES ($1, $2, $3, $4, $5)`, 
                    [campaign.id, urlRecord.id, 'BacklinkAgent', 'Phase 3: Offsite Link Building Outreach', activeTask.result_payload]);
                }
              } else if (activeTask.task_type.includes('Phase 3')) {
                if (max_ai_phase >= 4) {
                  await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type) VALUES ($1, $2, $3, $4)`, 
                    [campaign.id, urlRecord.id, 'GuruAgent', 'Phase 4: RAG Expert Audit']);
                }
              } else if (activeTask.task_type.includes('Phase 4')) {
                if (max_ai_phase >= 5) {
                  await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type) VALUES ($1, $2, $3, $4)`, 
                    [campaign.id, urlRecord.id, 'AutoResearchAgent', 'Phase 5: Autonomous ML Parameter Iteration']);
                }
              } else if (activeTask.task_type.includes('Phase 5')) {
                if (max_ai_phase >= 6) {
                   await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type) VALUES ($1, $2, $3, $4)`, 
                    [campaign.id, urlRecord.id, 'AnalyticsAgent', 'Phase 6: Live Data Hooked to SEMrush']);
                }
              } else if (activeTask.task_type.includes('Phase 6')) {
                 if (max_ai_phase >= 7) {
                   await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type) VALUES ($1, $2, $3, $4)`, 
                     [campaign.id, urlRecord.id, 'ResearchAgent', 'Phase 7: Continuous Optimization Advisory']);
                 }
              } else if (activeTask.task_type.includes('Phase 7')) {
                   await db.query(`INSERT INTO agent_tasks (campaign_id, url_id, assigned_agent, task_type, payload) VALUES ($1, $2, $3, $4, $5)`, 
                     [campaign.id, urlRecord.id, 'ImplementationAgent', 'Phase 8: Continuous Action Pipeline', activeTask.result_payload]);
              } else if (activeTask.task_type.includes('Phase 8') || activeTask.task_type.includes('Ad-Hoc')) {
                 // Optimization complete for this URL cycle
              }
          }
       });
    }
  }
}

module.exports = new PMAgent();
