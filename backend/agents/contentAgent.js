const BaseAgent = require('./baseAgent');
const db = require('../db');
const wordpressService = require('../services/wordpressService');
const fs = require('fs');
const path = require('path');

class ContentAgent extends BaseAgent {
  constructor() {
    super(
      'Content Draft Agent', 
      'You are the iShack SGE Content Optimization Agent. Your job is to draft long-form semantic articles directly formatted into beautiful, engaging HTML5. You must inherently follow UX principles: use highly scannable Headings (H2/H3), unordered lists, blockquotes for key takeaways, and wrap important elements in semantic tags. Output MUST strictly map to JSON payload: { "title": "Stunning SEO Title", "html_content": "<article>...</article>" }. Do not return backticks.'
    );
  }

  /**
   * Executes the autonomous drafting protocol and connects to WordPress REST payload automatically if configured.
   */
  async executeTask(campaignId, targetKeyword = "General SEO Pipeline") {
    await this.logThought(campaignId, `Ingesting Target parameters for keyword: ${targetKeyword}. Formulating structural UX layout...`, 'Drafting SGE Content Block');
    
    // Load dynamic AEO Rules if present
    let aeoRules = "";
    try {
      const aeoPath = path.join(__dirname, 'knowledge', 'aeo_rules.json');
      if (fs.existsSync(aeoPath)) {
         aeoRules = fs.readFileSync(aeoPath, 'utf8');
      }
    } catch(e) {}

    try {
      const prompt = `
        Write a 1000-word authoritative blog post targeting the core concept: "${targetKeyword}".
        Follow the global iShack AEO Semantic Parameters:
        ${aeoRules}

        CRITICAL: The "html_content" you return MUST be styled beautifully using semantic HTML elements. Use blockquotes for major take-aways. Output strictly as JSON.
        Format: { "title": "...", "html_content": "..." }
      `;
      
      const result = await this.think(prompt, { keyword: targetKeyword }, 'ollama');
      let cleanRes = result.replace(/^```json\n?/g, '').replace(/\n?```$/g, '').trim();
      
      const payload = JSON.parse(cleanRes);

      await this.logThought(campaignId, 'UX Content HTML rendered flawlessly in memory.', 'Verifying WP Authentication Hooks');

      // Natively save to our internal campaign_blogs repository
      await db.query(
        'INSERT INTO campaign_blogs (campaign_id, title, html_content) VALUES ($1, $2, $3)', 
        [campaignId, payload.title, payload.html_content]
      );

      // Attempt WordPress Integration
      const { rows } = await db.query('SELECT wp_url, wp_username, wp_password, wp_publish_status FROM campaigns WHERE id = $1', [campaignId]);
      if (rows.length > 0 && rows[0].wp_url && rows[0].wp_username && rows[0].wp_password) {
          
          await this.logThought(campaignId, `Valid WP Credentials detected. Uploading payload to REST API...`, 'Executing Cross-Domain Post');
          const wpRes = await wordpressService.uploadArticle(rows[0], payload.title, payload.html_content, rows[0].wp_publish_status);
          
          await this.logThought(campaignId, `Article successfully injected to site via WP JSON. URL: ${wpRes.postLink}`, 'Action Complete');
          
      } else {
          await this.logThought(campaignId, `No valid WP credentials mapped to campaign. Draft saved natively to Public Blog Repository.`, 'Payload Serialized Locally');
      }

    } catch (e) {
      console.error(e);
      await this.logThought(campaignId, `Content Drafting Crash: ${e.message}`, `Failing Task`);
    }
    
    return;
  }
}

module.exports = new ContentAgent();
