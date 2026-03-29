require('dotenv').config();
const { OpenAI } = require('openai');
const db = require('../db');

class BaseAgent {
  constructor(name, systemPrompt) {
    this.name = name;
    this.systemPrompt = systemPrompt;
    
    if (process.env.OPENAI_API_KEY) {
      this.ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else {
      console.warn(`[${this.name}] OPENAI_API_KEY missing. Agent will run in mock mode.`);
    }
  }

  async logThought(campaignId, thought, action) {
    console.log(`[${this.name}] 🧠 Thought: ${thought} | ⚡ Action: ${action}`);
    try {
      if (campaignId) {
        await db.query(`
          INSERT INTO agent_logs (campaign_id, agent_name, thought_process, action_taken)
          VALUES ($1, $2, $3, $4)
        `, [campaignId, this.name, thought, action]);
      }
    } catch (e) {
      console.error(`[${this.name}] Failed to write memory log`, e);
    }
  }

  async think(prompt, payload = {}) {
    if (!this.ai) {
      return `[MOCK RESPONSE from ${this.name}]: I acknowledge the prompt. Executing strategy.`;
    }

    try {
      const response = await this.ai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: `Context Payload: ${JSON.stringify(payload)}\n\nCommand: ${prompt}` }
        ],
        timeout: 45000 // Strict 45-second bounds to prevent system lockups
      });
      return response.choices[0].message.content;
    } catch (e) {
      console.error(`[${this.name}] AI Execution Failed`, e);
      return `Failed to process command.`;
    }
  }
  
  async completeTask(taskId, resultPayload) {
    try {
      await db.query(`
        UPDATE agent_tasks 
        SET status = 'completed', result_payload = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [resultPayload, taskId]);
    } catch (e) {
      console.error(`[${this.name}] Failed to mark task complete`, e);
    }
  }
}

module.exports = BaseAgent;
