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

const Configuration = () => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

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
  }



  if (loading || !config) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-dark-300">
            {loading ? 'Loading configuration...' : 'Configuration not available'}
          </p>
          {!window.electronAPI && (
            <p className="mt-2 text-red-400 text-sm">
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
          Configuration
        </h1>
        <p className="text-dark-300 text-lg">
          Configure your development tools and shortcuts
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={config?.github?.username || ''}
                onChange={(e) => updateConfig('github', 'username', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Personal Access Token"
                value={config?.github?.apiToken || ''}
                onChange={(e) => updateConfig('github', 'apiToken', e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Organizations (comma-separated)"
                value={config?.github?.organizations?.join(', ') || ''}
                onChange={(e) => updateConfig('github', 'organizations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
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
            </div>
          )}
        </div>

        {/* App Configuration */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-600">
            <Settings className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-semibold">App Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Theme</label>
              <select
                value={config?.app?.theme || 'dark'}
                onChange={(e) => updateConfig('app', 'theme', e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Update Interval (seconds)</label>
              <input
                type="number"
                min="60"
                max="3600"
                value={config?.app?.updateInterval || 300}
                onChange={(e) => updateConfig('app', 'updateInterval', parseInt(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Redirector Port</label>
              <input
                type="number"
                min="1024"
                max="65535"
                value={config?.app?.redirectorPort || 10000}
                onChange={(e) => updateConfig('app', 'redirectorPort', parseInt(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-dark-400 mt-1">Port for local redirector server (default: 10000)</p>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config?.app?.autoStart || false}
                onChange={(e) => updateConfig('app', 'autoStart', e.target.checked)}
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
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