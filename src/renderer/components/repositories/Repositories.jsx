import React, { useState, useEffect } from 'react'
import { 
  Folder, 
  GitBranch, 
  ExternalLink, 
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  FileText,
  Calendar,
  User,
  GitCommit
} from 'lucide-react'
import Toast from '../layout/Toast'

// Git Graph Component
const GitGraph = ({ commits, currentBranch }) => {
  if (!commits || commits.length === 0) {
    return (
      <div className="text-center py-12">
        <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No commits found</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCommitColor = (commit) => {
    if (commit.branch === currentBranch) {
      return 'var(--accent-primary)'
    }
    return 'var(--text-secondary)'
  }

  return (
    <div className="space-y-4">
      {commits.map((commit, index) => (
        <div key={commit.hash} className="group relative">
          <div className="flex items-start gap-4">
            {/* Commit line */}
            <div className="flex flex-col items-center">
              <div 
                className="w-4 h-4 rounded-full border-2 transition-all duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: getCommitColor(commit),
                  borderColor: getCommitColor(commit)
                }}
              />
              {index < commits.length - 1 && (
                <div 
                  className="w-0.5 h-12 mt-2"
                  style={{ backgroundColor: 'var(--border-primary)' }}
                />
              )}
            </div>
            
            {/* Commit card */}
            <div className="flex-1 min-w-0">
              <div className="p-4 rounded-lg transition-all duration-300 group-hover:scale-[1.02]" style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)'
              }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {commit.message}
                    </h4>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {commit.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(commit.date)}
                      </span>
                      <span className="font-mono bg-black/10 px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
                        {commit.hash.substring(0, 7)}
                      </span>
                    </div>
                  </div>
                  {commit.branch === currentBranch && (
                    <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      {commit.branch}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const Repositories = () => {
  const [repositories, setRepositories] = useState([])
  const [filteredRepositories, setFilteredRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [config, setConfig] = useState(null)
  const [selectedTag, setSelectedTag] = useState('all')
  const [selectedDirectory, setSelectedDirectory] = useState(null)
  const [directoryFolders, setDirectoryFolders] = useState({})
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [folderRepositoryInfo, setFolderRepositoryInfo] = useState({})
  const [repositoryCommits, setRepositoryCommits] = useState({})
  const [appConfig, setAppConfig] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cacheStatus, setCacheStatus] = useState(null)
  const [isRefreshingRepositories, setIsRefreshingRepositories] = useState(false)
  const searchInputRef = React.useRef(null)

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    // Listen for config changes
    const handleConfigChange = () => {
      loadConfig()
    }
    
    window.addEventListener('config-changed', handleConfigChange)
    return () => window.removeEventListener('config-changed', handleConfigChange)
  }, [])

  useEffect(() => {
    if (config?.enabled) {
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [config])

  // Filter repositories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRepositories(repositories)
    } else {
      const filtered = repositories.filter(repo => 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.branch && repo.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (repo.remote && repo.remote.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredRepositories(filtered)
    }
  }, [repositories, searchQuery])

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getRepositoriesConfig()
      setConfig(config)
      
      // Load app config to get default editor
      const appConfigData = await window.electronAPI.getConfig()
      setAppConfig(appConfigData?.app)

      // Load cache status
      const cacheStatusData = await window.electronAPI.getRepositoriesCacheStatus()
      setCacheStatus(cacheStatusData)
    } catch (error) {
      console.error('Error loading repositories config:', error)
      setError('Failed to load configuration')
      setLoading(false)
    }
  }

  const loadFoldersForDirectory = async (directory) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if we already have folders for this directory
      if (directoryFolders[directory.path]) {
        setRepositories(directoryFolders[directory.path])
        setSelectedDirectory(directory)
        setLoading(false)
        return
      }

      const folders = await window.electronAPI.getFoldersInDirectory(directory.path)
      
      // Cache the folders for this directory
      setDirectoryFolders(prev => ({
        ...prev,
        [directory.path]: folders
      }))
      
      setRepositories(folders)
      setFilteredRepositories(folders)
      setSelectedDirectory(directory)
    } catch (error) {
      console.error('Error loading folders for directory:', error)
      setError('Failed to load folders for this directory')
    } finally {
      setLoading(false)
    }
  }

  const loadRepositoryInfo = async (folderPath, tag, forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if we already have repository info for this folder (unless forcing refresh)
      if (folderRepositoryInfo[folderPath] && !forceRefresh) {
        setSelectedFolder(folderRepositoryInfo[folderPath])
        setLoading(false)
        return
      }

      const repoInfo = await window.electronAPI.getRepositoryInfo(folderPath, tag)
      
      // Cache the repository info for this folder
      setFolderRepositoryInfo(prev => ({
        ...prev,
        [folderPath]: repoInfo
      }))
      
      setSelectedFolder(repoInfo)
      
      // Load commits for this repository
      await loadRepositoryCommits(folderPath, forceRefresh)
    } catch (error) {
      console.error('Error loading repository info:', error)
      setError('Failed to load repository information')
    } finally {
      setLoading(false)
    }
  }

  const loadRepositoryCommits = async (folderPath, forceRefresh = false) => {
    try {
      // Check if we already have commits for this folder (unless forcing refresh)
      if (repositoryCommits[folderPath] && !forceRefresh) {
        return
      }

      const commits = await window.electronAPI.getRepositoryCommits(folderPath)
      
      // Cache the commits for this folder
      setRepositoryCommits(prev => ({
        ...prev,
        [folderPath]: commits
      }))
    } catch (error) {
      console.error('Error loading repository commits:', error)
      // Don't show error for commits, just log it
    }
  }

  const handleOpenRepository = async (repoPath) => {
    try {
      const result = await window.electronAPI.openRepository(repoPath)
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Error opening repository:', error)
      setMessage({ type: 'error', text: 'Failed to open repository' })
    }
  }

  const handleOpenInEditor = async (repoPath) => {
    try {
      const result = await window.electronAPI.openRepositoryInEditor(repoPath)
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Error opening repository in editor:', error)
      setMessage({ type: 'error', text: 'Failed to open editor' })
    }
  }

  const getStatusIcon = (repo) => {
    if (repo.hasChanges) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
    if (repo.isUpToDate) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <Clock className="w-4 h-4 text-gray-500" />
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const goBackToDirectories = () => {
    setSelectedDirectory(null)
    setRepositories([])
    setSelectedTag('all')
    setSelectedFolder(null)
  }

  const goBackToFolders = () => {
    setSelectedFolder(null)
  }

  const refreshRepositoriesInBackground = async () => {
    try {
      setIsRefreshingRepositories(true)
      const result = await window.electronAPI.refreshRepositoriesCacheInBackground()
      if (result.success) {
        setMessage({ type: 'success', text: `Repositories scan completed successfully. Found ${result.count} repositories.` })
        // Reload cache status
        const cacheStatusData = await window.electronAPI.getRepositoriesCacheStatus()
        setCacheStatus(cacheStatusData)
      } else {
        setMessage({ type: 'error', text: `Failed to refresh repositories: ${result.error}` })
      }
    } catch (error) {
      console.error('Error refreshing repositories:', error)
      setMessage({ type: 'error', text: 'Failed to refresh repositories' })
    } finally {
      setIsRefreshingRepositories(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {selectedFolder ? `Loading repository information...` : 
             selectedDirectory ? `Loading folders from ${selectedDirectory.path}...` : 
             'Loading repositories...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Repositories Error</h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={() => selectedFolder ? loadRepositoryInfo(selectedFolder.path, selectedDirectory.tag) : 
                     selectedDirectory ? loadFoldersForDirectory(selectedDirectory) : loadConfig()}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-primary)'
            }}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!config?.enabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <Settings className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Repositories Disabled</h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Enable repositories in settings to view your local repositories
          </p>
          <button
            onClick={() => window.location.hash = '#/config'}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Go to Settings
          </button>
        </div>
      </div>
    )
  }

  // Show directories list
  if (!selectedDirectory) {
    return (
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Folder className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Repositories</h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {config?.directories?.length > 0 
                  ? `${config.directories.length} directory${config.directories.length > 1 ? 'ies' : 'y'} configured`
                  : 'No directories configured'
                }
                {cacheStatus && (
                  <span className="ml-2">
                    • {cacheStatus.repositoryCount} repositories in repositories.yml
                    {cacheStatus.lastUpdated && (
                      <span className="ml-1">
                        (last scan: {new Date(cacheStatus.lastUpdated).toLocaleDateString()})
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshRepositoriesInBackground}
              disabled={isRefreshingRepositories}
              className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)'
              }}
              title="Refresh repositories scan"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshingRepositories ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={loadConfig}
              disabled={loading}
              className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh configuration"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => window.location.hash = '#/config'}
              className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                color: 'var(--text-secondary)'
              }}
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Directories List */}
        {config?.directories?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {config.directories.map((directory) => (
              <div
                key={directory.id}
                className="card hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => loadFoldersForDirectory(directory)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Folder className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                        {directory.tag || 'Untagged'}
                      </h3>
                      <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                        {directory.path}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{
                    backgroundColor: directory.enabled 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(107, 114, 128, 0.1)',
                    color: directory.enabled 
                      ? 'var(--success)' 
                      : 'var(--text-secondary)'
                  }}>
                    {directory.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Click to view folders
                  </span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Directories Configured
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Add directories in settings to scan for repositories
            </p>
            <button
              onClick={() => window.location.hash = '#/config'}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configure Directories
            </button>
          </div>
        )}

        {/* Toast Messages */}
        {message.text && (
          <Toast
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}
      </div>
    )
  }

  // Show folders list for selected directory
  if (!selectedFolder) {
    return (
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={goBackToDirectories}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                color: 'var(--text-secondary)'
              }}
              title="Back to directories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Folder className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedDirectory.tag || 'Untagged'} Repositories
                </h1>
                <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                  {selectedDirectory.path}
                </p>
              </div>
            </div>
            
            {repositories.length > 0 && (
              <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full flex-shrink-0" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)'
              }}>
                {searchQuery ? `${filteredRepositories.length}/${repositories.length}` : repositories.length} {repositories.length === 1 ? 'repo' : 'repos'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => loadFoldersForDirectory(selectedDirectory)}
              disabled={loading}
              className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh folders"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => window.location.hash = '#/config'}
              className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                color: 'var(--text-secondary)'
              }}
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search repositories by name, path, branch, or remote... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                focusRingColor: 'var(--accent-primary)'
              }}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--text-muted)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-black/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Found {filteredRepositories.length} repository{filteredRepositories.length !== 1 ? 'ies' : ''} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Repositories Grid */}
        {filteredRepositories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepositories.map((folder) => (
              <div
                key={folder.path}
                className="group relative p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                  border: '1px solid var(--border-primary)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => loadRepositoryInfo(folder.path, selectedDirectory.tag)}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
                  e.target.style.borderColor = 'var(--accent-primary)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))'
                  e.target.style.borderColor = 'var(--border-primary)'
                }}
              >
                {/* Repository Icon and Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <GitBranch className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {folder.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {selectedDirectory.tag || 'Untagged'}
                      </p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Repository Path */}
                <div className="mb-4">
                  <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }} title={folder.path}>
                    {folder.path}
                  </p>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Git Repository
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      loadRepositoryInfo(folder.path, selectedDirectory.tag)
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchQuery ? 'No Matching Repositories' : 'No Repositories Found'}
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery 
                ? `No repositories match your search for "${searchQuery}"`
                : `No Git repositories found in ${selectedDirectory.path}`
              }
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => loadFoldersForDirectory(selectedDirectory)}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Retry Scan
              </button>
            )}
          </div>
        )}

        {/* Toast Messages */}
        {message.text && (
          <Toast
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}
      </div>
    )
  }

  // Show repository details for selected folder
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={goBackToFolders}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              color: 'var(--text-secondary)'
            }}
            title="Back to folders"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <GitBranch className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedFolder.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {selectedFolder.path}
              </p>
            </div>
          </div>
          
          {getStatusIcon(selectedFolder)}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadRepositoryInfo(selectedFolder.path, selectedDirectory.tag, true)}
            disabled={loading}
            className="p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'var(--accent-primary)'
            }}
            title="Refresh repository info"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => window.location.hash = '#/config'}
            className="p-3 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              color: 'var(--text-secondary)'
            }}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Repository Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repository Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <GitBranch className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedFolder.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedFolder.path}
                </p>
              </div>
              {getStatusIcon(selectedFolder)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Current Branch</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedFolder.branch || 'No branch'}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Commit</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(selectedFolder.lastCommitDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Remote</span>
                  </div>
                  <p className="text-sm font-mono truncate" style={{ color: 'var(--text-primary)' }} title={selectedFolder.remote || 'None'}>
                    {selectedFolder.remote || 'None'}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ 
                      backgroundColor: selectedFolder.hasChanges ? 'var(--warning)' : 
                                  selectedFolder.isUpToDate ? 'var(--success)' : 'var(--error)' 
                    }}></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedFolder.hasChanges ? 'Has changes' : 
                     selectedFolder.isUpToDate ? 'Up to date' : 'Behind remote'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => handleOpenRepository(selectedFolder.path)}
              className="w-full px-4 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              <ExternalLink className="w-5 h-5" />
              <span>Open in File Explorer</span>
            </button>
            <button
              onClick={() => handleOpenInEditor(selectedFolder.path)}
              className="w-full px-4 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)'
              }}
            >
              <FileText className="w-5 h-5" />
              <span>Open in {appConfig?.defaultEditor === 'cursor' ? 'Cursor' : 'VS Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Git Graph */}
      <div className="mt-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <GitCommit className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent Commits
              </h3>
              <span className="text-sm px-2 py-1 rounded-full" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)'
              }}>
                {repositoryCommits[selectedFolder.path]?.length || 0} commits
              </span>
            </div>
            <button
              onClick={() => loadRepositoryCommits(selectedFolder.path, true)}
              className="p-3 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh commits"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <GitGraph 
            commits={repositoryCommits[selectedFolder.path] || []} 
            currentBranch={selectedFolder.branch}
          />
        </div>
      </div>

      {/* Toast Messages */}
      {message.text && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}
    </div>
  )
}

export default Repositories 