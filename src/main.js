const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ConfigService = require('./services/config.js');
const BookmarksService = require('./services/bookmarks.js');
const RedirectorService = require('./services/redirector.js');
const GitHubService = require('./services/github.js');
const GitLabService = require('./services/gitlab.js');
const JiraService = require('./services/jira.js');
const RepositoriesService = require('./services/repositories.js');

let mainWindow;
const configService = new ConfigService();
const bookmarksService = new BookmarksService();
const redirectorService = new RedirectorService();
const githubService = new GitHubService();
const gitlabService = new GitLabService();
const jiraService = new JiraService();
const repositoriesService = RepositoriesService;

// Global state for app initialization
let appInitialized = false;
let initializationPromise = null;

// Background refresh system
let backgroundRefreshInterval = null;
let lastRefreshTime = Date.now();

// Start background refresh system
function startBackgroundRefresh() {
  // Clear existing interval if any
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval);
  }

  const config = configService.loadConfig();
  
  // Check if background refresh is enabled
  if (config.app.backgroundRefresh === false) {
    console.log('🛑 Background refresh disabled in configuration');
    return;
  }

  const refreshInterval = Math.min(
    config.app.updateInterval || 300, // Default 5 minutes
    config.github.refreshInterval || 300,
    config.gitlab.refreshInterval || 300,
    config.jira.refreshInterval || 300
  ) * 1000; // Convert to milliseconds

  console.log(`🔄 Starting background refresh every ${refreshInterval / 1000} seconds`);

  backgroundRefreshInterval = setInterval(async () => {
    try {
      console.log('🔄 Background refresh triggered');
      await performBackgroundRefresh();
      lastRefreshTime = Date.now();
    } catch (error) {
      console.error('❌ Background refresh failed:', error);
    }
  }, refreshInterval);

  // Also check cache expiration every minute
  setInterval(async () => {
    try {
      await checkAndRefreshExpiredCache();
    } catch (error) {
      console.error('❌ Cache expiration check failed:', error);
    }
  }, 60000); // Check every minute
}

// Stop background refresh system
function stopBackgroundRefresh() {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval);
    backgroundRefreshInterval = null;
    console.log('🛑 Background refresh stopped');
  }
}

// Perform background refresh of all enabled services
async function performBackgroundRefresh() {
  const config = configService.loadConfig();
  const promises = [];

  // Refresh GitHub data if enabled
  if (config.github.enabled && config.github.apiToken) {
    console.log('🔄 Background refreshing GitHub data...');
    promises.push(
      githubService.getPullRequests().catch(err => {
        console.log('GitHub background refresh failed:', err.message);
        return null;
      })
    );
  }

  // Refresh GitLab data if enabled
  if (config.gitlab.enabled && config.gitlab.apiToken) {
    console.log('🔄 Background refreshing GitLab data...');
    promises.push(
      gitlabService.getMergeRequests().catch(err => {
        console.log('GitLab background refresh failed:', err.message);
        return null;
      })
    );
  }

  // Refresh Jira data if enabled
  if (config.jira.enabled && config.jira.apiToken) {
    console.log('🔄 Background refreshing Jira data...');
    promises.push(
      jiraService.getIssues().catch(err => {
        console.log('Jira background refresh failed:', err.message);
        return null;
      })
    );
  }

  // Wait for all refreshes to complete (with timeout)
  const timeout = 30000; // 30 seconds timeout for background refresh
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Background refresh timeout')), timeout);
  });

  await Promise.race([
    Promise.allSettled(promises),
    timeoutPromise
  ]);

  console.log('✅ Background refresh completed');

  // Notify renderer about the refresh
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('background-refresh-completed', {
      timestamp: Date.now(),
      services: {
        github: config.github.enabled,
        gitlab: config.gitlab.enabled,
        jira: config.jira.enabled
      }
    });
  }
}

// Check for expired cache and refresh if needed
async function checkAndRefreshExpiredCache() {
  const config = configService.loadConfig();
  let needsRefresh = false;

  // Check GitHub cache
  if (config.github.enabled && config.github.apiToken) {
    const cacheKey = `github_prs_${config.github.username}`;
    if (!githubService.cacheService.has(cacheKey)) {
      console.log('🔄 GitHub cache expired, triggering refresh...');
      needsRefresh = true;
    }
  }

  // Check GitLab cache
  if (config.gitlab.enabled && config.gitlab.apiToken) {
    const cacheKey = `gitlab_mrs_${config.gitlab.username}`;
    if (!gitlabService.cacheService.has(cacheKey)) {
      console.log('🔄 GitLab cache expired, triggering refresh...');
      needsRefresh = true;
    }
  }

  // Check Jira cache
  if (config.jira.enabled && config.jira.apiToken) {
    const cacheKey = `jira_issues_${config.jira.username}`;
    if (!jiraService.cacheService.has(cacheKey)) {
      console.log('🔄 Jira cache expired, triggering refresh...');
      needsRefresh = true;
    }
  }

  if (needsRefresh) {
    await performBackgroundRefresh();
  }
}

// Initialize app data when the app starts
async function initializeAppData() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('🚀 Initializing app data...');
      
      const config = configService.loadConfig();
      const promises = [];

      // Initialize GitHub data if enabled
      if (config.github.enabled && config.github.apiToken) {
        console.log('📦 Pre-loading GitHub data...');
        promises.push(
          githubService.getPullRequests().catch(err => {
            console.log('GitHub pre-load failed:', err.message);
            return null;
          })
        );
      }

      // Initialize GitLab data if enabled
      if (config.gitlab.enabled && config.gitlab.apiToken) {
        console.log('📦 Pre-loading GitLab data...');
        promises.push(
          gitlabService.getMergeRequests().catch(err => {
            console.log('GitLab pre-load failed:', err.message);
            return null;
          })
        );
      }

      // Initialize Jira data if enabled
      if (config.jira.enabled && config.jira.apiToken) {
        console.log('📦 Pre-loading Jira data...');
        promises.push(
          jiraService.getIssues().catch(err => {
            console.log('Jira pre-load failed:', err.message);
            return null;
          })
        );
      }

      // Wait for all data to load (with timeout)
      const timeout = 15000; // 15 seconds timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), timeout);
      });

      await Promise.race([
        Promise.allSettled(promises),
        timeoutPromise
      ]);

      appInitialized = true;
      console.log('✅ App data initialization completed');
      
      // Start background refresh after initialization
      startBackgroundRefresh();
      
      // Notify renderer that initialization is complete
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('app-initialized');
      }

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      appInitialized = true; // Mark as initialized even if failed
      
      // Start background refresh even if initialization failed
      startBackgroundRefresh();
      
      // Notify renderer that initialization is complete (even with errors)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('app-initialized', { error: error.message });
      }
    }
  })();

  return initializationPromise;
}

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
    icon: path.join(__dirname, 'assets/devbuddy.icns'),
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
    // In production, load the built files with hash route to ensure home page loads
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'), {
      hash: '/'
    });
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Start data initialization after window is shown
    initializeAppData();
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
      stopBackgroundRefresh();
      app.quit();
    }).catch((error) => {
      console.error('Error stopping redirector server:', error);
      stopBackgroundRefresh();
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
  stopBackgroundRefresh();
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
  try {
    const validation = configService.validateConfig(config);
    if (!validation.isValid) {
      console.warn('Configuration validation warnings:', validation.errors);
      // Don't throw error, just log warnings
    }
    
    const success = configService.saveConfig(config);
    if (success) {
      return { success: true, message: 'Configuration saved successfully' };
    } else {
      throw new Error('Failed to save configuration');
    }
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
});

ipcMain.handle('is-configured', () => {
  return configService.isConfigured();
});

// Shortcuts
ipcMain.handle('get-bookmarks', () => {
  return bookmarksService.getBookmarks();
});

ipcMain.handle('get-all-bookmarks', () => {
  return bookmarksService.getAllBookmarks();
});

ipcMain.handle('update-bookmarks', async (event, bookmarks) => {
  return bookmarksService.updateBookmarks(bookmarks);
});

// Category management
ipcMain.handle('add-bookmark-category', async (event, category) => {
  return bookmarksService.addCategory(category);
});

ipcMain.handle('update-bookmark-category', async (event, categoryId, updatedCategory) => {
  return bookmarksService.updateCategory(categoryId, updatedCategory);
});

ipcMain.handle('delete-bookmark-category', async (event, categoryId) => {
  return bookmarksService.deleteCategory(categoryId);
});

// Bookmark management
ipcMain.handle('add-bookmark', async (event, categoryId, bookmark) => {
  return bookmarksService.addBookmark(categoryId, bookmark);
});

ipcMain.handle('update-bookmark', async (event, categoryId, bookmarkId, updatedBookmark) => {
  return bookmarksService.updateBookmark(categoryId, bookmarkId, updatedBookmark);
});

ipcMain.handle('delete-bookmark', async (event, categoryId, bookmarkId) => {
  return bookmarksService.deleteBookmark(categoryId, bookmarkId);
});

ipcMain.handle('open-bookmark', async (event, bookmarkId) => {
  try {
    const bookmark = bookmarksService.getBookmarkById(bookmarkId);
    
    if (bookmark) {
      if (bookmark.filePath) {
        // Open local file with default system application
        await shell.openPath(bookmark.filePath);
        return { success: true, message: `Opened file: ${bookmark.name}` };
      } else if (bookmark.url) {
        // Open URL in default browser
        await shell.openExternal(bookmark.url);
        return { success: true, message: `Opened ${bookmark.name} in browser` };
      } else {
        return { success: false, message: 'Bookmark has no URL or file path' };
      }
    } else {
      return { success: false, message: `Bookmark ${bookmarkId} not found` };
    }
  } catch (error) {
    console.error('Error opening bookmark:', error);
    return { success: false, message: 'Error opening bookmark' };
  }
});

// Migration from old shortcuts
ipcMain.handle('migrate-shortcuts-to-bookmarks', async (event) => {
  try {
    const oldShortcuts = configService.getShortcuts();
    const migratedBookmarks = bookmarksService.migrateFromShortcuts(oldShortcuts);
    return { success: true, migratedBookmarks };
  } catch (error) {
    console.error('Error migrating shortcuts to bookmarks:', error);
    return { success: false, error: error.message };
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

ipcMain.handle('select-file', async (event) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Select a file to bookmark'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { 
        success: true, 
        filePath: result.filePaths[0],
        fileName: path.basename(result.filePaths[0])
      };
    } else {
      return { success: false, message: 'No file selected' };
    }
  } catch (error) {
    console.error('Error selecting file:', error);
    return { success: false, message: 'Error selecting file' };
  }
});

ipcMain.handle('select-folder', async (event) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select a folder to scan for repositories'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { 
        success: true, 
        folderPath: result.filePaths[0]
      };
    } else {
      return { success: false, message: 'No folder selected' };
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
    return { success: false, message: 'Error selecting folder' };
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

ipcMain.handle('get-jira-available-statuses', async () => {
  try {
    return await jiraService.getAvailableStatuses();
  } catch (error) {
    console.error('Error fetching Jira available statuses:', error);
    throw error;
  }
});

ipcMain.handle('get-jira-statuses-by-project', async (event, projectKey) => {
  try {
    return await jiraService.getStatusesByProject(projectKey);
  } catch (error) {
    console.error('Error fetching Jira project statuses:', error);
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

// App initialization
ipcMain.handle('is-app-initialized', () => {
  return appInitialized;
});

ipcMain.handle('wait-for-initialization', async () => {
  if (appInitialized) {
    return { initialized: true };
  }
  
  return new Promise((resolve) => {
    const checkInitialization = () => {
      if (appInitialized) {
        resolve({ initialized: true });
      } else {
        setTimeout(checkInitialization, 100);
      }
    };
    checkInitialization();
  });
});

ipcMain.handle('force-initialization', async () => {
  try {
    await initializeAppData();
    return { success: true, message: 'App data initialized successfully' };
  } catch (error) {
    console.error('Error forcing initialization:', error);
    throw error;
  }
});

ipcMain.handle('trigger-background-refresh', async () => {
  try {
    await performBackgroundRefresh();
    return { success: true, message: 'Background refresh completed successfully' };
  } catch (error) {
    console.error('Error triggering background refresh:', error);
    throw error;
  }
});

ipcMain.handle('get-background-refresh-status', () => {
  return {
    isRunning: backgroundRefreshInterval !== null,
    lastRefreshTime,
    nextRefreshTime: lastRefreshTime + (configService.loadConfig().app.updateInterval || 300) * 1000
  };
});

ipcMain.handle('start-background-refresh', () => {
  try {
    startBackgroundRefresh();
    return { success: true, message: 'Background refresh started' };
  } catch (error) {
    console.error('Error starting background refresh:', error);
    throw error;
  }
});

ipcMain.handle('stop-background-refresh', () => {
  try {
    stopBackgroundRefresh();
    return { success: true, message: 'Background refresh stopped' };
  } catch (error) {
    console.error('Error stopping background refresh:', error);
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

ipcMain.handle('clear-github-cache', async () => {
  try {
    githubService.cacheService.clear();
    return { success: true, message: 'GitHub cache cleared successfully' };
  } catch (error) {
    console.error('Error clearing GitHub cache:', error);
    throw error;
  }
});

ipcMain.handle('clear-gitlab-cache', async () => {
  try {
    gitlabService.cacheService.clear();
    return { success: true, message: 'GitLab cache cleared successfully' };
  } catch (error) {
    console.error('Error clearing GitLab cache:', error);
    throw error;
  }
});

ipcMain.handle('clear-jira-cache', async () => {
  try {
    jiraService.cacheService.clear();
    return { success: true, message: 'Jira cache cleared successfully' };
  } catch (error) {
    console.error('Error clearing Jira cache:', error);
    throw error;
  }
});

ipcMain.handle('open-jira-status-config', async () => {
  try {
    // This will be handled by the renderer process to show the status config
    return { success: true, message: 'Opening Jira status configuration' };
  } catch (error) {
    console.error('Error opening Jira status config:', error);
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

// Configuration import/export
ipcMain.handle('export-config', async () => {
  try {
    const config = configService.loadConfig();
    const shortcuts = configService.loadShortcuts();
    const redirects = redirectorService.getRedirects();
    const bookmarks = bookmarksService.getBookmarks();

    // Read repositories configuration from repositories.yml (separate from main config)
    let repositoriesConfig = { enabled: false, directories: [], scanDepth: 3, repositories: [], lastScan: null };
    try {
      const yaml = require('js-yaml');
      const repositoriesConfigPath = path.join(os.homedir(), '.devbuddy', 'repositories.yml');
      if (fs.existsSync(repositoriesConfigPath)) {
        const data = fs.readFileSync(repositoriesConfigPath, 'utf8');
        repositoriesConfig = yaml.load(data) || repositoriesConfig;
      }
    } catch (error) {
      console.warn('Unable to read repositories configuration for export:', error.message);
    }
    
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      config,
      shortcuts,
      redirects,
      bookmarks,
      repositoriesConfig
    };

    // Get desktop path for default save location
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const defaultFileName = `devbuddy-config-${new Date().toISOString().split('T')[0]}.json`;

    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export DevBuddy Configuration',
      defaultPath: path.join(desktopPath, defaultFileName),
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
      return { success: true, filePath: result.filePath };
    } else {
      return { success: false, message: 'Export cancelled' };
    }
  } catch (error) {
    console.error('Error exporting config:', error);
    throw error;
  }
});

ipcMain.handle('import-config', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import DevBuddy Configuration',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: 'Import cancelled' };
    }

    const filePath = result.filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const importData = JSON.parse(fileContent);

    // Validate minimal import data structure (require config; others optional for compatibility)
    if (!importData.config) {
      return { success: false, error: 'Invalid configuration file format (missing config)' };
    }

    // Validate version compatibility
    if (importData.version && importData.version !== '1.0.0') {
      console.warn('Importing configuration from different version:', importData.version);
    }

    // Backup current configuration
    const backupDir = path.join(os.homedir(), '.devbuddy', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const backupPath = path.join(backupDir, backupFileName);

    const currentConfig = {
      config: configService.loadConfig(),
      shortcuts: configService.loadShortcuts(),
      redirects: redirectorService.getRedirects(),
      bookmarks: (() => { try { return bookmarksService.getBookmarks(); } catch { return null } })(),
      repositoriesConfig: (() => {
        try {
          const yaml = require('js-yaml');
          const repositoriesConfigPath = path.join(os.homedir(), '.devbuddy', 'repositories.yml');
          if (fs.existsSync(repositoriesConfigPath)) {
            const data = fs.readFileSync(repositoriesConfigPath, 'utf8');
            return yaml.load(data) || { enabled: false, directories: [], scanDepth: 3 };
          }
        } catch (_) {}
        return { enabled: false, directories: [], scanDepth: 3 };
      })()
    };

    fs.writeFileSync(backupPath, JSON.stringify(currentConfig, null, 2));

    // Import new configuration
    configService.saveConfig(importData.config);
    if (importData.shortcuts) configService.saveShortcuts(importData.shortcuts);
    if (importData.redirects) redirectorService.updateRedirects(importData.redirects);

    // Import bookmarks (preferred). If absent, try migrating from shortcuts
    try {
      if (importData.bookmarks) {
        bookmarksService.updateBookmarks(importData.bookmarks);
      } else if (importData.shortcuts) {
        bookmarksService.migrateFromShortcuts(importData.shortcuts);
      }
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      // continue
    }
    
    // Import repositories configuration if present
    try {
      if (importData.repositoriesConfig) {
        const yaml = require('js-yaml');
        const repositoriesConfigPath = path.join(os.homedir(), '.devbuddy', 'repositories.yml');
        const configDir = path.dirname(repositoriesConfigPath);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        const yamlData = yaml.dump(importData.repositoriesConfig, {
          indent: 2,
          lineWidth: 120,
          noRefs: true
        });
        fs.writeFileSync(repositoriesConfigPath, yamlData, 'utf8');
      }
    } catch (error) {
      console.error('Error importing repositories configuration:', error);
      // Do not fail the whole import; proceed with other parts
    }

    return { 
      success: true, 
      message: 'Configuration imported successfully',
      backupPath
    };
  } catch (error) {
    console.error('Error importing config:', error);
    return { success: false, error: error.message };
  }
});

// Repositories handlers
ipcMain.handle('get-repositories-config', async () => {
  try {
    // Load from repositories.yml instead of repositories-config.json
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');
    const yaml = require('js-yaml');
    
    const repositoriesConfigPath = path.join(os.homedir(), '.devbuddy', 'repositories.yml');
    
    try {
      const data = await fs.readFile(repositoriesConfigPath, 'utf8');
      const config = yaml.load(data);
      return config || { enabled: false, directories: [], scanDepth: 3 };
    } catch (error) {
      // Return default config if file doesn't exist
      return { enabled: false, directories: [], scanDepth: 3 };
    }
  } catch (error) {
    console.error('Error getting repositories config:', error);
    throw error;
  }
});

ipcMain.handle('update-repositories-config', async (event, config) => {
  try {
    // Save to repositories.yml instead of repositories-config.json
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');
    const yaml = require('js-yaml');
    
    const repositoriesConfigPath = path.join(os.homedir(), '.devbuddy', 'repositories.yml');
    
    // Ensure config directory exists
    const configDir = path.dirname(repositoriesConfigPath);
    await fs.mkdir(configDir, { recursive: true });
    
    // Load existing config to preserve repositories list
    let existingConfig = {};
    try {
      if (await fs.access(repositoriesConfigPath).then(() => true).catch(() => false)) {
        const data = await fs.readFile(repositoriesConfigPath, 'utf8');
        existingConfig = yaml.load(data) || {};
      }
    } catch (error) {
      // If file doesn't exist or can't be read, start with empty config
      existingConfig = {};
    }
    
    // Update config with new settings while preserving repositories
    const updatedConfig = {
      ...existingConfig,
      enabled: config.enabled,
      scanDepth: config.scanDepth,
      directories: config.directories
      // Keep existing repositories and lastScan
    };
    
    const yamlData = yaml.dump(updatedConfig, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
    
    await fs.writeFile(repositoriesConfigPath, yamlData);
    return { success: true };
  } catch (error) {
    console.error('Error updating repositories config:', error);
    throw error;
  }
});

ipcMain.handle('get-repositories', async () => {
  try {
    return await repositoriesService.getCachedRepositories();
  } catch (error) {
    console.error('Error getting repositories:', error);
    return [];
  }
});

ipcMain.handle('get-repositories-for-directory', async (event, directoryPath, tag) => {
  try {
    const directory = { path: directoryPath, tag, enabled: true };
    return await repositoriesService.scanForRepositories([directory], 3);
  } catch (error) {
    console.error('Error getting repositories for directory:', error);
    throw error;
  }
});

ipcMain.handle('get-folders-in-directory', async (event, directoryPath) => {
  try {
    return await repositoriesService.getFoldersInDirectory(directoryPath);
  } catch (error) {
    console.error('Error getting folders in directory:', error);
    throw error;
  }
});

ipcMain.handle('get-repository-info', async (event, folderPath, tag) => {
  try {
    return await repositoriesService.getRepositoryInfo(folderPath, tag);
  } catch (error) {
    console.error('Error getting repository info:', error);
    throw error;
  }
});

ipcMain.handle('get-repository-commits', async (event, folderPath) => {
  try {
    return await repositoriesService.getRepositoryCommits(folderPath);
  } catch (error) {
    console.error('Error getting repository commits:', error);
    throw error;
  }
});

ipcMain.handle('open-repository', async (event, repoPath) => {
  try {
    return await repositoriesService.openRepository(repoPath);
  } catch (error) {
    console.error('Error opening repository:', error);
    throw error;
  }
});

ipcMain.handle('open-repository-in-editor', async (event, repoPath) => {
  try {
    return await repositoriesService.openRepositoryInEditor(repoPath);
  } catch (error) {
    console.error('Error opening repository in editor:', error);
    throw error;
  }
});

// Cache handlers
  ipcMain.handle('get-repositories-cache-status', async () => {
    try {
      return await repositoriesService.getCacheStatus();
    } catch (error) {
      console.error('Error getting repositories status:', error);
      return { repositoryCount: 0, lastUpdated: null };
    }
  });

  ipcMain.handle('refresh-repositories-cache-in-background', async () => {
    try {
      return await repositoriesService.refreshCacheInBackground();
    } catch (error) {
      console.error('Error refreshing repositories:', error);
      return { success: false, error: error.message };
    }
  });