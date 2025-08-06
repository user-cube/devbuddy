const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Time and utilities
  getCurrentTime: () => ipcRenderer.invoke('get-current-time'),
  
  // Configuration management
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  isConfigured: () => ipcRenderer.invoke('is-configured'),
  
  // Shortcuts
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  updateShortcuts: (shortcuts) => ipcRenderer.invoke('update-shortcuts', shortcuts),
  openShortcut: (shortcut) => ipcRenderer.invoke('open-shortcut', shortcut),
  
  // Service configurations
  getJiraConfig: () => ipcRenderer.invoke('get-jira-config'),
  updateJiraConfig: (config) => ipcRenderer.invoke('update-jira-config', config),
  
  getGithubConfig: () => ipcRenderer.invoke('get-github-config'),
  updateGithubConfig: (config) => ipcRenderer.invoke('update-github-config', config),
  
  getGitlabConfig: () => ipcRenderer.invoke('get-gitlab-config'),
  updateGitlabConfig: (config) => ipcRenderer.invoke('update-gitlab-config', config),
  
  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  updateAppConfig: (config) => ipcRenderer.invoke('update-app-config', config),
  
  // Services
  getJiraTasks: () => ipcRenderer.invoke('get-jira-tasks'),
  
  // GitHub service
  getGithubPRs: () => ipcRenderer.invoke('get-github-prs'),
  getGithubPRDetails: (prNumber, repo) => ipcRenderer.invoke('get-github-pr-details', prNumber, repo),
  getGithubPRReviews: (prNumber, repo) => ipcRenderer.invoke('get-github-pr-reviews', prNumber, repo),
  getGithubPRComments: (prNumber, repo) => ipcRenderer.invoke('get-github-pr-comments', prNumber, repo),
  getGithubPRCommits: (prNumber, repo) => ipcRenderer.invoke('get-github-pr-commits', prNumber, repo),
  getGithubPRFiles: (prNumber, repo) => ipcRenderer.invoke('get-github-pr-files', prNumber, repo),
  reviewGithubPR: (prNumber, repo, review) => ipcRenderer.invoke('review-github-pr', prNumber, repo, review),
  mergeGithubPR: (prNumber, repo, mergeMethod) => ipcRenderer.invoke('merge-github-pr', prNumber, repo, mergeMethod),
  closeGithubPR: (prNumber, repo) => ipcRenderer.invoke('close-github-pr', prNumber, repo),
  getGithubUserInfo: () => ipcRenderer.invoke('get-github-user-info'),
  getGithubOrganizations: () => ipcRenderer.invoke('get-github-organizations'),
  getGithubRepositories: (org) => ipcRenderer.invoke('get-github-repositories', org),
  searchGithubPRs: (query) => ipcRenderer.invoke('search-github-prs', query),
  getGithubPRsByRepo: (repo, state) => ipcRenderer.invoke('get-github-prs-by-repo', repo, state),
  getGithubPRsByOrg: (org, state) => ipcRenderer.invoke('get-github-prs-by-org', org, state),
  
  // GitLab service
  getGitlabMRs: () => ipcRenderer.invoke('get-gitlab-mrs'),
  getGitlabMRDetails: (mrId, projectId) => ipcRenderer.invoke('get-gitlab-mr-details', mrId, projectId),
  getGitlabMRReviews: (mrId, projectId) => ipcRenderer.invoke('get-gitlab-mr-reviews', mrId, projectId),
  getGitlabMRComments: (mrId, projectId) => ipcRenderer.invoke('get-gitlab-mr-comments', mrId, projectId),
  getGitlabMRCommits: (mrId, projectId) => ipcRenderer.invoke('get-gitlab-mr-commits', mrId, projectId),
  getGitlabMRChanges: (mrId, projectId) => ipcRenderer.invoke('get-gitlab-mr-changes', mrId, projectId),
  approveGitlabMR: (mrId, projectId) => ipcRenderer.invoke('approve-gitlab-mr', mrId, projectId),
  mergeGitlabMR: (mrId, projectId, mergeMethod) => ipcRenderer.invoke('merge-gitlab-mr', mrId, projectId, mergeMethod),
  closeGitlabMR: (mrId, projectId) => ipcRenderer.invoke('close-gitlab-mr', mrId, projectId),
  getGitlabUserInfo: () => ipcRenderer.invoke('get-gitlab-user-info'),
  getGitlabGroups: () => ipcRenderer.invoke('get-gitlab-groups'),
  getGitlabProjects: (groupId) => ipcRenderer.invoke('get-gitlab-projects', groupId),
  searchGitlabMRs: (query) => ipcRenderer.invoke('search-gitlab-mrs', query),
  getGitlabMRsByProject: (projectId, state) => ipcRenderer.invoke('get-gitlab-mrs-by-project', projectId, state),
  getGitlabMRsByGroup: (groupId, state) => ipcRenderer.invoke('get-gitlab-mrs-by-group', groupId, state),
  
  // Open external links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Redirector service
  getRedirects: () => ipcRenderer.invoke('get-redirects'),
  updateRedirects: (redirects) => ipcRenderer.invoke('update-redirects', redirects),
  addRedirect: (domain, path, targetUrl) => ipcRenderer.invoke('add-redirect', domain, path, targetUrl),
  removeRedirect: (domain, path) => ipcRenderer.invoke('remove-redirect', domain, path),
  startRedirectorServer: () => ipcRenderer.invoke('start-redirector-server'),
  stopRedirectorServer: () => ipcRenderer.invoke('stop-redirector-server'),
  getRedirectorStatus: () => ipcRenderer.invoke('get-redirector-status'),
  updateRedirectorPort: (newPort) => ipcRenderer.invoke('update-redirector-port', newPort),
}); 