import React, { useState, useEffect } from 'react'
import { 
  Rocket, 
  Server, 
  Globe, 
  GitBranch, 
  GitPullRequest, 
  GitMerge,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const Shortcuts = () => {
  const [shortcuts, setShortcuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadShortcuts()
  }, [])

  const loadShortcuts = async () => {
    try {
      if (window.electronAPI) {
        const shortcutsData = await window.electronAPI.getShortcuts()
        setShortcuts(shortcutsData)
      }
    } catch (error) {
      console.error('Error loading shortcuts:', error)
      setMessage({ type: 'error', text: 'Error loading shortcuts' })
    } finally {
      setLoading(false)
    }
  }

  const saveShortcuts = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.updateShortcuts(shortcuts)
        setMessage({ type: 'success', text: 'Shortcuts saved successfully!' })
      }
    } catch (error) {
      console.error('Error saving shortcuts:', error)
      setMessage({ type: 'error', text: error.message || 'Error saving shortcuts' })
    } finally {
      setSaving(false)
    }
  }

  const updateShortcut = (index, field, value) => {
    setShortcuts(prev => prev.map((shortcut, i) => 
      i === index ? { ...shortcut, [field]: value } : shortcut
    ))
  }

  const addShortcut = () => {
    setShortcuts(prev => [...prev, {
      name: '',
      url: '',
      icon: 'rocket',
      description: ''
    }])
  }

  const removeShortcut = (index) => {
    setShortcuts(prev => prev.filter((_, i) => i !== index))
  }

  const openShortcut = async (shortcut) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.openShortcut(shortcut.name)
        if (result.success) {
          setMessage({ type: 'success', text: result.message })
        } else {
          setMessage({ type: 'error', text: result.message })
        }
      }
    } catch (error) {
      console.error('Error opening shortcut:', error)
      setMessage({ type: 'error', text: 'Error opening shortcut' })
    }
  }

  const getIconComponent = (iconName) => {
    const icons = {
      rocket: Rocket,
      server: Server,
      globe: Globe,
      jira: GitBranch,
      github: GitPullRequest,
      gitlab: GitMerge
    }
    return icons[iconName] || Rocket
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-dark-300">Loading shortcuts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
          Shortcuts
        </h1>
        <p className="text-dark-300 text-lg">
          Manage your development shortcuts and quick access links
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

      <div className="space-y-6">
        {/* Shortcuts List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-600">
            <h2 className="text-2xl font-semibold">Your Shortcuts</h2>
            <button
              onClick={saveShortcuts}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save All
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => {
              const IconComponent = getIconComponent(shortcut.icon)
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-dark-800/50 rounded-lg border border-dark-600">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-primary-400" />
                    <input
                      type="text"
                      placeholder="Name"
                      value={shortcut.name}
                      onChange={(e) => updateShortcut(index, 'name', e.target.value)}
                      className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="URL"
                    value={shortcut.url}
                    onChange={(e) => updateShortcut(index, 'url', e.target.value)}
                    className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  />
                  <select
                    value={shortcut.icon}
                    onChange={(e) => updateShortcut(index, 'icon', e.target.value)}
                    className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="rocket">Rocket</option>
                    <option value="server">Server</option>
                    <option value="globe">Globe</option>
                    <option value="jira">Jira</option>
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={shortcut.description}
                    onChange={(e) => updateShortcut(index, 'description', e.target.value)}
                    className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => openShortcut(shortcut)}
                      disabled={!shortcut.url}
                      className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Open shortcut"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeShortcut(index)}
                      className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Remove shortcut"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            
            {shortcuts.length === 0 && (
              <div className="text-center py-8 text-dark-300">
                <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No shortcuts yet. Add your first shortcut below!</p>
              </div>
            )}
            
            <button
              onClick={addShortcut}
              className="w-full bg-primary-500/20 border border-primary-500/30 text-primary-400 px-4 py-3 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Shortcut
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={addShortcut}
              className="bg-primary-500/20 border border-primary-500/30 text-primary-400 px-4 py-3 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Shortcut
            </button>
            <button
              onClick={saveShortcuts}
              disabled={saving}
              className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={loadShortcuts}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Reload Shortcuts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shortcuts 