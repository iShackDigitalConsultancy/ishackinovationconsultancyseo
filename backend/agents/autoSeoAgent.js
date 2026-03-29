const BaseAgent = require('./baseAgent');
const fs = require('fs');
const path = require('path');

class AutoSeoAgent extends BaseAgent {
  constructor() {
    super(
      "You are the world's absolute highest authority on AEO (AI Engine Optimization) and SEO. Your explicit job is to analyze the ever-evolving algorithms of Google SGE (Search Generative Experience), Perplexity AI, and OpenAI RAG indexers. You will output your latest strategic findings strictly in a structured JSON format."
    );
    this.knowledgePath = path.join(__dirname, 'knowledge', 'aeo_rules.json');
  }

  /**
   * Called weekly by the CRON scheduler to update the agency's global algorithm parameters.
   */
  async runWeeklyResearch() {
    console.log("🧠 [Auto SEO Agent] Triggering Weekly AEO / Algorithm Discovery Sequence...");

    const prompt = `
      Act as the lead SEO Scientist. Search parameters currently indicate major shifts in how LLMs (like Perplexity and ChatGPT) and Google SGE crawl the web.
      I need you to synthesize the absolute best, cutting-edge strategies for optimizing content for these AI engines.

      Draft a JSON response identifying:
      1. perplexity_optimization_tactics: Array of the top 3 ways to ensure Perplexity pulls our content.
      2. google_sge_parameters: Array of the top 3 ways to trigger Google SGE featured snippets.
      3. semantic_keyword_density_targets: An object containing instructions for 'primary_term_density' and 'lsi_term_distribution'.

      Return ONLY valid JSON.
    `;

    try {
      const response = await this.think(prompt, { trigger: "weekly_aeo_refresh" });
      
      // Attempt to strictly parse JSON (stripping markdown backticks if present)
      let cleanJson = response.replace(/^```json/g, '').replace(/```$/g, '').trim();
      const newRules = JSON.parse(cleanJson);
      newRules.updated_at = new Date().toISOString();

      // Physically overwrite the global knowledge JSON
      fs.writeFileSync(this.knowledgePath, JSON.stringify(newRules, null, 2), 'utf-8');
      
      console.log(`🧠 [Auto SEO Agent] Successfully synthesized and updated Global AEO Rules (aeo_rules.json)`);
      return true;

    } catch (e) {
      console.error("🧠 [Auto SEO Agent] Failed to update AEO Knowledge Base:", e.message);
      return false;
    }
  }
}

module.exports = new AutoSeoAgent();
