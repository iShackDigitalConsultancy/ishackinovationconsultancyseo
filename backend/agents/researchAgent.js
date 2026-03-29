const BaseAgent = require('./baseAgent');

class ResearchAgent extends BaseAgent {
  constructor() {
    super(
      'Research Agent', 
      'You are the iShack Research SEO Agent. Your job is to analyze competitors, determine optimal keyword mapping strategies, and output raw structural insights. You do NOT write content. You only provide data-driven strategic direction.'
    );
  }

  async executeTask(taskId, campaignId, payload) {
    await this.logThought(campaignId, 'Reviewing primary campaign domain and assigning high-intent keyword clusters.', 'Pinging SEMrush equivalent databases...');
    
    // In production, this would ping DataForSEO/SEMrush APIs
    const prompt = `Analyze this target client domain and provide 3 high-priority keywords with intent mappings. Return ONLY JSON array of top keywords.`;
    
    const result = await this.think(prompt, payload);
    
    await this.logThought(campaignId, 'Keyword clusters successfully generated.', 'Writing output payload to PostgreSQL.');
    await this.completeTask(taskId, { keywords: result });
    
    return result;
  }
}

module.exports = new ResearchAgent();
