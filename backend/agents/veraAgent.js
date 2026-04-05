const BaseAgent = require('./baseAgent');
const mailService = require('../services/mailService');
const db = require('../db');

class VeraAgent extends BaseAgent {
  constructor() {
    super(
      'Vera Sharp', 
      'You are Vera Sharp, the highly professional, sharp, and concise Executive AI Assistant for iShack SEO. Your job is to read all database activity for the day and synthesize it into a clean, bulleted email report for Wayne and Richard.'
    );
  }

  async runDailyReport() {
    console.log("📝 [Vera Sharp] Compiling daily aggregate report...");
    
    // Fetch all agent actions from the last 24 hours
    let reportData = '';
    try {
      const { rows: logs } = await db.query(`
        SELECT * FROM agent_logs 
        WHERE created_at >= NOW() - INTERVAL '24 HOURS'
      `);
      
      if (logs.length === 0) {
        reportData = "No activity logs were recorded from the AI Agents in the past 24 hours.";
      } else {
        reportData = logs.map(l => `[${l.agent_name}]: ${l.action_taken} -> ${l.thought_process}`).join('\n');
      }

      const prompt = `Read the following raw database logs from the autonomous SEO agents today, and write a professional, encouraging email report to Wayne and Richard summarizing their accomplishments and active campaigns.
      
      Raw Logs:
      ${reportData}`;
      
      const emailHtml = await this.think(prompt);
      
      console.log("📝 [Vera Sharp] Dispatching summary to Mailer service.");
      await mailService.sendDailyReport("iShack SEO AI Agency: Daily Progress Update", emailHtml);
      
    } catch (e) {
      console.error("Vera Sharp failed to run daily report", e);
    }
  }

  async notifyLead(email, domain, score) {
    console.log(`📝 [Vera Sharp] New CRM Lead Acquired: ${email} | ${domain} | Score: ${score}`);
    try {
      // Instantly dispatch to the Admin via email (acting as Telegram bridging layer for now)
      const alertHtml = `
        <h2>🚨 New High-Intent SEO Lead!</h2>
        <p>A new prospect has just executed the Autonomous AI SEO Audit on the dashboard.</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Domain:</strong> ${domain}</li>
          <li><strong>Technical Score:</strong> ${score}/100</li>
        </ul>
        <p><em>Reach out immediately to convert this lead. Log into the Super Admin dashboard to view full CRM metrics.</em></p>
      `;
      await mailService.sendDailyReport(`🚨 NEW SEO LEAD: ${domain} (${score}/100)`, alertHtml);
    } catch (e) {
      console.error("Vera Sharp failed to transmit Lead Alert", e);
    }
  }
}

module.exports = new VeraAgent();
