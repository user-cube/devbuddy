import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import JiraStatusConfig from './JiraStatusConfig'
import Toast from '../layout/Toast'
import Loading from '../layout/Loading'
import ImportExportInfo from './ImportExportInfo'
import JiraConfig from './JiraConfig'
import GitHubConfig from './GitHubConfig'
import GitLabConfig from './GitLabConfig'
import BitbucketConfig from './BitbucketConfig'
import RepositoriesConfig from './RepositoriesConfig'
import AppSettings from './AppSettings'
import ConfigurationActions from './ConfigurationActions'

const Configuration = () => {
  const location = useLocation()
  const navigate = useNavigate()
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
    return <Loading fullScreen message={loading ? 'Loading configuration...' : 'Configuration not available'} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
              <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Configuration</h1>
              </div>

            </div>

            <div className="space-y-8">
              {/* Import/Export Information */}
              <ImportExportInfo />

              {/* Jira Configuration */}
              <JiraConfig config={config} updateConfig={updateConfig} />

              {/* GitHub Configuration */}
              <GitHubConfig config={config} updateConfig={updateConfig} />

              {/* GitLab Configuration */}
              <GitLabConfig config={config} updateConfig={updateConfig} />

              {/* Bitbucket Configuration */}
              <BitbucketConfig config={config} updateConfig={updateConfig} />

              {/* Repositories Configuration */}
              <RepositoriesConfig 
                repositoriesConfig={repositoriesConfig}
                updateRepositoriesConfig={updateRepositoriesConfig}
              />

              {/* App Settings */}
              <AppSettings 
                config={config} 
                updateConfig={updateConfig} 
                setThemeValue={setThemeValue}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Actions */}
      <ConfigurationActions
        saving={saving}
        onClearCache={clearCache}
        onTriggerBackgroundRefresh={triggerBackgroundRefresh}
        onExportConfig={exportConfig}
        onImportConfig={importConfig}
        onSaveConfig={saveConfig}
      />

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