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
  _client = asana.Client.create().useAccessToken(process.env.ASANA_PAT);
  return _client;
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
  }
};

module.exports = asanaService;
