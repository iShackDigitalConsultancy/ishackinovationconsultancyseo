const BaseAgent = require('./baseAgent');
const asanaService = require('../services/asanaService');

class BacklinkAgent extends BaseAgent {
  constructor() {
    super(
      'Backlinking Agent', 
      'You are the iShack Backlinking SEO Agent. Your job is to take onsite structural data and generate high-DR backlink target lists, guest post outreach emails, and directory distribution strategies.'
    );
  }

  async executeTask(taskId, campaignId, payload) {
    await this.logThought(campaignId, 'Reviewing published content to determine off-site backlink velocity...', 'Drafting outreach emails and target sites.');
    
    const prompt = `Based on the client's optimized onsite implementation, create a list of 5 hyper-relevant link-building targets and write one personalized outreach email to request a guest post.`;
    
    try {
      const result = await this.think(prompt, payload);
      const cleanRes = result.replace(/```json/g, '').replace(/```/g, '');
      
      await this.logThought(campaignId, 'Off-site outreach strategy built.', 'Saving to DB.');
      await asanaService.updateTaskCompletion(taskId, `Outreach completed.\n\nTargets JSON:\n${cleanRes}`);
      await this.submitForApproval(taskId, JSON.parse(cleanRes));

    } catch (e) {
      console.error(e);
      await this.logThought(campaignId, `Crash: ${e.message}`, `Failing Task`);
      await asanaService.updateTaskCompletion(taskId, `Outreach Task Failed:\n\n${e.message}`);
      await this.completeTask(taskId, { error: e.message });
    }
    return result;
  }
}

module.exports = new BacklinkAgent();
