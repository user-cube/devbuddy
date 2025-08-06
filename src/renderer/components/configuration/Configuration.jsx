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
  Filter
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import JiraStatusConfig from './JiraStatusConfig'

const Configuration = () => {
  const location = useLocation()
  const [config, setConfig] = useState(null)
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
        const configData = await window.electronAPI.getConfig()
        setConfig(configData)
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
        await window.electronAPI.saveConfig(config)
        setMessage({ type: 'success', text: 'Configuration saved successfully!' })
        
        // Dispatch event to notify other components about config changes
        window.dispatchEvent(new CustomEvent('config-changed'))
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
        setMessage({ type: 'success', text: 'Background refresh triggered successfully!' })
      }
    } catch (error) {
      console.error('Error triggering background refresh:', error)
      setMessage({ type: 'error', text: 'Error triggering background refresh' })
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

    // If updating theme, also update the theme context
    if (section === 'app' && key === 'theme') {
      setThemeValue(value)
    }

    // Dispatch event to notify other components about integration enable/disable changes
    // Use debounce to avoid too many events
    if ((section === 'jira' || section === 'github' || section === 'gitlab') && key === 'enabled') {
      clearTimeout(window.configChangeTimeout)
      window.configChangeTimeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('config-unsaved'))
      }, 100)
    }
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

            {/* Message */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </span>
              </div>
            )}

            <div className="space-y-8">
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="Jira Base URL (e.g., https://company.atlassian.net)"
                    value={config?.jira?.baseUrl || ''}
                    onChange={(e) => updateConfig('jira', 'baseUrl', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={config?.jira?.username || ''}
                    onChange={(e) => updateConfig('jira', 'username', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="password"
                    placeholder="API Token"
                    value={config?.jira?.apiToken || ''}
                    onChange={(e) => updateConfig('jira', 'apiToken', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Project Keys (comma-separated)"
                    value={config?.jira?.projectKeys?.join(', ') || ''}
                    onChange={(e) => updateConfig('jira', 'projectKeys', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Default Project Key"
                    value={config?.jira?.defaultProject || ''}
                    onChange={(e) => updateConfig('jira', 'defaultProject', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Refresh Interval (seconds)"
                    value={config?.jira?.refreshInterval || 300}
                    onChange={(e) => updateConfig('jira', 'refreshInterval', parseInt(e.target.value) || 300)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max Results"
                    value={config?.jira?.maxResults || 50}
                    onChange={(e) => updateConfig('jira', 'maxResults', parseInt(e.target.value) || 50)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config?.jira?.showClosed || false}
                        onChange={(e) => updateConfig('jira', 'showClosed', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Show Closed Issues</span>
                    </label>
                  </div>
                </div>

                {/* Status Configuration Button */}
                <div className="mt-6 p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Status Filtering
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Configure which Jira statuses to show or hide in the dashboard
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span>Excluded: {config?.jira?.excludedStatuses?.length || 0}</span>
                        <span>Included: {config?.jira?.includedStatuses?.length || 0}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowJiraStatusConfig(true)}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: 'var(--accent-primary)'
                      }}
                    >
                      <Filter className="w-4 h-4" />
                      Configure Statuses
                    </button>
                  </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
                    <input
                      type="text"
                      placeholder="GitHub username"
                      value={config?.github?.username || ''}
                      onChange={(e) => updateConfig('github', 'username', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Personal Access Token</label>
                    <input
                      type="password"
                      placeholder="GitHub Personal Access Token"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Organizations</label>
                    <input
                      type="text"
                      placeholder="org1, org2, org3"
                      value={config?.github?.organizations?.join(', ') || ''}
                      onChange={(e) => updateConfig('github', 'organizations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Comma-separated list of organizations to monitor
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Default Organization</label>
                    <input
                      type="text"
                      placeholder="Default organization"
                      value={config?.github?.defaultOrg || ''}
                      onChange={(e) => updateConfig('github', 'defaultOrg', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      min="60"
                      max="3600"
                      value={config?.github?.refreshInterval || 300}
                      onChange={(e) => updateConfig('github', 'refreshInterval', parseInt(e.target.value) || 300)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Max Results</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={config?.github?.maxResults || 50}
                      onChange={(e) => updateConfig('github', 'maxResults', parseInt(e.target.value) || 50)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config?.github?.showDrafts !== false}
                        onChange={(e) => updateConfig('github', 'showDrafts', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Show Draft PRs</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GitLab Configuration */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <GitMerge className="w-6 h-6" style={{ color: '#f56565' }} />
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
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
                    <input
                      type="text"
                      placeholder="GitLab username"
                      value={config?.gitlab?.username || ''}
                      onChange={(e) => updateConfig('gitlab', 'username', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Personal Access Token</label>
                    <input
                      type="password"
                      placeholder="GitLab Personal Access Token"
                      value={config?.gitlab?.apiToken || ''}
                      onChange={(e) => updateConfig('gitlab', 'apiToken', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Create a token with <code>read_api</code> scope
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Default Group</label>
                    <input
                      type="text"
                      placeholder="Default group"
                      value={config?.gitlab?.defaultGroup || ''}
                      onChange={(e) => updateConfig('gitlab', 'defaultGroup', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      min="60"
                      max="3600"
                      value={config?.gitlab?.refreshInterval || 300}
                      onChange={(e) => updateConfig('gitlab', 'refreshInterval', parseInt(e.target.value) || 300)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Max Results</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={config?.gitlab?.maxResults || 50}
                      onChange={(e) => updateConfig('gitlab', 'maxResults', parseInt(e.target.value) || 50)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config?.gitlab?.showDrafts !== false}
                        onChange={(e) => updateConfig('gitlab', 'showDrafts', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Show Draft MRs</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* App Configuration */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <Settings className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>App Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Theme</label>
                <select
                  value={config?.app?.theme || 'dark'}
                  onChange={(e) => updateConfig('app', 'theme', e.target.value)}
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Update Interval (seconds)</label>
                <input
                  type="number"
                  min="60"
                  max="3600"
                  value={config?.app?.updateInterval || 300}
                  onChange={(e) => updateConfig('app', 'updateInterval', parseInt(e.target.value))}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>How often to automatically refresh data in background</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Background Refresh</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={config?.app?.backgroundRefresh !== false}
                      onChange={(e) => updateConfig('app', 'backgroundRefresh', e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        accentColor: 'var(--accent-primary)'
                      }}
                    />
                    <span>Enable automatic background refresh</span>
                  </label>
                  <button
                    onClick={triggerBackgroundRefresh}
                    className="px-3 py-1 text-sm rounded-lg font-medium transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    Test Refresh
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Automatically refresh data even when app is minimized</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Redirector Port</label>
                <input
                  type="number"
                  min="1024"
                  max="65535"
                  value={config?.app?.redirectorPort || 10000}
                  onChange={(e) => updateConfig('app', 'redirectorPort', parseInt(e.target.value))}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Port for local redirector server (default: 10000)</p>
              </div>
              
              <label className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={config?.app?.autoStart || false}
                  onChange={(e) => updateConfig('app', 'autoStart', e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    accentColor: 'var(--accent-primary)'
                  }}
                />
                <span>Auto-start with system</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config?.app?.notifications || false}
                  onChange={(e) => updateConfig('app', 'notifications', e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    accentColor: 'var(--accent-primary)'
                  }}
                />
                <span style={{ color: 'var(--text-primary)' }}>Enable notifications</span>
              </label>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer - Action Buttons */}
      <div className="flex-shrink-0 p-6" style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-primary)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={clearCache}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                color: 'var(--text-secondary)'
              }}
            >
              Clear Cache
            </button>
            <button
              onClick={saveConfig}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuration 