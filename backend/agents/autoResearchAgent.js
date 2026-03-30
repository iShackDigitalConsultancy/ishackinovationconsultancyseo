const BaseAgent = require('./baseAgent');
const asanaService = require('../services/asanaService');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const systemPrompt = `You are an Autonomous AI ML Researcher natively embedded into the OpenClaw orchestration cluster. 
Your primary objective is to evaluate Andrej Karpathy's AutoResearch framework files (specifically program.md and train.py) and output a modified version of train.py designed to improve the validation score (val_bpb) of the GPT model over a strict 5-minute compute budget.
Evaluate the code, optimize hyper-parameters (such as DEPTH, TOTAL_BATCH_SIZE), or write new architectural blocks in PyTorch.
IMPORTANT: Because you are being executed programmatically, you MUST output ONLY the raw Python code required to replace train.py. Do not use markdown backticks or English conversational text.`;

class AutoResearchAgent extends BaseAgent {
  constructor() {
    super('AutoResearchAgent', systemPrompt);
    this.repoPath = path.join(__dirname, 'autoresearch');
  }

  async executeTask(taskId, campaignId, payload) {
    await this.logThought(campaignId, `Received AutoML Optimization Directive. Analyzing AutoResearch Python matrix.`, `Initializing uv Python Environment...`);
    
    try {
      const trainPyPath = path.join(this.repoPath, 'train.py');
      const programMdPath = path.join(this.repoPath, 'program.md');
      
      // 1. Read existing AutoResearch architecture
      const currentTrainPy = await fs.readFile(trainPyPath, 'utf8');
      const programMd = await fs.readFile(programMdPath, 'utf8');
      
      await this.logThought(campaignId, `Parsed train.py (${currentTrainPy.length} bytes) and program.md. Engaging GPT-4 reasoning engine for structural evolution.`, `Executing this.think()`);

      // 2. Consult LLM for parameter optimization
      const prompt = `Based on the client's objective: "${payload.objective || 'Maximize val_bpb efficiency'}", evaluate this ML program spec:\n${programMd}\n\nAnd here is the current PyTorch train.py script:\n${currentTrainPy}\n\nWrite a strictly enhanced version of train.py and return ONLY raw valid Python. No wrapper formatting.`;
      
      const rawAiResponse = await this.think(prompt);
      
      // Strip potentially hallucinated markdown wrappers
      let cleanPy = rawAiResponse;
      const codeBlockMatch = rawAiResponse.match(/```(?:python)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        cleanPy = codeBlockMatch[1];
      }
      // Overwrite the actual repo file
      await fs.writeFile(trainPyPath, cleanPy);
      await this.logThought(campaignId, `Dynamic PyTorch architecture successfully synthesized and injected into train.py.`, `Spawning Child Process: uv run train.py`);

      // 3. Spawning the Python Execution Sub-Process
      const uvPath = '$HOME/.local/bin/uv';
      const { stdout, stderr } = await execPromise(`PATH="$HOME/.local/bin:$PATH" uv run train.py`, { 
        cwd: this.repoPath, 
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for ML logs
        timeout: 1000 * 60 * 10 // 10 Min Hard Timeout (Karpathy's default is 5 mins)
      });

      // 4. Extrapolate metrics from the run
      const valMatches = stdout.match(/val_bpb:\s*([\d.]+)/g);
      const finalValBpb = valMatches ? valMatches[valMatches.length - 1].replace('val_bpb: ', '') : 'Unknown (Crash)';

      await this.logThought(campaignId, `Subprocess optimization complete. Final val_bpb extracted: ${finalValBpb}`, `Updating Asana Task Pipeline`);

      // 5. Conclude Asana Hook
      const logPreview = stdout.length > 1000 ? stdout.substring(stdout.length - 1000) : stdout;
      await asanaService.updateTaskCompletion(taskId, `AutoResearch Optimization complete.\n\nFinal Validation BPB: ${finalValBpb}\n\nTerminal Logs Pipeline:\n${logPreview}`);
      await this.completeTask(taskId, { val_bpb: finalValBpb, status: 'success' });

    } catch (e) {
      console.error(e);
      await this.logThought(campaignId, `Fatal Error during PyTorch Subprocess Execution: ${e.message}`, `Failing Task Gracefully`);
      await asanaService.updateTaskCompletion(taskId, `AutoML Task Failed:\n\n${e.message}`);
      await this.completeTask(taskId, { error: e.message, status: 'failed' });
    }
  }
}

module.exports = new AutoResearchAgent();
