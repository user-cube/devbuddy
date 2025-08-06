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
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading shortcuts...</p>
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
          Shortcuts
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Manage your development shortcuts and quick access links
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

      <div className="space-y-6">
        {/* Shortcuts List */}
        <div className="card">
          <div 
            className="flex items-center justify-between mb-6 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Your Shortcuts</h2>
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
                <div 
                  key={index} 
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <input
                      type="text"
                      placeholder="Name"
                      value={shortcut.name}
                      onChange={(e) => updateShortcut(index, 'name', e.target.value)}
                      className="rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="URL"
                    value={shortcut.url}
                    onChange={(e) => updateShortcut(index, 'url', e.target.value)}
                    className="rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <select
                    value={shortcut.icon}
                    onChange={(e) => updateShortcut(index, 'icon', e.target.value)}
                    className="rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
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
                    className="rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => openShortcut(shortcut)}
                      disabled={!shortcut.url}
                      className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: 'var(--success)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
                      }}
                      title="Open shortcut"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeShortcut(index)}
                      className="px-3 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: 'var(--error)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                      }}
                      title="Remove shortcut"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            
            {shortcuts.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No shortcuts yet. Add your first shortcut below!</p>
              </div>
            )}
            
            <button
              onClick={addShortcut}
              className="w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--accent-primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <Plus className="w-4 h-4" />
              Add Shortcut
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={addShortcut}
              className="px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--accent-primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              }}
            >
              <Plus className="w-4 h-4" />
              Add New Shortcut
            </button>
            <button
              onClick={saveShortcuts}
              disabled={saving}
              className="px-4 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
              }}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={loadShortcuts}
              className="px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--accent-primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              }}
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