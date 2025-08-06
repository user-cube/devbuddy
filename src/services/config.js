const fs = require('fs')
const path = require('path')
const os = require('os')
const yaml = require('js-yaml')

class ConfigService {
  constructor() {
    this.configDir = path.join(os.homedir(), '.devbuddy')
    this.configPath = path.join(this.configDir, 'config.yaml')
    this.shortcutsPath = path.join(this.configDir, 'shortcuts.yaml')
    this.defaultConfig = this.getDefaultConfig()
  }

  getDefaultConfig() {
    return {
      jira: {
        enabled: false,
        baseUrl: '',
        apiToken: '',
        username: '',
        projectKeys: [],
        refreshInterval: 300, // 5 minutes
        showClosed: false,
        maxResults: 50,
        defaultProject: '',
        // Custom status filtering
        excludedStatuses: ['Done', 'Closed', 'Resolved', 'Cancelled'],
        includedStatuses: [], // Empty means include all non-excluded
        statusCategories: {
          todo: ['To Do', 'Open', 'New'],
          inProgress: ['In Progress', 'Active', 'Working'],
          review: ['Review', 'Testing', 'QA'],
          blocked: ['Blocked', 'On Hold', 'Waiting']
        }
      },
      github: {
        enabled: false,
        apiToken: '',
        username: '',
        organizations: [],
        defaultOrg: '',
        refreshInterval: 300, // 5 minutes
        showDrafts: true,
        showClosed: false,
        maxResults: 50
      },
      gitlab: {
        enabled: false,
        baseUrl: 'https://gitlab.com',
        apiToken: '',
        username: '',
        defaultGroup: '',
        refreshInterval: 300, // 5 minutes
        showDrafts: true,
        showClosed: false,
        maxResults: 50
      },
      app: {
        theme: 'dark',
        autoStart: false,
        notifications: true,
        updateInterval: 300, // 5 minutes
        backgroundRefresh: true, // Enable background refresh by default
        redirectorPort: 10000, // Port for local redirector server
        defaultEditor: 'vscode' // Default editor: 'vscode' or 'cursor'
      }
    }
  }

  getDefaultShortcuts() {
    return {
      categories: [
        {
          id: 'development',
          name: 'Development',
          icon: 'code',
          color: '#3b82f6',
          shortcuts: [
            {
              id: 'dev-local',
              name: 'Local Dev',
              url: 'http://localhost:3000',
              icon: 'rocket',
              description: 'Local development environment'
            },
            {
              id: 'dev-docs',
              name: 'Documentation',
              url: 'http://localhost:3000/docs',
              icon: 'book',
              description: 'Local documentation'
            }
          ]
        },
        {
          id: 'environments',
          name: 'Environments',
          icon: 'server',
          color: '#10b981',
          shortcuts: [
            {
              id: 'staging',
              name: 'Staging',
              url: 'https://staging.yourapp.com',
              icon: 'server',
              description: 'Staging environment'
            },
            {
              id: 'production',
              name: 'Production',
              url: 'https://yourapp.com',
              icon: 'globe',
              description: 'Production environment'
            }
          ]
        },
        {
          id: 'tools',
          name: 'Tools',
          icon: 'wrench',
          color: '#f59e0b',
          shortcuts: [
            {
              id: 'jira',
              name: 'Jira',
              url: 'https://jira.atlassian.net',
              icon: 'git-branch',
              description: 'Project management'
            },
            {
              id: 'github',
              name: 'GitHub',
              url: 'https://github.com',
              icon: 'git-pull-request',
              description: 'Code repository'
            }
          ]
        }
      ]
    }
  }

  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true })
    }
  }

  loadConfig() {
    try {
      this.ensureConfigDir()
      
      if (!fs.existsSync(this.configPath)) {
        // Create default config if it doesn't exist
        this.saveConfig(this.defaultConfig)
        return this.defaultConfig
      }

      const configData = fs.readFileSync(this.configPath, 'utf8')
      const config = yaml.load(configData)
      
      // Merge with default config to ensure all properties exist
      return this.mergeWithDefaults(config)
    } catch (error) {
      console.error('Error loading config:', error)
      return this.defaultConfig
    }
  }

  saveConfig(config) {
    try {
      this.ensureConfigDir()
      const yamlData = yaml.dump(config, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      })
      fs.writeFileSync(this.configPath, yamlData, 'utf8')
      return true
    } catch (error) {
      console.error('Error saving config:', error)
      return false
    }
  }

  mergeWithDefaults(config) {
    const merged = JSON.parse(JSON.stringify(this.defaultConfig))
    
    // Deep merge function
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {}
          deepMerge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }

    deepMerge(merged, config)
    return merged
  }

  updateConfig(updates) {
    const currentConfig = this.loadConfig()
    const updatedConfig = this.mergeWithDefaults({ ...currentConfig, ...updates })
    return this.saveConfig(updatedConfig)
  }

  loadShortcuts() {
    try {
      this.ensureConfigDir()
      
      if (!fs.existsSync(this.shortcutsPath)) {
        // Create default shortcuts if it doesn't exist
        this.saveShortcuts(this.getDefaultShortcuts())
        return this.getDefaultShortcuts()
      }

      const shortcutsData = fs.readFileSync(this.shortcutsPath, 'utf8')
      const shortcuts = yaml.load(shortcutsData)
      
      // Handle migration from old format to new format
      if (Array.isArray(shortcuts)) {
        // Convert old array format to new categorized format
        const migratedShortcuts = {
          categories: [
            {
              id: 'general',
              name: 'General',
              icon: 'link',
              color: '#6b7280',
              shortcuts: shortcuts
            }
          ]
        }
        this.saveShortcuts(migratedShortcuts)
        return migratedShortcuts
      }
      
      return shortcuts || this.getDefaultShortcuts()
    } catch (error) {
      console.error('Error loading shortcuts:', error)
      return this.getDefaultShortcuts()
    }
  }

  saveShortcuts(shortcuts) {
    try {
      this.ensureConfigDir()
      const yamlData = yaml.dump(shortcuts, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      })
      fs.writeFileSync(this.shortcutsPath, yamlData, 'utf8')
      return true
    } catch (error) {
      console.error('Error saving shortcuts:', error)
      return false
    }
  }

  getShortcuts() {
    return this.loadShortcuts()
  }

  updateShortcuts(shortcuts) {
    return this.saveShortcuts(shortcuts)
  }

  // Helper methods for categorized shortcuts
  getAllShortcuts() {
    const shortcutsData = this.loadShortcuts()
    const allShortcuts = []
    
    if (shortcutsData.categories) {
      shortcutsData.categories.forEach(category => {
        if (category.shortcuts) {
          category.shortcuts.forEach(shortcut => {
            allShortcuts.push({
              ...shortcut,
              category: category.name,
              categoryId: category.id,
              categoryColor: category.color
            })
          })
        }
      })
    }
    
    return allShortcuts
  }

  addCategory(category) {
    const shortcutsData = this.loadShortcuts()
    if (!shortcutsData.categories) {
      shortcutsData.categories = []
    }
    
    // Generate unique ID if not provided
    if (!category.id) {
      category.id = `category-${Date.now()}`
    }
    
    shortcutsData.categories.push(category)
    return this.saveShortcuts(shortcutsData)
  }

  updateCategory(categoryId, updatedCategory) {
    const shortcutsData = this.loadShortcuts()
    if (shortcutsData.categories) {
      const index = shortcutsData.categories.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        shortcutsData.categories[index] = { ...shortcutsData.categories[index], ...updatedCategory }
        return this.saveShortcuts(shortcutsData)
      }
    }
    return false
  }

  deleteCategory(categoryId) {
    const shortcutsData = this.loadShortcuts()
    if (shortcutsData.categories) {
      shortcutsData.categories = shortcutsData.categories.filter(cat => cat.id !== categoryId)
      return this.saveShortcuts(shortcutsData)
    }
    return false
  }

  addShortcut(categoryId, shortcut) {
    const shortcutsData = this.loadShortcuts()
    if (shortcutsData.categories) {
      const category = shortcutsData.categories.find(cat => cat.id === categoryId)
      if (category) {
        if (!category.shortcuts) {
          category.shortcuts = []
        }
        
        // Generate unique ID if not provided
        if (!shortcut.id) {
          shortcut.id = `shortcut-${Date.now()}`
        }
        
        category.shortcuts.push(shortcut)
        return this.saveShortcuts(shortcutsData)
      }
    }
    return false
  }

  updateShortcut(categoryId, shortcutId, updatedShortcut) {
    const shortcutsData = this.loadShortcuts()
    if (shortcutsData.categories) {
      const category = shortcutsData.categories.find(cat => cat.id === categoryId)
      if (category && category.shortcuts) {
        const index = category.shortcuts.findIndex(shortcut => shortcut.id === shortcutId)
        if (index !== -1) {
          category.shortcuts[index] = { ...category.shortcuts[index], ...updatedShortcut }
          return this.saveShortcuts(shortcutsData)
        }
      }
    }
    return false
  }

  deleteShortcut(categoryId, shortcutId) {
    const shortcutsData = this.loadShortcuts()
    if (shortcutsData.categories) {
      const category = shortcutsData.categories.find(cat => cat.id === categoryId)
      if (category && category.shortcuts) {
        category.shortcuts = category.shortcuts.filter(shortcut => shortcut.id !== shortcutId)
        return this.saveShortcuts(shortcutsData)
      }
    }
    return false
  }

  getJiraConfig() {
    const config = this.loadConfig()
    const jiraConfig = config.jira || {}
    
    // Ensure all required fields exist with defaults
    const completeConfig = {
      enabled: jiraConfig.enabled || false,
      baseUrl: jiraConfig.baseUrl || '',
      apiToken: jiraConfig.apiToken || '',
      username: jiraConfig.username || '',
      projectKeys: jiraConfig.projectKeys || [],
      refreshInterval: jiraConfig.refreshInterval || 300,
      showClosed: jiraConfig.showClosed || false,
      maxResults: jiraConfig.maxResults || 50,
      defaultProject: jiraConfig.defaultProject || '',
      excludedStatuses: jiraConfig.excludedStatuses || ['Done', 'Closed', 'Resolved', 'Cancelled'],
      includedStatuses: jiraConfig.includedStatuses || [],
      statusCategories: jiraConfig.statusCategories || {
        todo: ['To Do', 'Open', 'New'],
        inProgress: ['In Progress', 'Active', 'Working'],
        review: ['Review', 'Testing', 'QA'],
        blocked: ['Blocked', 'On Hold', 'Waiting']
      }
    }
    
    return completeConfig
  }

  updateJiraConfig(jiraConfig) {
    return this.updateConfig({ jira: jiraConfig })
  }

  getGithubConfig() {
    const config = this.loadConfig()
    const githubConfig = config.github || {}
    
    // Ensure all required fields exist with defaults
    const completeConfig = {
      enabled: githubConfig.enabled || false,
      apiToken: githubConfig.apiToken || '',
      username: githubConfig.username || '',
      organizations: githubConfig.organizations || [],
      defaultOrg: githubConfig.defaultOrg || '',
      refreshInterval: githubConfig.refreshInterval || 300,
      showDrafts: githubConfig.showDrafts !== undefined ? githubConfig.showDrafts : true,
      showClosed: githubConfig.showClosed || false,
      maxResults: githubConfig.maxResults || 50
    }
    
    return completeConfig
  }

  updateGithubConfig(githubConfig) {
    return this.updateConfig({ github: githubConfig })
  }

  getGitlabConfig() {
    const config = this.loadConfig()
    const gitlabConfig = config.gitlab || {}
    
    // Ensure all required fields exist with defaults
    const completeConfig = {
      enabled: gitlabConfig.enabled || false,
      baseUrl: gitlabConfig.baseUrl || 'https://gitlab.com',
      apiToken: gitlabConfig.apiToken || '',
      username: gitlabConfig.username || '',
      defaultGroup: gitlabConfig.defaultGroup || '',
      refreshInterval: gitlabConfig.refreshInterval || 300,
      showDrafts: gitlabConfig.showDrafts !== undefined ? gitlabConfig.showDrafts : true,
      showClosed: gitlabConfig.showClosed || false,
      maxResults: gitlabConfig.maxResults || 50
    }
    
    return completeConfig
  }

  updateGitlabConfig(gitlabConfig) {
    return this.updateConfig({ gitlab: gitlabConfig })
  }

  getAppConfig() {
    const config = this.loadConfig()
    return config.app || {}
  }

  updateAppConfig(appConfig) {
    return this.updateConfig({ app: appConfig })
  }

  isConfigured() {
    const config = this.loadConfig()
    const shortcuts = this.loadShortcuts()
    
    // Consider configured if any service is enabled OR if there are shortcuts
    return config.jira.enabled || config.github.enabled || config.gitlab.enabled || shortcuts.length > 0
  }

  validateConfig(config) {
    const errors = []

    // Validate Jira config
    if (config.jira.enabled) {
      if (!config.jira.baseUrl) errors.push('Jira base URL is required')
      if (!config.jira.apiToken) errors.push('Jira API token is required')
      if (!config.jira.username) errors.push('Jira username is required')
    }

    // Validate GitHub config
    if (config.github.enabled) {
      if (!config.github.apiToken) errors.push('GitHub API token is required')
      if (!config.github.username) errors.push('GitHub username is required')
    }

    // Validate GitLab config
    if (config.gitlab.enabled) {
      if (!config.gitlab.apiToken) errors.push('GitLab API token is required')
      if (!config.gitlab.username) errors.push('GitLab username is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

module.exports = ConfigService 