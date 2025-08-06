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
  getGithubPRs: () => ipcRenderer.invoke('get-github-prs'),
  getGitlabPRs: () => ipcRenderer.invoke('get-gitlab-prs'),
  
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