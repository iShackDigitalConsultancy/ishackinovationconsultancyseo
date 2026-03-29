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
}

module.exports = new VeraAgent();
