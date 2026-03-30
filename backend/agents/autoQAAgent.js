const BaseAgent = require('./baseAgent');
const asanaService = require('../services/asanaService');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

const systemPrompt = `You are an Autonomous AI ML QA Engineer natively embedded into the OpenClaw orchestration cluster (utilizing Karpathy's AutoResearch feedback loops).
Your objective is to evaluate failed Node.js integration tests and their executing source file, and output a modified, bug-free version of that JS file.
IMPORTANT: Because you are being executed programmatically, you MUST output ONLY the raw JavaScript code required to replace the target file. Do not use markdown backticks or English conversational text. Only valid JS code.`;

class AutoQAAgent extends BaseAgent {
  constructor() {
    super('AutoQAAgent', systemPrompt);
    this.repoPath = path.join(__dirname, '..');
  }

  async executeTask(taskId, campaignId, payload) {
    if (campaignId) {
      await this.logThought(campaignId, `Initiating AutoResearch Evaluation Loop.`, `Spawning local OpenClaw cluster tests...`);
    } else {
      console.log(`[AutoQAAgent] Initiating local Sandbox Evaluation Loop.`);
    }
    
    let iterations = 0;
    const maxIterations = 3;
    let testsPassed = false;
    let targetFilePath = path.join(this.repoPath, payload.targetFile || 'server.js');

    while (iterations < maxIterations && !testsPassed) {
      iterations++;
      console.log(`\n[AutoQAAgent] Iteration ${iterations}/${maxIterations} starting...`);
      
      try {
        const testPath = path.join(this.repoPath, 'autoresearch', 'run_tests.js');
        const { stdout, stderr } = await execPromise(`node ${testPath}`, { 
          cwd: this.repoPath,
          maxBuffer: 1024 * 1024 * 5
        });
        
        console.log(`[AutoQAAgent] run_tests.js passed clean on iteration ${iterations}!`);
        if (campaignId) await this.logThought(campaignId, `Evaluator reported 100% PASS. Zero defects found.`, `Concluding Sandbox Trial.`);
        testsPassed = true;
        
      } catch (e) {
        console.error(`[AutoQAAgent] Test failure intercepted on iteration ${iterations}. Engaging AI repair sequence...`);
        const crashLog = e.stdout + "\n" + e.stderr;
        
        if (campaignId) await this.logThought(campaignId, `Test harness failed. Extracted stack trace. Engaging GPT reasoning engine for code repair.`, `Reading source ${payload.targetFile}...`);
        
        let currentCode = await fs.readFile(targetFilePath, 'utf8');
        
        const prompt = `Based on the following test harness crash log:\n\n${crashLog}\n\nHere is the current source code of the failing file:\n\n${currentCode}\n\nWrite a strictly enhanced, bug-free version of this file and return ONLY raw valid JavaScript. Double check syntax. No markdown wrappers surrounding the response.`;
        
        const rawAiResponse = await this.think(prompt);
        
        let cleanCode = rawAiResponse;
        const codeBlockMatch = rawAiResponse.match(/```(?:javascript|js)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
          cleanCode = codeBlockMatch[1];
        }
        
        await fs.writeFile(targetFilePath, cleanCode.trim());
        if (campaignId) await this.logThought(campaignId, `Synthesized JS footprint successfully injected. Retrying evaluator.`, `Loop Iteration ++`);
        console.log(`[AutoQAAgent] Source code rewritten and saved. Booting next validation test...`);
      }
    }

    if (testsPassed) {
      if (taskId !== 'sandbox') {
        await asanaService.updateTaskCompletion(taskId, `AutoResearch Optimization complete.\n\nTests passing after ${iterations} iterations.`);
        await this.completeTask(taskId, { iterations, status: 'success' });
      }
    } else {
      console.error(`[AutoQAAgent] FAILED to stabilize code after ${maxIterations} loops.`);
      if (taskId !== 'sandbox') {
        await asanaService.updateTaskCompletion(taskId, `AutoResearch QA Loop Exhausted.\n\nAgent failed to stabilize the codebase.`);
        await this.completeTask(taskId, { error: 'Exceeded max iterations', status: 'failed' });
      }
    }
  }
}

module.exports = new AutoQAAgent();
