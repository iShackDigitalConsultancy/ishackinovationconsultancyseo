require('dotenv').config();
const asana = require('asana');

/**
 * Asana Integration Service for PM Agent Task Delegation
 */

let _client = null;

function getClient() {
  if (_client) return _client;
  if (!process.env.ASANA_PAT) {
    console.warn("ASANA_PAT is missing. Asana Service will run in Mock Mode.");
    return null;
  }

  try {
    // If asana ver 3.x+ is used, Client.create() might be missing and throw TypeError
    _client = asana.Client ? asana.Client.create().useAccessToken(process.env.ASANA_PAT) : null;
    if (!_client) throw new Error("Asana SDK Client object is undefined.");
    return _client;
  } catch (e) {
    console.error("Asana Client initialization failed. Defaulting to mock mode.", e.message);
    return null;
  }
}

const asanaService = {
  createCampaignProject: async (clientDomain) => {
    const client = getClient();
    if (!client) {
      console.log(`[MOCK ASANA] Built Project for Domain: ${clientDomain}`);
      return `mock-project-${Date.now()}`;
    }

    try {
      const workspaceGid = process.env.ASANA_WORKSPACE_GID;
      const teamGid = process.env.ASANA_TEAM_GID;

      if (!workspaceGid) throw new Error("Missing ASANA_WORKSPACE_GID");

      // Build project
      const project = await client.projects.createProject({
        workspace: workspaceGid,
        team: teamGid,
        name: `SEO Campaign: ${clientDomain}`,
        color: 'dark-blue',
        default_view: 'board'
      });
      console.log(`Successfully created Asana Project: ${project.gid}`);
      return project.gid;
    } catch (e) {
      console.error("Failed to create Asana Project", e);
      return null;
    }
  },

  assignTaskToAgent: async (projectGid, taskName, instructions, aisName) => {
    const client = getClient();
    if (!client) {
      console.log(`[MOCK ASANA] Created Task -> '${taskName}' inside Project (Assignee: ${aisName})`);
      return `mock-task-${Date.now()}`;
    }

    try {
      const task = await client.tasks.createTask({
        projects: [projectGid],
        name: `[${aisName}] ${taskName}`,
        notes: instructions,
      });
      return task.gid;
    } catch (e) {
      console.error("Failed to create Asana Task", e);
      return null;
    }
  },

  updateTaskCompletion: async (taskGid, completionNotes) => {
    const client = getClient();
    if (!client) {
      console.log(`[MOCK ASANA] Completed Task -> Task ID: ${taskGid} | Notes: ${completionNotes.substring(0, 50)}...`);
      return true;
    }
    try {
      if (!taskGid || taskGid.startsWith('mock-') || taskGid === 'sandbox_test_task') return true;
      await client.tasks.updateTask(taskGid, {
        completed: true,
        html_notes: `<body>${completionNotes.replace(/\\n/g, '<br>')}</body>`
      });
      return true;
    } catch (e) {
      console.error("Failed to update Asana Task completion", e);
      return false;
    }
  }
};

module.exports = asanaService;
