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

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  getAllBookmarks: () => ipcRenderer.invoke('get-all-bookmarks'),
  updateBookmarks: (bookmarks) => ipcRenderer.invoke('update-bookmarks', bookmarks),

  // Category management
  addBookmarkCategory: (category) => ipcRenderer.invoke('add-bookmark-category', category),
  updateBookmarkCategory: (categoryId, updatedCategory) => ipcRenderer.invoke('update-bookmark-category', categoryId, updatedCategory),
  deleteBookmarkCategory: (categoryId) => ipcRenderer.invoke('delete-bookmark-category', categoryId),

  // Bookmark management
  addBookmark: (categoryId, bookmark) => ipcRenderer.invoke('add-bookmark', categoryId, bookmark),
  updateBookmark: (categoryId, bookmarkId, updatedBookmark) => ipcRenderer.invoke('update-bookmark', categoryId, bookmarkId, updatedBookmark),
  deleteBookmark: (categoryId, bookmarkId) => ipcRenderer.invoke('delete-bookmark', categoryId, bookmarkId),
  openBookmark: (bookmarkId) => ipcRenderer.invoke('open-bookmark', bookmarkId),
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Migration
  migrateShortcutsToBookmarks: () => ipcRenderer.invoke('migrate-shortcuts-to-bookmarks'),

  // Service configurations
  getJiraConfig: () => ipcRenderer.invoke('get-jira-config'),
  updateJiraConfig: (config) => ipcRenderer.invoke('update-jira-config', config),

  getGithubConfig: () => ipcRenderer.invoke('get-github-config'),
  updateGithubConfig: (config) => ipcRenderer.invoke('update-github-config', config),

  getGitlabConfig: () => ipcRenderer.invoke('get-gitlab-config'),
  updateGitlabConfig: (config) => ipcRenderer.invoke('update-gitlab-config', config),

  getBitbucketConfig: () => ipcRenderer.invoke('get-bitbucket-config'),
  updateBitbucketConfig: (config) => ipcRenderer.invoke('update-bitbucket-config', config),

  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  updateAppConfig: (config) => ipcRenderer.invoke('update-app-config', config),

  // Jira service
  getJiraIssues: () => ipcRenderer.invoke('get-jira-issues'),
  getJiraIssueDetails: (issueKey) => ipcRenderer.invoke('get-jira-issue-details', issueKey),
  getJiraIssueComments: (issueKey) => ipcRenderer.invoke('get-jira-issue-comments', issueKey),
  getJiraIssueWorklog: (issueKey) => ipcRenderer.invoke('get-jira-issue-worklog', issueKey),
  getJiraIssueTransitions: (issueKey) => ipcRenderer.invoke('get-jira-issue-transitions', issueKey),
  updateJiraIssueStatus: (issueKey, transitionId) => ipcRenderer.invoke('update-jira-issue-status', issueKey, transitionId),
  addJiraComment: (issueKey, comment) => ipcRenderer.invoke('add-jira-comment', issueKey, comment),
  logJiraWork: (issueKey, timeSpent, comment) => ipcRenderer.invoke('log-jira-work', issueKey, timeSpent, comment),
  getJiraUserInfo: () => ipcRenderer.invoke('get-jira-user-info'),
  getJiraProjects: () => ipcRenderer.invoke('get-jira-projects'),
  getJiraProjectDetails: (projectKey) => ipcRenderer.invoke('get-jira-project-details', projectKey),
  searchJiraIssues: (jql, maxResults) => ipcRenderer.invoke('search-jira-issues', jql, maxResults),
  getJiraIssuesByProject: (projectKey, status) => ipcRenderer.invoke('get-jira-issues-by-project', projectKey, status),
  getJiraIssuesByStatus: (status) => ipcRenderer.invoke('get-jira-issues-by-status', status),
  getJiraIssuesByPriority: (priority) => ipcRenderer.invoke('get-jira-issues-by-priority', priority),
  getJiraIssueTypes: () => ipcRenderer.invoke('get-jira-issue-types'),
  getJiraStatuses: () => ipcRenderer.invoke('get-jira-statuses'),
  getJiraAvailableStatuses: () => ipcRenderer.invoke('get-jira-available-statuses'),
  getJiraStatusesByProject: (projectKey) => ipcRenderer.invoke('get-jira-statuses-by-project', projectKey),
  getJiraPriorities: () => ipcRenderer.invoke('get-jira-priorities'),
  createJiraIssue: (projectKey, summary, description, issueType) => ipcRenderer.invoke('create-jira-issue', projectKey, summary, description, issueType),

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

  // Bitbucket service
  getBitbucketPRs: () => ipcRenderer.invoke('get-bitbucket-prs'),
  getBitbucketPRDetails: (prId, repoSlug) => ipcRenderer.invoke('get-bitbucket-pr-details', prId, repoSlug),
  getBitbucketPRReviews: (prId, repoSlug) => ipcRenderer.invoke('get-bitbucket-pr-reviews', prId, repoSlug),
  getBitbucketPRComments: (prId, repoSlug) => ipcRenderer.invoke('get-bitbucket-pr-comments', prId, repoSlug),
  getBitbucketPRCommits: (prId, repoSlug) => ipcRenderer.invoke('get-bitbucket-pr-commits', prId, repoSlug),
  getBitbucketPRChanges: (prId, repoSlug) => ipcRenderer.invoke('get-bitbucket-pr-changes', prId, repoSlug),
  approveBitbucketPR: (prId, repoSlug) => ipcRenderer.invoke('approve-bitbucket-pr', prId, repoSlug),
  mergeBitbucketPR: (prId, repoSlug, mergeStrategy) => ipcRenderer.invoke('merge-bitbucket-pr', prId, repoSlug, mergeStrategy),
  closeBitbucketPR: (prId, repoSlug) => ipcRenderer.invoke('close-bitbucket-pr', prId, repoSlug),
  getBitbucketUserInfo: () => ipcRenderer.invoke('get-bitbucket-user-info'),
  testBitbucketConnection: () => ipcRenderer.invoke('test-bitbucket-connection'),
  getBitbucketWorkspaces: () => ipcRenderer.invoke('get-bitbucket-workspaces'),
  getBitbucketRepositories: (workspace) => ipcRenderer.invoke('get-bitbucket-repositories', workspace),
  searchBitbucketPRs: (query) => ipcRenderer.invoke('search-bitbucket-prs', query),
  getBitbucketPRsByRepository: (repoSlug, state) => ipcRenderer.invoke('get-bitbucket-prs-by-repository', repoSlug, state),
  getBitbucketPRsByWorkspace: (workspace, state) => ipcRenderer.invoke('get-bitbucket-prs-by-workspace', workspace, state),

  // App initialization
  isAppInitialized: () => ipcRenderer.invoke('is-app-initialized'),
  waitForInitialization: () => ipcRenderer.invoke('wait-for-initialization'),
  forceInitialization: () => ipcRenderer.invoke('force-initialization'),
  onAppInitialized: (callback) => ipcRenderer.on('app-initialized', callback),
  removeAppInitializedListener: (callback) => ipcRenderer.removeListener('app-initialized', callback),

  // Background refresh
  triggerBackgroundRefresh: () => ipcRenderer.invoke('trigger-background-refresh'),
  getBackgroundRefreshStatus: () => ipcRenderer.invoke('get-background-refresh-status'),
  startBackgroundRefresh: () => ipcRenderer.invoke('start-background-refresh'),
  stopBackgroundRefresh: () => ipcRenderer.invoke('stop-background-refresh'),
  onBackgroundRefreshCompleted: (callback) => ipcRenderer.on('background-refresh-completed', callback),
  removeBackgroundRefreshCompletedListener: (callback) => ipcRenderer.removeListener('background-refresh-completed', callback),

  // Cache management
  clearCache: () => ipcRenderer.invoke('clear-cache'),
  clearGithubCache: () => ipcRenderer.invoke('clear-github-cache'),
  clearGitlabCache: () => ipcRenderer.invoke('clear-gitlab-cache'),
  clearBitbucketCache: () => ipcRenderer.invoke('clear-bitbucket-cache'),
  clearJiraCache: () => ipcRenderer.invoke('clear-jira-cache'),
  openJiraStatusConfig: () => ipcRenderer.invoke('open-jira-status-config'),
  getCacheStats: () => ipcRenderer.invoke('get-cache-stats'),
  exportConfig: () => ipcRenderer.invoke('export-config'),
  importConfig: () => ipcRenderer.invoke('import-config'),

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

  // Repositories service
  getRepositoriesConfig: () => ipcRenderer.invoke('get-repositories-config'),
  updateRepositoriesConfig: (config) => ipcRenderer.invoke('update-repositories-config', config),
  getRepositories: () => ipcRenderer.invoke('get-repositories'),
  getRepositoriesForDirectory: (directoryPath, tag) => ipcRenderer.invoke('get-repositories-for-directory', directoryPath, tag),
  getRepositoriesCacheStatus: () => ipcRenderer.invoke('get-repositories-cache-status'),
  refreshRepositoriesCacheInBackground: () => ipcRenderer.invoke('refresh-repositories-cache-in-background'),
  getFoldersInDirectory: (directoryPath) => ipcRenderer.invoke('get-folders-in-directory', directoryPath),
  getRepositoryInfo: (folderPath, tag) => ipcRenderer.invoke('get-repository-info', folderPath, tag),
  getRepositoryCommits: (folderPath) => ipcRenderer.invoke('get-repository-commits', folderPath),
  openRepository: (repoPath) => ipcRenderer.invoke('open-repository', repoPath),
  openRepositoryInEditor: (repoPath) => ipcRenderer.invoke('open-repository-in-editor', repoPath),
  selectDirectory: () => ipcRenderer.invoke('select-folder'),

  // Tasks service
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  getTaskById: (id) => ipcRenderer.invoke('get-task-by-id', id),
  createTask: (taskData) => ipcRenderer.invoke('create-task', taskData),
  updateTask: (id, updates) => ipcRenderer.invoke('update-task', id, updates),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  toggleTaskComplete: (id) => ipcRenderer.invoke('toggle-task-complete', id),

  getTasksByPriority: (priority) => ipcRenderer.invoke('get-tasks-by-priority', priority),
  getCompletedTasks: () => ipcRenderer.invoke('get-completed-tasks'),
  getPendingTasks: () => ipcRenderer.invoke('get-pending-tasks'),
  getOverdueTasks: () => ipcRenderer.invoke('get-overdue-tasks'),
  getTasksDueToday: () => ipcRenderer.invoke('get-tasks-due-today'),
  getTaskCategories: () => ipcRenderer.invoke('get-task-categories'),
  getTaskPriorities: () => ipcRenderer.invoke('get-task-priorities'),
  getTaskStats: () => ipcRenderer.invoke('get-task-stats'),

  // Category management
  getTaskCategoryDetails: () => ipcRenderer.invoke('get-task-category-details'),
  createTaskCategory: (categoryData) => ipcRenderer.invoke('create-task-category', categoryData),
  updateTaskCategory: (categoryId, updates) => ipcRenderer.invoke('update-task-category', categoryId, updates),
  deleteTaskCategory: (categoryId) => ipcRenderer.invoke('delete-task-category', categoryId),
  getTasksByCategory: (categoryId) => ipcRenderer.invoke('get-tasks-by-category', categoryId)

});
