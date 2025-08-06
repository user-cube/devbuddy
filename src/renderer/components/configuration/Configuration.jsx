import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  GitBranch, 
  GitPullRequest, 
  GitMerge, 
  Save, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const Configuration = () => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const { setThemeValue } = useTheme()

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
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setMessage({ type: 'error', text: error.message || 'Error saving configuration' })
    } finally {
      setSaving(false)
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
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Configuration
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Configure your development tools and shortcuts
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div 
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{
            backgroundColor: message.type === 'success' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: message.type === 'success' 
              ? '1px solid rgba(16, 185, 129, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.3)',
            color: message.type === 'success' 
              ? 'var(--success)' 
              : 'var(--error)'
          }}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Jira Configuration */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-600">
            <GitBranch className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold">Jira</h2>
            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={config?.jira?.enabled || false}
                onChange={(e) => updateConfig('jira', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm">Enable</span>
            </label>
          </div>
          
          {config?.jira?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                  type="url"
                  placeholder="Jira Base URL (e.g., https://company.atlassian.net)"
                  value={config?.jira?.baseUrl || ''}
                  onChange={(e) => updateConfig('jira', 'baseUrl', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
                              <input
                  type="text"
                  placeholder="Username"
                  value={config?.jira?.username || ''}
                  onChange={(e) => updateConfig('jira', 'username', e.target.value)}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="API Token"
                  value={config?.jira?.apiToken || ''}
                  onChange={(e) => updateConfig('jira', 'apiToken', e.target.value)}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Project Keys (comma-separated)"
                  value={config?.jira?.projectKeys?.join(', ') || ''}
                  onChange={(e) => updateConfig('jira', 'projectKeys', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Default Project Key"
                  value={config?.jira?.defaultProject || ''}
                  onChange={(e) => updateConfig('jira', 'defaultProject', e.target.value)}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Refresh Interval (seconds)"
                  value={config?.jira?.refreshInterval || 300}
                  onChange={(e) => updateConfig('jira', 'refreshInterval', parseInt(e.target.value) || 300)}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Results"
                  value={config?.jira?.maxResults || 50}
                  onChange={(e) => updateConfig('jira', 'maxResults', parseInt(e.target.value) || 50)}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config?.jira?.showClosed || false}
                      onChange={(e) => updateConfig('jira', 'showClosed', e.target.checked)}
                      className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">Show Closed Issues</span>
                  </label>
                </div>
              </div>
            )}
        </div>

        {/* GitHub Configuration */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-600">
            <GitPullRequest className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-semibold">GitHub</h2>
            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={config?.github?.enabled || false}
                onChange={(e) => updateConfig('github', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm">Enable</span>
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
                    onChange={(e) => updateConfig('github', 'refreshInterval', parseInt(e.target.value))}
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
                    onChange={(e) => updateConfig('github', 'maxResults', parseInt(e.target.value))}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={config?.github?.showDrafts || true}
                        onChange={(e) => updateConfig('github', 'showDrafts', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span className="text-sm">Show Draft PRs</span>
                    </label>
                    <label className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={config?.github?.showClosed || false}
                        onChange={(e) => updateConfig('github', 'showClosed', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span className="text-sm">Show Closed PRs</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GitLab Configuration */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-600">
            <GitMerge className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-semibold">GitLab</h2>
            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={config?.gitlab?.enabled || false}
                onChange={(e) => updateConfig('gitlab', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm">Enable</span>
            </label>
          </div>
          
          {config?.gitlab?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="GitLab Base URL"
                value={config?.gitlab?.baseUrl || ''}
                onChange={(e) => updateConfig('gitlab', 'baseUrl', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Username"
                value={config?.gitlab?.username || ''}
                onChange={(e) => updateConfig('gitlab', 'username', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Personal Access Token"
                value={config?.gitlab?.apiToken || ''}
                onChange={(e) => updateConfig('gitlab', 'apiToken', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Default Group (optional)"
                value={config?.gitlab?.defaultGroup || ''}
                onChange={(e) => updateConfig('gitlab', 'defaultGroup', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Refresh Interval (seconds)"
                value={config?.gitlab?.refreshInterval || 300}
                onChange={(e) => updateConfig('gitlab', 'refreshInterval', parseInt(e.target.value) || 300)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max Results"
                value={config?.gitlab?.maxResults || 50}
                onChange={(e) => updateConfig('gitlab', 'maxResults', parseInt(e.target.value) || 50)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config?.gitlab?.showDrafts !== false}
                    onChange={(e) => updateConfig('gitlab', 'showDrafts', e.target.checked)}
                    className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">Show Drafts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config?.gitlab?.showClosed || false}
                    onChange={(e) => updateConfig('gitlab', 'showClosed', e.target.checked)}
                    className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">Show Closed</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* App Configuration */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-6 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <Settings className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>App Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <span>Enable notifications</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
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
  )
}

export default Configuration 