import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Settings, 
  GitBranch, 
  GitPullRequest, 
  GitMerge, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Download,
  Upload,
  Folder,
  RefreshCw
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import JiraStatusConfig from './JiraStatusConfig'
import Toast from '../layout/Toast'

const Configuration = () => {
  const location = useLocation()
  const [config, setConfig] = useState(null)
  const [repositoriesConfig, setRepositoriesConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showJiraStatusConfig, setShowJiraStatusConfig] = useState(false)
  const { setThemeValue } = useTheme()

  // Check if we should show Jira status config based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('showJiraStatus') === 'true') {
      setShowJiraStatusConfig(true)
    }
  }, [location.search])

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const [configData, reposConfig] = await Promise.all([
          window.electronAPI.getConfig(),
          window.electronAPI.getRepositoriesConfig()
        ])
        setConfig(configData)
        setRepositoriesConfig(reposConfig)
      } else {
        setMessage({ type: 'error', text: 'Electron API not available' })
      }
    } catch (error) {
      console.error('Error loading config:', error)
      setMessage({ type: 'error', text: 'Error loading configuration' })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      if (window.electronAPI) {
        const [configResult, reposResult] = await Promise.all([
          window.electronAPI.saveConfig(config),
          window.electronAPI.updateRepositoriesConfig(repositoriesConfig)
        ])
        
        // Check if both operations were successful
        if (configResult?.success && reposResult?.success) {
          setMessage({ type: 'success', text: 'Configuration saved successfully!' })
          
          // Dispatch event to notify other components about config changes
          window.dispatchEvent(new CustomEvent('config-changed'))
        } else {
          throw new Error('One or more save operations failed')
        }
      } else {
        throw new Error('Electron API not available')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: error.message || 'Error saving configuration' })
    } finally {
      setSaving(false)
    }
  }

  const clearCache = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.clearCache()
        setMessage({ type: 'success', text: 'Cache cleared successfully!' })
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      setMessage({ type: 'error', text: 'Error clearing cache' })
    }
  }

  const triggerBackgroundRefresh = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.triggerBackgroundRefresh()
        setMessage({ type: 'success', text: 'Background refresh triggered!' })
      }
    } catch (error) {
      console.error('Error triggering background refresh:', error)
      setMessage({ type: 'error', text: 'Error triggering background refresh' })
    }
  }

  const exportConfig = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.exportConfig()
        setMessage({ type: 'success', text: 'Configuration exported successfully!' })
      }
    } catch (error) {
      console.error('Error exporting config:', error)
      setMessage({ type: 'error', text: 'Error exporting configuration' })
    }
  }

  const importConfig = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.importConfig()
        setMessage({ type: 'success', text: 'Configuration imported successfully!' })
        // Reload config after import
        await loadConfig()
      }
    } catch (error) {
      console.error('Error importing config:', error)
      setMessage({ type: 'error', text: 'Error importing configuration' })
    }
  }

  const updateConfig = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const updateRepositoriesConfig = (key, value) => {
    setRepositoriesConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const selectRepositoriesPath = async () => {
    try {
      if (window.electronAPI && window.electronAPI.selectDirectory) {
        const result = await window.electronAPI.selectDirectory()
        if (result && result.success && result.folderPath) {
          const newDirectory = {
            id: Date.now().toString(),
            path: result.folderPath,
            tag: '',
            enabled: true
          }
          
          const updatedDirectories = [...(repositoriesConfig?.directories || []), newDirectory]
          updateRepositoriesConfig('directories', updatedDirectories)
        }
      } else {
        setMessage({ type: 'error', text: 'Directory selection not available' })
      }
    } catch (error) {
      console.error('Error selecting directory:', error)
      setMessage({ type: 'error', text: 'Error selecting directory' })
    }
  }

  const removeDirectory = (directoryId) => {
    const updatedDirectories = repositoriesConfig?.directories?.filter(dir => dir.id !== directoryId) || []
    updateRepositoriesConfig('directories', updatedDirectories)
  }

  const updateDirectory = (directoryId, field, value) => {
    const updatedDirectories = repositoriesConfig?.directories?.map(dir => 
      dir.id === directoryId ? { ...dir, [field]: value } : dir
    ) || []
    updateRepositoriesConfig('directories', updatedDirectories)
  }

  if (showJiraStatusConfig) {
    return (
      <JiraStatusConfig
        config={config}
        updateConfig={updateConfig}
        onBack={() => setShowJiraStatusConfig(false)}
      />
    )
  }

  if (loading || !config) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
            {loading ? 'Loading configuration...' : 'Configuration not available'}
          </p>
          {!window.electronAPI && (
            <p className="mt-2 text-sm" style={{ color: 'var(--error)' }}>
              Electron API not available. Make sure you're running the app with Electron.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Settings className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Configuration</h1>
            </div>

            <div className="space-y-8">
              {/* Import/Export Information */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Import & Export Configuration
                  </h2>
                </div>
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Export your configuration to backup or share with your team. Import configuration files to quickly set up DevBuddy on a new machine.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Export includes:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• All integration settings (Jira, GitHub, GitLab)</li>
                        <li>• Local shortcuts configuration</li>
                        <li>• Redirect rules</li>
                        <li>• App preferences</li>
                      </ul>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Import features:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Automatic backup of current config</li>
                        <li>• Version compatibility check</li>
                        <li>• Validation of file format</li>
                        <li>• Real-time updates after import</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jira Configuration */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <GitBranch className="w-6 h-6" style={{ color: '#3b82f6' }} />
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Jira</h2>
                  <label className="flex items-center gap-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={config?.jira?.enabled || false}
                      onChange={(e) => updateConfig('jira', 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        accentColor: 'var(--accent-primary)'
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable</span>
                  </label>
                </div>
                
                {config?.jira?.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL</label>
                        <input
                          type="url"
                          placeholder="https://your-domain.atlassian.net"
                          value={config?.jira?.baseUrl || ''}
                          onChange={(e) => updateConfig('jira', 'baseUrl', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
                        <input
                          type="text"
                          placeholder="your-email@domain.com"
                          value={config?.jira?.username || ''}
                          onChange={(e) => updateConfig('jira', 'username', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Token</label>
                      <input
                        type="password"
                        placeholder="Enter your Jira API token"
                        value={config?.jira?.apiToken || ''}
                        onChange={(e) => updateConfig('jira', 'apiToken', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Get your API token from <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>Atlassian Account Settings</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* GitHub Configuration */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <GitPullRequest className="w-6 h-6" style={{ color: '#10b981' }} />
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GitHub</h2>
                  <label className="flex items-center gap-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={config?.github?.enabled || false}
                      onChange={(e) => updateConfig('github', 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        accentColor: 'var(--accent-primary)'
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable</span>
                  </label>
                </div>
                
                {config?.github?.enabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Token</label>
                      <input
                        type="password"
                        placeholder="Enter your GitHub Personal Access Token"
                        value={config?.github?.apiToken || ''}
                        onChange={(e) => updateConfig('github', 'apiToken', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Create a token with <code>repo</code> and <code>read:org</code> scopes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* GitLab Configuration */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <GitMerge className="w-6 h-6" style={{ color: '#f97316' }} />
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GitLab</h2>
                  <label className="flex items-center gap-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={config?.gitlab?.enabled || false}
                      onChange={(e) => updateConfig('gitlab', 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        accentColor: 'var(--accent-primary)'
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable</span>
                  </label>
                </div>
                
                {config?.gitlab?.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL</label>
                        <input
                          type="url"
                          placeholder="https://gitlab.com"
                          value={config?.gitlab?.baseUrl || 'https://gitlab.com'}
                          onChange={(e) => updateConfig('gitlab', 'baseUrl', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Token</label>
                        <input
                          type="password"
                          placeholder="Enter your GitLab Personal Access Token"
                          value={config?.gitlab?.apiToken || ''}
                          onChange={(e) => updateConfig('gitlab', 'apiToken', e.target.value)}
                          className="w-full rounded-lg px-3 py-2 focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Repositories Configuration */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <Folder className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Local Repositories</h2>
                  <label className="flex items-center gap-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={repositoriesConfig?.enabled || false}
                      onChange={(e) => updateRepositoriesConfig('enabled', e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        accentColor: 'var(--accent-primary)'
                      }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable</span>
                  </label>
                </div>
                
                {repositoriesConfig?.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Scan Depth</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={repositoriesConfig?.scanDepth || 3}
                          onChange={(e) => updateRepositoriesConfig('scanDepth', parseInt(e.target.value) || 3)}
                          className="w-full rounded-lg px-3 py-2 focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          How deep to scan for repositories (1-10 levels)
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Add Directory</label>
                        <button
                          onClick={selectRepositoriesPath}
                          className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: 'var(--accent-primary)'
                          }}
                        >
                          Browse
                        </button>
                      </div>
                    </div>

                    {/* Directories List */}
                    {repositoriesConfig?.directories && repositoriesConfig.directories.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Directories</h4>
                        {repositoriesConfig.directories.map((directory) => (
                          <div
                            key={directory.id}
                            className="p-4 rounded-lg border"
                            style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              borderColor: 'var(--border-primary)'
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={directory.enabled}
                                  onChange={(e) => updateDirectory(directory.id, 'enabled', e.target.checked)}
                                  className="w-4 h-4 rounded"
                                  style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-primary)',
                                    accentColor: 'var(--accent-primary)'
                                  }}
                                />
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {directory.path}
                                </span>
                              </div>
                              <button
                                onClick={() => removeDirectory(directory.id)}
                                className="text-sm px-2 py-1 rounded transition-all duration-300"
                                style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  color: 'var(--error)'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Tag (optional)"
                              value={directory.tag || ''}
                              onChange={(e) => updateDirectory(directory.id, 'tag', e.target.value)}
                              className="w-full rounded-lg px-3 py-2 focus:outline-none"
                              style={{
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* App Settings */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <Settings className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                  <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>App Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Theme</label>
                      <select
                        value={config?.app?.theme || 'dark'}
                        onChange={(e) => {
                          updateConfig('app', 'theme', e.target.value)
                          setThemeValue(e.target.value)
                        }}
                        className="w-full rounded-lg px-3 py-2 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Default Editor</label>
                      <select
                        value={config?.app?.defaultEditor || 'vscode'}
                        onChange={(e) => updateConfig('app', 'defaultEditor', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="vscode">VS Code</option>
                        <option value="cursor">Cursor</option>
                      </select>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Default editor for opening repositories
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Redirector Port</label>
                      <input
                        type="number"
                        min="1024"
                        max="65535"
                        value={config?.app?.redirectorPort || 10000}
                        onChange={(e) => updateConfig('app', 'redirectorPort', parseInt(e.target.value) || 10000)}
                        className="w-full rounded-lg px-3 py-2 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Port for local redirector server (1024-65535)
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto Start</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Start DevBuddy automatically when you log in
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config?.app?.autoStart || false}
                          onChange={(e) => updateConfig('app', 'autoStart', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Notifications</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Show desktop notifications for updates and events
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config?.app?.notifications || true}
                          onChange={(e) => updateConfig('app', 'notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Background Refresh</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Automatically refresh data in the background
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config?.app?.backgroundRefresh || true}
                          onChange={(e) => updateConfig('app', 'backgroundRefresh', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="border-t p-6" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={clearCache}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                color: 'var(--text-secondary)'
              }}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Clear Cache
            </button>
            
            <button
              onClick={triggerBackgroundRefresh}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh Data
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={exportConfig}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)'
              }}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            
            <button
              onClick={importConfig}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: 'var(--warning)'
              }}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Import
            </button>
            
            <button
              onClick={saveConfig}
              disabled={saving}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {message.text && (
        <Toast
          message={message}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}
    </div>
  )
}

export default Configuration 