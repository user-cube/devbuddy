const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const ConfigService = require('./services/config.js');
const RedirectorService = require('./services/redirector.js');
const GitHubService = require('./services/github.js');
const GitLabService = require('./services/gitlab.js');
const JiraService = require('./services/jira.js');

let mainWindow;
const configService = new ConfigService();
const redirectorService = new RedirectorService();
const githubService = new GitHubService();
const gitlabService = new GitLabService();
const jiraService = new JiraService();

function createWindow() {
  // Create the browser window
  const preloadPath = path.join(__dirname, './preload.js')
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  createWindow();
  
  // Start the redirector server automatically
  try {
    console.log('Attempting to start redirector server automatically...');
    await redirectorService.startServer();
    console.log('Redirector server started automatically');
  } catch (error) {
    console.error('Failed to start redirector server automatically:', error);
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Stop the redirector server before quitting
    redirectorService.stopServer().then(() => {
      console.log('Redirector server stopped');
      app.quit();
    }).catch((error) => {
      console.error('Error stopping redirector server:', error);
      app.quit();
    });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit to ensure redirector server is stopped
app.on('before-quit', () => {
  redirectorService.stopServer().then(() => {
    console.log('Redirector server stopped on app quit');
  }).catch((error) => {
    console.error('Error stopping redirector server on quit:', error);
  });
});

// IPC handlers for communication between main and renderer processes

// Time and utilities
ipcMain.handle('get-current-time', () => {
  return new Date().toLocaleString();
});

// Configuration management
ipcMain.handle('get-config', () => {
  return configService.loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
  const validation = configService.validateConfig(config);
  if (!validation.isValid) {
    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
  }
  return configService.saveConfig(config);
});

ipcMain.handle('is-configured', () => {
  return configService.isConfigured();
});

// Shortcuts
ipcMain.handle('get-shortcuts', () => {
  return configService.getShortcuts();
});

ipcMain.handle('update-shortcuts', async (event, shortcuts) => {
  return configService.updateShortcuts(shortcuts);
});

ipcMain.handle('open-shortcut', async (event, shortcutName) => {
  try {
    const shortcuts = configService.getShortcuts();
    const shortcut = shortcuts.find(s => s.name === shortcutName);
    
    if (shortcut) {
      await shell.openExternal(shortcut.url);
      return { success: true, message: `Opened ${shortcut.name}` };
    } else {
      return { success: false, message: `Shortcut ${shortcutName} not found` };
    }
  } catch (error) {
    console.error('Error opening shortcut:', error);
    return { success: false, message: 'Error opening shortcut' };
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, message: 'Error opening URL' };
  }
});

// Service configurations
ipcMain.handle('get-jira-config', () => {
  return configService.getJiraConfig();
});

ipcMain.handle('update-jira-config', async (event, jiraConfig) => {
  return configService.updateJiraConfig(jiraConfig);
});

ipcMain.handle('get-github-config', () => {
  return configService.getGithubConfig();
});

ipcMain.handle('update-github-config', async (event, githubConfig) => {
  return configService.updateGithubConfig(githubConfig);
});

ipcMain.handle('get-gitlab-config', () => {
  return configService.getGitlabConfig();
});

ipcMain.handle('update-gitlab-config', async (event, gitlabConfig) => {
  return configService.updateGitlabConfig(gitlabConfig);
});

ipcMain.handle('get-app-config', () => {
  return configService.getAppConfig();
});

ipcMain.handle('update-app-config', async (event, appConfig) => {
  return configService.updateAppConfig(appConfig);
});

// Service data (future implementation)
// Jira service
ipcMain.handle('get-jira-issues', async () => {
  try {
    return await jiraService.getIssues();
  } catch (error) {
    console.error('Error fetching Jira issues:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issue-details', async (event, issueKey) => {
  try {
    return await jiraService.getIssueDetails(issueKey);
  } catch (error) {
    console.error('Error fetching Jira issue details:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issue-comments', async (event, issueKey) => {
  try {
    return await jiraService.getIssueComments(issueKey);
  } catch (error) {
    console.error('Error fetching Jira issue comments:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issue-worklog', async (event, issueKey) => {
  try {
    return await jiraService.getIssueWorklog(issueKey);
  } catch (error) {
    console.error('Error fetching Jira issue worklog:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issue-transitions', async (event, issueKey) => {
  try {
    return await jiraService.getIssueTransitions(issueKey);
  } catch (error) {
    console.error('Error fetching Jira issue transitions:', error);
    throw error;
  }
});

ipcMain.handle('update-jira-issue-status', async (event, issueKey, transitionId) => {
  try {
    return await jiraService.updateIssueStatus(issueKey, transitionId);
  } catch (error) {
    console.error('Error updating Jira issue status:', error);
    throw error;
  }
});

ipcMain.handle('add-jira-comment', async (event, issueKey, comment) => {
  try {
    return await jiraService.addComment(issueKey, comment);
  } catch (error) {
    console.error('Error adding Jira comment:', error);
    throw error;
  }
});

ipcMain.handle('log-jira-work', async (event, issueKey, timeSpent, comment) => {
  try {
    return await jiraService.logWork(issueKey, timeSpent, comment);
  } catch (error) {
    console.error('Error logging Jira work:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-user-info', async () => {
  try {
    return await jiraService.getUserInfo();
  } catch (error) {
    console.error('Error fetching Jira user info:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-projects', async () => {
  try {
    return await jiraService.getProjects();
  } catch (error) {
    console.error('Error fetching Jira projects:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-project-details', async (event, projectKey) => {
  try {
    return await jiraService.getProjectDetails(projectKey);
  } catch (error) {
    console.error('Error fetching Jira project details:', error);
    throw error;
  }
});

ipcMain.handle('search-jira-issues', async (event, jql, maxResults) => {
  try {
    return await jiraService.searchIssues(jql, maxResults);
  } catch (error) {
    console.error('Error searching Jira issues:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issues-by-project', async (event, projectKey, status) => {
  try {
    return await jiraService.getIssuesByProject(projectKey, status);
  } catch (error) {
    console.error('Error fetching Jira issues by project:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issues-by-status', async (event, status) => {
  try {
    return await jiraService.getIssuesByStatus(status);
  } catch (error) {
    console.error('Error fetching Jira issues by status:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issues-by-priority', async (event, priority) => {
  try {
    return await jiraService.getIssuesByPriority(priority);
  } catch (error) {
    console.error('Error fetching Jira issues by priority:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-issue-types', async () => {
  try {
    return await jiraService.getIssueTypes();
  } catch (error) {
    console.error('Error fetching Jira issue types:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-statuses', async () => {
  try {
    return await jiraService.getStatuses();
  } catch (error) {
    console.error('Error fetching Jira statuses:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-priorities', async () => {
  try {
    return await jiraService.getPriorities();
  } catch (error) {
    console.error('Error fetching Jira priorities:', error);
    throw error;
  }
});

ipcMain.handle('create-jira-issue', async (event, projectKey, summary, description, issueType) => {
  try {
    return await jiraService.createIssue(projectKey, summary, description, issueType);
  } catch (error) {
    console.error('Error creating Jira issue:', error);
    throw error;
  }
});

ipcMain.handle('get-github-prs', async () => {
  try {
    return await githubService.getPullRequests();
  } catch (error) {
    console.error('Error fetching GitHub PRs:', error);
    throw error;
  }
});

ipcMain.handle('get-github-pr-details', async (event, prNumber, repo) => {
  try {
    return await githubService.getPullRequestDetails(prNumber, repo);
  } catch (error) {
    console.error('Error fetching GitHub PR details:', error);
    throw error;
  }
});

ipcMain.handle('get-github-pr-reviews', async (event, prNumber, repo) => {
  try {
    return await githubService.getPullRequestReviews(prNumber, repo);
  } catch (error) {
    console.error('Error fetching GitHub PR reviews:', error);
    throw error;
  }
});

ipcMain.handle('get-github-pr-comments', async (event, prNumber, repo) => {
  try {
    return await githubService.getPullRequestComments(prNumber, repo);
  } catch (error) {
    console.error('Error fetching GitHub PR comments:', error);
    throw error;
  }
});

ipcMain.handle('get-github-pr-commits', async (event, prNumber, repo) => {
  try {
    return await githubService.getPullRequestCommits(prNumber, repo);
  } catch (error) {
    console.error('Error fetching GitHub PR commits:', error);
    throw error;
  }
});

ipcMain.handle('get-github-pr-files', async (event, prNumber, repo) => {
  try {
    return await githubService.getPullRequestFiles(prNumber, repo);
  } catch (error) {
    console.error('Error fetching GitHub PR files:', error);
    throw error;
  }
});

ipcMain.handle('review-github-pr', async (event, prNumber, repo, review) => {
  try {
    return await githubService.reviewPullRequest(prNumber, repo, review);
  } catch (error) {
    console.error('Error reviewing GitHub PR:', error);
    throw error;
  }
});

ipcMain.handle('merge-github-pr', async (event, prNumber, repo, mergeMethod) => {
  try {
    return await githubService.mergePullRequest(prNumber, repo, mergeMethod);
  } catch (error) {
    console.error('Error merging GitHub PR:', error);
    throw error;
  }
});

ipcMain.handle('close-github-pr', async (event, prNumber, repo) => {
  try {
    return await githubService.closePullRequest(prNumber, repo);
  } catch (error) {
    console.error('Error closing GitHub PR:', error);
    throw error;
  }
});

ipcMain.handle('get-github-user-info', async () => {
  try {
    return await githubService.getUserInfo();
  } catch (error) {
    console.error('Error fetching GitHub user info:', error);
    throw error;
  }
});

ipcMain.handle('get-github-organizations', async () => {
  try {
    return await githubService.getOrganizations();
  } catch (error) {
    console.error('Error fetching GitHub organizations:', error);
    throw error;
  }
});

ipcMain.handle('get-github-repositories', async (event, org) => {
  try {
    return await githubService.getRepositories(org);
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
});

ipcMain.handle('search-github-prs', async (event, query) => {
  try {
    return await githubService.searchPullRequests(query);
  } catch (error) {
    console.error('Error searching GitHub PRs:', error);
    throw error;
  }
});

ipcMain.handle('get-github-prs-by-repo', async (event, repo, state) => {
  try {
    return await githubService.getPullRequestsByRepo(repo, state);
  } catch (error) {
    console.error('Error fetching GitHub PRs by repo:', error);
    throw error;
  }
});

ipcMain.handle('get-github-prs-by-org', async (event, org, state) => {
  try {
    return await githubService.getPullRequestsByOrg(org, state);
  } catch (error) {
    console.error('Error fetching GitHub PRs by org:', error);
    throw error;
  }
});

// GitLab service
ipcMain.handle('get-gitlab-mrs', async () => {
  try {
    return await gitlabService.getMergeRequests();
  } catch (error) {
    console.error('Error fetching GitLab MRs:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mr-details', async (event, mrId, projectId) => {
  try {
    return await gitlabService.getMergeRequestDetails(mrId, projectId);
  } catch (error) {
    console.error('Error fetching GitLab MR details:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mr-reviews', async (event, mrId, projectId) => {
  try {
    return await gitlabService.getMergeRequestReviews(mrId, projectId);
  } catch (error) {
    console.error('Error fetching GitLab MR reviews:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mr-comments', async (event, mrId, projectId) => {
  try {
    return await gitlabService.getMergeRequestComments(mrId, projectId);
  } catch (error) {
    console.error('Error fetching GitLab MR comments:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mr-commits', async (event, mrId, projectId) => {
  try {
    return await gitlabService.getMergeRequestCommits(mrId, projectId);
  } catch (error) {
    console.error('Error fetching GitLab MR commits:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mr-changes', async (event, mrId, projectId) => {
  try {
    return await gitlabService.getMergeRequestChanges(mrId, projectId);
  } catch (error) {
    console.error('Error fetching GitLab MR changes:', error);
    throw error;
  }
});

ipcMain.handle('approve-gitlab-mr', async (event, mrId, projectId) => {
  try {
    return await gitlabService.approveMergeRequest(mrId, projectId);
  } catch (error) {
    console.error('Error approving GitLab MR:', error);
    throw error;
  }
});

ipcMain.handle('merge-gitlab-mr', async (event, mrId, projectId, mergeMethod) => {
  try {
    return await gitlabService.mergeMergeRequest(mrId, projectId, mergeMethod);
  } catch (error) {
    console.error('Error merging GitLab MR:', error);
    throw error;
  }
});

ipcMain.handle('close-gitlab-mr', async (event, mrId, projectId) => {
  try {
    return await gitlabService.closeMergeRequest(mrId, projectId);
  } catch (error) {
    console.error('Error closing GitLab MR:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-user-info', async () => {
  try {
    return await gitlabService.getUserInfo();
  } catch (error) {
    console.error('Error fetching GitLab user info:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-groups', async () => {
  try {
    return await gitlabService.getGroups();
  } catch (error) {
    console.error('Error fetching GitLab groups:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-projects', async (event, groupId) => {
  try {
    return await gitlabService.getProjects(groupId);
  } catch (error) {
    console.error('Error fetching GitLab projects:', error);
    throw error;
  }
});

ipcMain.handle('search-gitlab-mrs', async (event, query) => {
  try {
    return await gitlabService.searchMergeRequests(query);
  } catch (error) {
    console.error('Error searching GitLab MRs:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mrs-by-project', async (event, projectId, state) => {
  try {
    return await gitlabService.getMergeRequestsByProject(projectId, state);
  } catch (error) {
    console.error('Error fetching GitLab MRs by project:', error);
    throw error;
  }
});

ipcMain.handle('get-gitlab-mrs-by-group', async (event, groupId, state) => {
  try {
    return await gitlabService.getMergeRequestsByGroup(groupId, state);
  } catch (error) {
    console.error('Error fetching GitLab MRs by group:', error);
    throw error;
  }
});

// Cache management
ipcMain.handle('clear-cache', async () => {
  try {
    githubService.cacheService.clear();
    gitlabService.cacheService.clear();
    jiraService.cacheService.clear();
    return { success: true, message: 'Cache cleared successfully' };
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
});

ipcMain.handle('get-cache-stats', async () => {
  try {
    return {
      github: githubService.cacheService.getStats(),
      gitlab: gitlabService.cacheService.getStats(),
      jira: jiraService.cacheService.getStats()
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    throw error;
  }
});

// Redirector service
ipcMain.handle('get-redirects', () => {
  return redirectorService.getRedirects();
});

ipcMain.handle('update-redirects', async (event, redirects) => {
  return redirectorService.updateRedirects(redirects);
});

ipcMain.handle('add-redirect', async (event, domain, path, targetUrl) => {
  return redirectorService.addRedirect(domain, path, targetUrl);
});

ipcMain.handle('remove-redirect', async (event, domain, path) => {
  return redirectorService.removeRedirect(domain, path);
});

ipcMain.handle('start-redirector-server', () => {
  redirectorService.startServer();
  return redirectorService.getServerStatus();
});

ipcMain.handle('stop-redirector-server', () => {
  redirectorService.stopServer();
  return redirectorService.getServerStatus();
});

ipcMain.handle('get-redirector-status', () => {
  return redirectorService.getServerStatus();
});

ipcMain.handle('update-redirector-port', async (event, newPort) => {
  return redirectorService.updatePort(newPort);
});