const fs = require('fs').promises
const path = require('path')
const { simpleGit } = require('simple-git')
const { exec } = require('child_process')
const { promisify } = require('util')
const yaml = require('js-yaml')
const app = require('electron').app
const os = require('os')

const execAsync = promisify(exec)

class RepositoriesService {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'repositories-config.json')
    this.repositoriesConfigPath = path.join(os.homedir(), '.devbuddy', 'repositories.yml')
    this.cacheService = require('./cache')
    this.configService = require('./config')
    this.defaultConfig = {
      enabled: false,
      directories: [],
      scanDepth: 3
    }
  }

  async getConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8')
      return yaml.load(data) || this.defaultConfig
    } catch (error) {
      // Return default config if file doesn't exist
      return this.defaultConfig
    }
  }

  async saveConfig(config) {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.configPath)
      await fs.mkdir(dir, { recursive: true })
      
      const yamlData = yaml.dump(config, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      })
      await fs.writeFile(this.configPath, yamlData)
      return { success: true }
    } catch (error) {
      console.error('Error saving repositories config:', error)
      return { success: false, error: error.message }
    }
  }

  async loadRepositoriesFromConfig() {
    try {
      // Ensure config directory exists
      const configDir = path.dirname(this.repositoriesConfigPath)
      await fs.mkdir(configDir, { recursive: true })
      
      if (!(await fs.access(this.repositoriesConfigPath).then(() => true).catch(() => false))) {
        // File doesn't exist, return empty array
        return []
      }
      
      const data = await fs.readFile(this.repositoriesConfigPath, 'utf8')
      const config = yaml.load(data)
      return config?.repositories || []
    } catch (error) {
      console.error('Error loading repositories from config:', error)
      return []
    }
  }

  async saveRepositoriesToConfig(repositories) {
    try {
      // Ensure config directory exists
      const configDir = path.dirname(this.repositoriesConfigPath)
      await fs.mkdir(configDir, { recursive: true })
      
      // Load existing config to preserve other settings
      let existingConfig = {}
      try {
        if (await fs.access(this.repositoriesConfigPath).then(() => true).catch(() => false)) {
          const data = await fs.readFile(this.repositoriesConfigPath, 'utf8')
          existingConfig = yaml.load(data) || {}
        }
      } catch (error) {
        // If file doesn't exist or can't be read, start with empty config
        existingConfig = {}
      }
      
      // Update config with repositories and last scan time
      const updatedConfig = {
        ...existingConfig,
        repositories: repositories,
        lastScan: new Date().toISOString()
      }
      
      const yamlData = yaml.dump(updatedConfig, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      })
      await fs.writeFile(this.repositoriesConfigPath, yamlData)
      return { success: true }
    } catch (error) {
      console.error('Error saving repositories to config:', error)
      return { success: false, error: error.message }
    }
  }

  async getCachedRepositories() {
    return await this.loadRepositoriesFromConfig()
  }

  async updateRepositoryInCache(repoPath, repoInfo) {
    try {
      const repositories = await this.loadRepositoriesFromConfig()
      const existingIndex = repositories.findIndex(repo => repo.path === repoPath)
      
      if (existingIndex >= 0) {
        // Update existing repository
        repositories[existingIndex] = { ...repositories[existingIndex], ...repoInfo }
      } else {
        // Add new repository
        repositories.push(repoInfo)
      }
      
      await this.saveRepositoriesToConfig(repositories)
      return { success: true }
    } catch (error) {
      console.error('Error updating repository in config:', error)
      return { success: false, error: error.message }
    }
  }

  async refreshCacheInBackground() {
    try {
      console.log('Starting background repositories scan...')
      const config = await this.getConfig()
      
      if (!config.enabled || !config.directories) {
        return { success: true, message: 'No directories configured' }
      }

      const allRepositories = []
      
      for (const dirConfig of config.directories) {
        if (dirConfig.enabled && dirConfig.path) {
          try {
            const repositories = await this.scanDirectory(dirConfig.path, 0, config.scanDepth || 3, [], dirConfig.tag)
            allRepositories.push(...repositories)
          } catch (error) {
            console.error(`Error scanning directory ${dirConfig.path}:`, error)
          }
        }
      }

      // Save all repositories to repositories.yml
      await this.saveRepositoriesToConfig(allRepositories)
      console.log(`Background repositories scan completed. Found ${allRepositories.length} repositories.`)
      
      return { success: true, count: allRepositories.length }
    } catch (error) {
      console.error('Error in background repositories scan:', error)
      return { success: false, error: error.message }
    }
  }

  async getCacheStatus() {
    try {
      const repositories = await this.loadRepositoriesFromConfig()
      
      // Try to get last scan time from the file
      let lastScan = null
      try {
        const configDir = path.dirname(this.repositoriesConfigPath)
        await fs.mkdir(configDir, { recursive: true })
        
        if (await fs.access(this.repositoriesConfigPath).then(() => true).catch(() => false)) {
          const data = await fs.readFile(this.repositoriesConfigPath, 'utf8')
          const config = yaml.load(data)
          lastScan = config?.lastScan
        }
      } catch (error) {
        // Ignore error, lastScan will remain null
      }
      
      return {
        repositoryCount: repositories.length,
        lastUpdated: lastScan,
        cachePath: this.repositoriesConfigPath
      }
    } catch (error) {
      console.error('Error getting cache status:', error)
      return { repositoryCount: 0, lastUpdated: null, cachePath: this.repositoriesConfigPath }
    }
  }

  async scanForRepositories(directories, maxDepth = 3) {
    const allRepositories = []
    
    try {
      for (const dirConfig of directories) {
        if (dirConfig.enabled && dirConfig.path) {
          const repositories = await this.scanDirectory(dirConfig.path, 0, maxDepth, [], dirConfig.tag)
          allRepositories.push(...repositories)
        }
      }
    } catch (error) {
      console.error('Error scanning for repositories:', error)
    }
    
    return allRepositories
  }

  async getFoldersInDirectory(directoryPath, useCache = true) {
    try {
      // First, try to load from repositories.yml if enabled
      if (useCache) {
        const cachedRepos = await this.getCachedRepositories()
        const directoryRepos = cachedRepos.filter(repo => 
          repo.path.startsWith(directoryPath) && 
          path.dirname(repo.path) === directoryPath
        )
        
        if (directoryRepos.length > 0) {
          console.log(`Loaded ${directoryRepos.length} repositories from repositories.yml for ${directoryPath}`)
          return directoryRepos.map(repo => ({
            name: repo.name,
            path: repo.path,
            isGitRepository: true
          }))
        }
      }

      // If no repositories.yml data or cache miss, scan directory
      console.log(`Scanning directory for repositories: ${directoryPath}`)
      const items = await fs.readdir(directoryPath)
      const folders = []
      const newRepos = []
      
      for (const item of items) {
        const fullPath = path.join(directoryPath, item)
        
        try {
          const stat = await fs.stat(fullPath)
          
          if (stat.isDirectory()) {
            // Check if this directory is a Git repository
            const gitPath = path.join(fullPath, '.git')
            let isGitRepository = false
            
            try {
              const gitStat = await fs.stat(gitPath)
              // Check if .git is a directory (not a file)
              if (gitStat.isDirectory()) {
                // Additional check: verify it's a valid Git repository by checking for HEAD file
                const headPath = path.join(gitPath, 'HEAD')
                try {
                  await fs.access(headPath)
                  // Additional check: verify it's a valid Git repository by trying to initialize simple-git
                  const simpleGit = require('simple-git')
                  const git = simpleGit(fullPath)
                  try {
                    await git.status()
                    isGitRepository = true
                  } catch (gitError) {
                    console.log(`Directory ${fullPath} has .git but is not a valid Git repository:`, gitError.message)
                  }
                } catch {
                  // HEAD file doesn't exist, not a valid Git repository
                }
              }
            } catch {
              // .git doesn't exist or is not accessible
            }
            
            // Only include Git repositories
            if (isGitRepository) {
              console.log(`Found Git repository: ${item} at ${fullPath}`)
              const repoInfo = {
                name: item,
                path: fullPath,
                isGitRepository
              }
              folders.push(repoInfo)
              newRepos.push(repoInfo)
            } else {
              // Log specifically for directories that might be problematic
              if (item.includes('XDG_CONFIG_HOME') || item.includes('CONFIG')) {
                console.log(`Skipped problematic directory: ${item} at ${fullPath} (not a valid Git repository)`)
              } else {
                console.log(`Skipped non-Git directory: ${item} at ${fullPath}`)
              }
            }
          }
        } catch (error) {
          // Skip items we can't access
          continue
        }
      }
      
      // Update repositories.yml with new repositories found
      if (newRepos.length > 0) {
        for (const repo of newRepos) {
          await this.updateRepositoryInCache(repo.path, repo)
        }
        console.log(`Updated repositories.yml with ${newRepos.length} new repositories`)
      }
      
      return folders
    } catch (error) {
      console.error(`Error getting folders in directory ${directoryPath}:`, error)
      throw error
    }
  }

  async scanDirectory(dirPath, currentDepth, maxDepth, repositories, tag) {
    if (currentDepth > maxDepth) return repositories

    try {
      const items = await fs.readdir(dirPath)
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item)
        
        try {
          const stat = await fs.stat(fullPath)
          
          if (stat.isDirectory()) {
            // Check if this directory is a Git repository
            const gitPath = path.join(fullPath, '.git')
            try {
              const gitStat = await fs.stat(gitPath)
              // Check if .git is a directory (not a file)
              if (gitStat.isDirectory()) {
                // Additional check: verify it's a valid Git repository by checking for HEAD file
                const headPath = path.join(gitPath, 'HEAD')
                try {
                  await fs.access(headPath)
                  // Additional check: verify it's a valid Git repository by trying to initialize simple-git
                  const simpleGit = require('simple-git')
                  const git = simpleGit(fullPath)
                  try {
                    await git.status()
                    // This is a valid Git repository
                    const repoInfo = await this.getRepositoryInfo(fullPath, tag)
                    if (repoInfo) {
                      repositories.push(repoInfo)
                    }
                  } catch (gitError) {
                    console.log(`Directory ${fullPath} has .git but is not a valid Git repository:`, gitError.message)
                    // Continue scanning subdirectories
                    if (currentDepth < maxDepth) {
                      await this.scanDirectory(fullPath, currentDepth + 1, maxDepth, repositories, tag)
                    }
                  }
                } catch {
                  // HEAD file doesn't exist, not a valid Git repository, continue scanning
                  if (currentDepth < maxDepth) {
                    await this.scanDirectory(fullPath, currentDepth + 1, maxDepth, repositories, tag)
                  }
                }
              } else {
                // .git exists but is not a directory, continue scanning
                if (currentDepth < maxDepth) {
                  await this.scanDirectory(fullPath, currentDepth + 1, maxDepth, repositories, tag)
                }
              }
            } catch {
              // .git doesn't exist or is not accessible, continue scanning
              if (currentDepth < maxDepth) {
                await this.scanDirectory(fullPath, currentDepth + 1, maxDepth, repositories, tag)
              }
            }
          }
        } catch (error) {
          // Skip items we can't access
          continue
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error)
    }
    
    return repositories
  }

  async getRepositoryInfo(repoPath, tag) {
    try {
      const git = simpleGit(repoPath)
      const name = path.basename(repoPath)
      
      // Get current branch
      let branch = 'unknown'
      try {
        branch = await git.branch()
        branch = branch.current || 'unknown'
      } catch (error) {
        // Branch might not be available
      }

      // Get last commit
      let lastCommitDate = null
      let lastCommit = null
      try {
        const log = await git.log({ maxCount: 1 })
        if (log.latest) {
          lastCommit = log.latest
          lastCommitDate = log.latest.date
        }
      } catch (error) {
        // No commits yet
      }

      // Get remote URL
      let remote = null
      try {
        const remotes = await git.getRemotes(true)
        const originRemote = remotes.find(r => r.name === 'origin')
        remote = originRemote ? originRemote.refs.fetch : null
      } catch (error) {
        // No remote configured
      }

      // Check if repository has changes
      let hasChanges = false
      try {
        const status = await git.status()
        hasChanges = status.files.length > 0
      } catch (error) {
        // Can't check status
      }

      // Check if repository is up to date
      let isUpToDate = true
      if (remote) {
        try {
          await git.fetch(['--dry-run'])
        } catch (error) {
          // Repository might be behind
          isUpToDate = false
        }
      }

      return {
        name,
        path: repoPath,
        tag,
        branch,
        lastCommitDate,
        remote,
        hasChanges,
        isUpToDate
      }
    } catch (error) {
      console.error(`Error getting repository info for ${repoPath}:`, error)
      return null
    }
  }

  async getRepositoryCommits(repoPath, maxCommits = 10) {
    try {
      const git = simpleGit(repoPath)
      
      // Get current branch
      let currentBranch = 'main'
      try {
        const branch = await git.branch()
        currentBranch = branch.current || 'main'
      } catch (error) {
        // Use default branch
      }

      // Get commits with detailed information
      const log = await git.log({
        maxCount: maxCommits,
        format: {
          hash: '%H',
          author: '%an',
          date: '%ad',
          message: '%s',
          refs: '%D'
        }
      })

      return log.all.map(commit => {
        // Extract branch information from refs
        let branch = currentBranch
        if (commit.refs) {
          const branchMatch = commit.refs.match(/HEAD -> ([^,]+)/)
          if (branchMatch) {
            branch = branchMatch[1]
          } else {
            // Try to find any branch reference
            const anyBranchMatch = commit.refs.match(/([^,\s]+)/)
            if (anyBranchMatch && !anyBranchMatch[1].includes('tag:')) {
              branch = anyBranchMatch[1]
            }
          }
        }

        return {
          hash: commit.hash,
          author: commit.author,
          date: commit.date,
          message: commit.message,
          branch
        }
      })
    } catch (error) {
      console.error(`Error getting repository commits for ${repoPath}:`, error)
      return []
    }
  }

  async openRepository(repoPath) {
    try {
      // On macOS, use 'open' command to open in Finder
      if (process.platform === 'darwin') {
        await execAsync(`open "${repoPath}"`)
      }
      // On Windows, use 'explorer' command to open in File Explorer
      else if (process.platform === 'win32') {
        await execAsync(`explorer "${repoPath}"`)
      }
      // On Linux, use 'xdg-open' command to open in default file manager
      else {
        await execAsync(`xdg-open "${repoPath}"`)
      }
      
      return { success: true, message: `Opened repository in file explorer: ${path.basename(repoPath)}` }
    } catch (error) {
      console.error('Error opening repository:', error)
      return { success: false, message: 'Failed to open repository' }
    }
  }

  async openRepositoryInEditor(repoPath) {
    try {
      // Get the default editor from config
      const config = await this.getConfig()
      const defaultEditor = config?.defaultEditor || 'vscode'
      
      // On macOS
      if (process.platform === 'darwin') {
        try {
          if (defaultEditor === 'cursor') {
            // Try Cursor first
            await execAsync(`open -a Cursor "${repoPath}"`)
          } else {
            // Try VS Code first
            await execAsync(`code "${repoPath}"`)
          }
        } catch {
          // Fallback to the other editor
          try {
            if (defaultEditor === 'cursor') {
              await execAsync(`code "${repoPath}"`)
            } else {
              await execAsync(`open -a Cursor "${repoPath}"`)
            }
          } catch {
            // Final fallback to default text editor
            await execAsync(`open -a TextEdit "${repoPath}"`)
          }
        }
      }
      // On Windows
      else if (process.platform === 'win32') {
        try {
          if (defaultEditor === 'cursor') {
            // Try Cursor first
            await execAsync(`cursor "${repoPath}"`)
          } else {
            // Try VS Code first
            await execAsync(`code "${repoPath}"`)
          }
        } catch {
          // Fallback to the other editor
          try {
            if (defaultEditor === 'cursor') {
              await execAsync(`code "${repoPath}"`)
            } else {
              await execAsync(`cursor "${repoPath}"`)
            }
          } catch {
            // Final fallback to Notepad
            await execAsync(`notepad "${repoPath}"`)
          }
        }
      }
      // On Linux
      else {
        try {
          if (defaultEditor === 'cursor') {
            // Try Cursor first
            await execAsync(`cursor "${repoPath}"`)
          } else {
            // Try VS Code first
            await execAsync(`code "${repoPath}"`)
          }
        } catch {
          // Fallback to the other editor
          try {
            if (defaultEditor === 'cursor') {
              await execAsync(`code "${repoPath}"`)
            } else {
              await execAsync(`cursor "${repoPath}"`)
            }
          } catch {
            // Final fallback to nano
            await execAsync(`nano "${repoPath}"`)
          }
        }
      }
      
      const editorName = defaultEditor === 'cursor' ? 'Cursor' : 'VS Code'
      return { success: true, message: `Opened repository in ${editorName}: ${path.basename(repoPath)}` }
    } catch (error) {
      console.error('Error opening repository in editor:', error)
      return { success: false, message: 'Failed to open repository in editor' }
    }
  }
}

module.exports = new RepositoriesService() 