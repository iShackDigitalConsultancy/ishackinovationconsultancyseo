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
      console.warn(`[${this.name}] OPENAI_API_KEY missing. Agent will run in simulation mode.`);
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

  async think(prompt, payload = {}, engine = 'openai') {
    if (engine === 'ollama') {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3', // Standardizing on llama3 for high-volume local reasoning
            system: this.systemPrompt,
            prompt: `Context Payload: ${JSON.stringify(payload)}\n\nCommand: ${prompt}`,
            stream: false
          })
        });
        if (!response.ok) throw new Error(`Ollama responded with ${response.status}`);
        const data = await response.json();
        return data.response;
      } catch (e) {
        console.error(`[${this.name}] Ollama AI Execution Failed. Is it running?`, e);
        return `Failed to process command via Ollama.`;
      }
    }

    // Default to OpenAI (for complex reasoning or AutoSeo/Guru agents)
    if (!this.ai) {
      return `[SIMULATION RESPONSE from ${this.name}]: I acknowledge the prompt. Executing strategy.`;
    }

    try {
      const response = await this.ai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: `Context Payload: ${JSON.stringify(payload)}\n\nCommand: ${prompt}` }
        ]
      }, { timeout: 45000 }); // Pass timeout as the options object
      return response.choices[0].message.content;
    } catch (e) {
      console.error(`[${this.name}] AI Execution Failed`, e);
      return `Failed to process command.`;
    }
  }
  
  async submitForApproval(taskId, resultPayload) {
    try {
      await db.query(`
        UPDATE agent_tasks 
        SET status = 'awaiting_approval', result_payload = $1
        WHERE id = $2
      `, [JSON.stringify(resultPayload), taskId]);
    } catch (e) {
      console.error(`[${this.name}] Failed to submit task for approval`, e);
    }
  }

  async completeTask(taskId, resultPayload) {
    try {
      await db.query(`
        UPDATE agent_tasks 
        SET status = 'completed', result_payload = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(resultPayload), taskId]);
    } catch (e) {
      console.error(`[${this.name}] Failed to mark task complete`, e);
    }
  }
}

module.exports = BaseAgent;
