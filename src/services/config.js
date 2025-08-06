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
        projectKeys: []
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
        username: ''
      },
      app: {
        theme: 'dark',
        autoStart: false,
        notifications: true,
        updateInterval: 300, // 5 minutes
        redirectorPort: 10000 // Port for local redirector server
      }
    }
  }

  getDefaultShortcuts() {
    return [
      {
        name: 'dev/local',
        url: 'http://localhost:3000',
        icon: 'rocket',
        description: 'Local development environment'
      },
      {
        name: 'staging',
        url: 'https://staging.yourapp.com',
        icon: 'server',
        description: 'Staging environment'
      },
      {
        name: 'production',
        url: 'https://yourapp.com',
        icon: 'globe',
        description: 'Production environment'
      }
    ]
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

  getJiraConfig() {
    const config = this.loadConfig()
    return config.jira || {}
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
    return config.gitlab || {}
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