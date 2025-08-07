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
  FileText
} from 'lucide-react'
import Toast from '../layout/Toast'

// Git Graph Component
const GitGraph = ({ commits, currentBranch }) => {
  if (!commits || commits.length === 0) {
    return (
      <div className="text-center py-8">
        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" style={{ color: 'var(--text-muted)' }} />
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
    <div className="space-y-3">
      {commits.map((commit, index) => (
        <div key={commit.hash} className="flex items-start gap-3">
          {/* Commit line */}
          <div className="flex flex-col items-center">
            <div 
              className="w-3 h-3 rounded-full border-2"
              style={{ 
                backgroundColor: getCommitColor(commit),
                borderColor: getCommitColor(commit)
              }}
            />
            {index < commits.length - 1 && (
              <div 
                className="w-0.5 h-8 mt-1"
                style={{ backgroundColor: 'var(--border)' }}
              />
            )}
          </div>
          
          {/* Commit info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {commit.message}
              </span>
              {commit.branch === currentBranch && (
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--accent-primary)'
                }}>
                  {commit.branch}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{commit.author}</span>
              <span>{formatDate(commit.date)}</span>
              <span className="font-mono">{commit.hash.substring(0, 7)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const Repositories = () => {
  const [repositories, setRepositories] = useState([])
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

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getRepositoriesConfig()
      setConfig(config)
      
      // Load app config to get default editor
      const appConfigData = await window.electronAPI.getConfig()
      setAppConfig(appConfigData?.app)
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
      setSelectedDirectory(directory)
    } catch (error) {
      console.error('Error loading folders for directory:', error)
      setError('Failed to load folders for this directory')
    } finally {
      setLoading(false)
    }
  }

  const loadRepositoryInfo = async (folderPath, tag) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if we already have repository info for this folder
      if (folderRepositoryInfo[folderPath]) {
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
      await loadRepositoryCommits(folderPath)
    } catch (error) {
      console.error('Error loading repository info:', error)
      setError('Failed to load repository information')
    } finally {
      setLoading(false)
    }
  }

  const loadRepositoryCommits = async (folderPath) => {
    try {
      // Check if we already have commits for this folder
      if (repositoryCommits[folderPath]) {
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Folder className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Repositories</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {config?.directories?.length > 0 
                    ? `${config.directories.length} directory${config.directories.length > 1 ? 'ies' : 'y'} configured`
                    : 'No directories configured'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadConfig}
              disabled={loading}
              className="p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh configuration"
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

        {/* Directories List */}
        {config?.directories?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.directories.map((directory) => (
              <div
                key={directory.id}
                className="card hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => loadFoldersForDirectory(directory)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Folder className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {directory.tag || 'Untagged'}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {directory.path}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{
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
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Click to view folders
                  </span>
                  <ExternalLink className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
            
            <div className="flex items-center gap-3">
              <Folder className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedDirectory.tag || 'Untagged'} Folders
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedDirectory.path}
                </p>
              </div>
            </div>
            
            {repositories.length > 0 && (
              <span className="text-sm px-3 py-1 rounded-full" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)'
              }}>
                {repositories.length} {repositories.length === 1 ? 'folder' : 'folders'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadFoldersForDirectory(selectedDirectory)}
              disabled={loading}
              className="p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh folders"
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

        {/* Folders Table */}
        {repositories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Folder</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Type</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {repositories.map((folder) => (
                  <tr 
                    key={folder.path} 
                    className="border-b hover:bg-opacity-50 transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => loadRepositoryInfo(folder.path, selectedDirectory.tag)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {folder.isGitRepository ? (
                          <GitBranch className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                        ) : (
                          <Folder className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        )}
                        <div>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {folder.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {folder.path}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm px-2 py-1 rounded-full" style={{
                        backgroundColor: folder.isGitRepository 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : 'rgba(107, 114, 128, 0.1)',
                        color: folder.isGitRepository 
                          ? 'var(--success)' 
                          : 'var(--text-secondary)'
                      }}>
                        {folder.isGitRepository ? 'Git Repository' : 'Regular Folder'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {folder.isGitRepository ? 'Click to view details' : 'Not a repository'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (folder.isGitRepository) {
                            loadRepositoryInfo(folder.path, selectedDirectory.tag)
                          }
                        }}
                        disabled={!folder.isGitRepository}
                        className="px-3 py-1 rounded text-sm transition-all duration-300 disabled:opacity-50"
                        style={{
                          backgroundColor: folder.isGitRepository 
                            ? 'rgba(59, 130, 246, 0.1)' 
                            : 'rgba(107, 114, 128, 0.1)',
                          border: folder.isGitRepository 
                            ? '1px solid rgba(59, 130, 246, 0.2)' 
                            : '1px solid rgba(107, 114, 128, 0.2)',
                          color: folder.isGitRepository 
                            ? 'var(--accent-primary)' 
                            : 'var(--text-secondary)'
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Folders Found
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              No folders found in {selectedDirectory.path}
            </p>
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
            onClick={() => loadRepositoryInfo(selectedFolder.path, selectedDirectory.tag)}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Info */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Repository Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Branch:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {selectedFolder.branch || 'No branch'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Last commit:</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {formatDate(selectedFolder.lastCommitDate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Remote:</span>
              <span className="truncate ml-2" style={{ color: 'var(--text-primary)' }}>
                {selectedFolder.remote || 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedFolder)}
                <span style={{ color: 'var(--text-primary)' }}>
                  {selectedFolder.hasChanges ? 'Has changes' : 
                   selectedFolder.isUpToDate ? 'Up to date' : 'Behind remote'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleOpenRepository(selectedFolder.path)}
              className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              <ExternalLink className="w-4 h-4 inline mr-2" />
              Open in File Explorer
            </button>
            <button
              onClick={() => handleOpenInEditor(selectedFolder.path)}
              className="w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Open in {appConfig?.defaultEditor === 'cursor' ? 'Cursor' : 'VS Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Git Graph */}
      <div className="mt-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Commits
            </h3>
            <button
              onClick={() => loadRepositoryCommits(selectedFolder.path)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh commits"
            >
              <RefreshCw className="w-4 h-4" />
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