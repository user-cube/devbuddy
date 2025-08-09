// Background tasks and services
// This file handles background processes like data fetching, notifications, etc.

import JiraService from './services/jira.js';
import GitHubService from './services/github.js';
import GitLabService from './services/gitlab.js';

class BackgroundService {
  constructor () {
    this.jiraService = new JiraService();
    this.githubService = new GitHubService();
    this.gitlabService = new GitLabService();
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
    this.isRunning = false;
  }

  start () {
    if (this.isRunning) return;

    this.isRunning = true;

    // Initial data fetch
    this.updateData();

    // Set up periodic updates
    this.interval = setInterval(() => {
      this.updateData();
    }, this.updateInterval);
  }

  stop () {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async updateData () {
    try {
      // Fetch data from all services
      const [jiraTasks, githubPRs, gitlabPRs] = await Promise.all([
        this.jiraService.getTasks(),
        this.githubService.getPullRequests(),
        this.gitlabService.getMergeRequests()
      ]);

      // Store the data for the main process to access
      this.cachedData = {
        jiraTasks: jiraTasks.length,
        githubPRs: githubPRs.length,
        gitlabPRs: gitlabPRs.length,
        lastUpdated: new Date().toISOString()
      };

    } catch {
      // no-op
    }
  }

  getCachedData () {
    return this.cachedData || {
      jiraTasks: 0,
      githubPRs: 0,
      gitlabPRs: 0,
      lastUpdated: null
    };
  }

  // Method to manually trigger data update
  async forceUpdate () {
    await this.updateData();
  }
}

// Export singleton instance
const backgroundService = new BackgroundService();

export default backgroundService;
