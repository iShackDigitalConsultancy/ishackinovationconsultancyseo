const BaseAgent = require('./baseAgent');
const db = require('../db');
const semrushService = require('../services/semrushService');

class AnalyticsAgent extends BaseAgent {
  constructor() {
    super(
      'Analytics AI Agent',
      'You are Vera Sharp, an expert AI SEO and Conversion Rate Optimization (CRO) strategist. You review raw Google Analytics data and reply EXCLUSIVELY with actionable advice to improve traffic and conversions in strict JSON format mapping to an array of objects: [{ "title": "Recommendation Title", "description": "Actionable explanation" }]. Do not include markdown formatting like ```json.'
    );
  }

  async executeTask(campaignId, domain) {
    await this.logThought(campaignId, `Commencing rigorous data scrape for domain: [${domain}]. Querying live organic domain traffic...`, 'Executing SEMrush Network hook.');
    
    try {
      // Pull target territory and GA property ID from campaigns if available
      const { rows: camps } = await db.query('SELECT target_territory, ga_property_id FROM campaigns WHERE id = $1', [campaignId]);
      const territory = (camps.length > 0 && camps[0].target_territory) ? camps[0].target_territory : 'us';
      const gaPropertyId = (camps.length > 0) ? camps[0].ga_property_id : null;

      // Pull actual organic macro analytics (Traffic, Keywords) from Semrush
      const analytics = await semrushService.getDomainAnalytics(domain, territory);
      
      // Pull Google Analytics retention pipeline specifically for this domain
      const googleAnalyticsService = require('../services/googleAnalyticsService');
      const gaMetrics = await googleAnalyticsService.getDashboardMetrics(gaPropertyId);

      // Also pull the latest Top Organic Keywords CSV to parse into JSON
      const keywordsCsv = await semrushService.getDomainOrganicKeywords(domain, territory, 50);
      
      // Parse CSV into JSON array
      const lines = keywordsCsv.trim().split('\n');
      const uniqueKwMap = new Map();
      if (lines.length > 1) {
         for (let i = 1; i < lines.length; i++) {
           let cols = lines[i].split(';');
           if (cols.length >= 6) {
              const kw = cols[0];
              const pos = parseInt(cols[1]) || 100;
              if (kw) {
                 const keyStr = String(kw).toLowerCase();
                 if (!uniqueKwMap.has(keyStr) || uniqueKwMap.get(keyStr).position > pos) {
                    uniqueKwMap.set(keyStr, {
                      keyword: kw,
                      position: pos,
                      volume: parseInt(cols[2]) || 0,
                      cpc: parseFloat(cols[3]) || 0,
                      url: cols[4]
                    });
                 }
              }
           }
         }
      }
      const topKeywords = Array.from(uniqueKwMap.values());

      await this.logThought(campaignId, `SEMrush Data: [${analytics.organic_traffic} Traffic]. GA Data: [${gaMetrics.activeUsers} Users]. Synchronizing to persistence layer...`, 'PostgreSQL Multi-Pipeline Serialization');

      // Securely insert to the core campaign metrics structure WITHOUT hallucinating
      await db.query(`
        INSERT INTO campaign_metrics (campaign_id, organic_traffic, organic_keywords, top_keywords, ga_users, ga_sessions, ga_bounce_rate, ga_avg_duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [campaignId, analytics.organic_traffic, analytics.organic_keywords, JSON.stringify(topKeywords), gaMetrics.activeUsers, gaMetrics.pageViews, gaMetrics.bounceRate, gaMetrics.averageSessionDuration]);

      console.log(`[AnalyticsAgent] Successfully synchronized hard metrics for Campaign ${campaignId}.`);
    } catch (e) {
       console.error(`[AnalyticsAgent] Failed to synchronize accurate data for Campaign ${campaignId}:`, e.message);
       await this.logThought(campaignId, `SEMrush Network sync failure: ${e.message}.`, 'Action Aborted');
    }
  }

  async generateInsights(metricsPayload) {
    const prompt = `Review the following Google Analytics data (last 30 days). Identify potential bottlenecks and suggest exactly 3 high-impact, actionable strategies to improve conversion rates and traffic retention. Return ONLY a valid JSON array.`;
    
    const resultString = await this.think(prompt, metricsPayload);
    
    try {
      // Parse out potential markdown code blocks if the AI disobeys
      const cleanString = resultString.replace(/```json\n?|```/g, '').trim();
      const resultObj = JSON.parse(cleanString);
      return Array.isArray(resultObj) ? resultObj : [];
    } catch (e) {
      console.error('[AnalyticsAgent] Failed to parse insights as JSON:', e);
      return [{
        title: "Metrics Acknowledged",
        description: "The AI reviewed the metrics but failed to format the response correctly. Try generating insights again."
      }];
    }
  }
}

module.exports = new AnalyticsAgent();
