const BaseAgent = require('./baseAgent');

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
    
    const result = await this.think(prompt, payload);
    
    await this.logThought(campaignId, 'Off-site outreach strategy built.', 'Saving to DB.');
    await this.completeTask(taskId, { link_targets: result });
    
    return result;
  }
}

module.exports = new BacklinkAgent();
