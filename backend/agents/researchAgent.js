const BaseAgent = require('./baseAgent');
const asanaService = require('../services/asanaService');
const fs = require('fs');
const path = require('path');
const semrushService = require('../services/semrushService');

class ResearchAgent extends BaseAgent {
  constructor() {
    super(
      'Research Agent', 
      'You are the iShack Research SEO Agent. Your job is to analyze competitors, determine optimal keyword mapping strategies, and output raw structural insights. You do NOT write content. You only provide data-driven strategic direction.'
    );
  }

  async executeTask(taskId, campaignId, payload) {
    // 1. Read Global AEO Algorithm Rules 
    const aeoRulesPath = path.join(__dirname, 'knowledge', 'aeo_rules.json');
    let aeoContext = "No AEO rules currently loaded.";
    try {
      if (fs.existsSync(aeoRulesPath)) {
        aeoContext = fs.readFileSync(aeoRulesPath, 'utf-8');
      }
    } catch(e) { }

    await this.logThought(campaignId, 'Reviewing primary campaign domain and applying Global AEO (Search Generative Experience) parameters.', 'Pinging SEMrush databases...');
    
    // Fetch live SEMrush metrics
    let semrushData = "Data Unavailable or Domain Not Ranking.";
    try {
      const territory = payload.target_territory || 'us';
      const rawCsv = await semrushService.getDomainOrganicKeywords(payload.domain, territory, 10);
      semrushData = rawCsv;
      await this.logThought(campaignId, `SEMrush Telemetry Acquired (${territory.toUpperCase()}). Analyzing volume and keyword density...`, 'Consulting GPT Matrix.');
    } catch (e) {
      console.warn("SEMrush Integration Failed during Research Phase:", e.message);
    }
    
    const prompt = `
      Analyze this target client domain (${payload.domain}) and provide 3 high-priority keywords with intent mappings. 
      
      Here is the raw, actual organic ranking telemetry just pulled from the SEMrush API:
      === SEMRUSH DATA CSV ===
      ${semrushData}
      ========================
      
      CAMPAIGN CONTEXT/DIRECTIVES: ${JSON.stringify(payload)} // If any target audiences or niches are defined here, optimize exclusively for them.
      
      CRITICAL REQUIREMENT: You must structurally adopt the following active AEO (AI Engine Optimization) rules to ensure rankability on Perplexity and Google SGE:
      
      === GLOBAL AEO PARAMETERS ===
      ${aeoContext}
      =============================
      
      Return ONLY a JSON array of top keywords. Format each object rigorously: [{"keyword": "search query", "intent": "informational/commercial", "volume": 1200, "difficulty": 45}]
    `;
    
    try {
      const result = await this.think(prompt, payload);
      const cleanRes = result.replace(/```json\n?|\n?```/g, '');
      
      await this.logThought(campaignId, 'Keyword clusters successfully generated.', 'Writing output payload to PostgreSQL.');
      await asanaService.updateTaskCompletion(taskId, `Keyword Research complete.\n\nStrategy JSON:\n${cleanRes}`);
      await this.submitForApproval(taskId, JSON.parse(cleanRes));
      return result;

    } catch (e) {
      console.error(e);
      await this.logThought(campaignId, `API Error Output: ${e.message}`, `Failing Task Gracefully`);
      await asanaService.updateTaskCompletion(taskId, `Task Failed:\n\n${e.message}`);
      await this.completeTask(taskId, { error: e.message });
      return null;
    }
  }
}

module.exports = new ResearchAgent();
