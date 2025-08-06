import React, { useState, useEffect } from 'react'
import {
  Globe,
  Plus,
  Trash2,
  Play,
  Square,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Edit3,
  Link,
  Server,
  Zap
} from 'lucide-react'

const Redirects = () => {
  const [redirects, setRedirects] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [serverStatus, setServerStatus] = useState({ running: false, port: 80 })
  const [editingPaths, setEditingPaths] = useState({}) // Track which paths are being edited
  const [editingDomains, setEditingDomains] = useState({}) // Track which domains are being edited

  useEffect(() => {
    loadRedirects()
    loadServerStatus()
  }, [])

  const loadRedirects = async () => {
    try {
      if (window.electronAPI) {
        const redirectsData = await window.electronAPI.getRedirects()
        setRedirects(redirectsData)
      }
    } catch (error) {
      console.error('Error loading redirects:', error)
      setMessage({ type: 'error', text: 'Error loading redirects' })
    } finally {
      setLoading(false)
    }
  }

  const loadServerStatus = async () => {
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.getRedirectorStatus()
        setServerStatus(status)
      }
    } catch (error) {
      console.error('Error loading server status:', error)
    }
  }

  const saveRedirects = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.updateRedirects(redirects)
        setMessage({ type: 'success', text: 'Redirects saved successfully!' })
      }
    } catch (error) {
      console.error('Error saving redirects:', error)
      setMessage({ type: 'error', text: error.message || 'Error saving redirects' })
    } finally {
      setSaving(false)
    }
  }

  const addRedirect = (domain, path, targetUrl) => {
    setRedirects(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [path]: targetUrl
      }
    }))
  }

  const removeRedirect = (domain, path) => {
    setRedirects(prev => {
      const newRedirects = { ...prev }
      if (newRedirects[domain]) {
        delete newRedirects[domain][path]
        if (Object.keys(newRedirects[domain]).length === 0) {
          delete newRedirects[domain]
        }
      }
      return newRedirects
    })
  }

  const startServer = async () => {
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.startRedirectorServer()
        setServerStatus(status)
        setMessage({ type: 'success', text: 'Redirector server started!' })
      }
    } catch (error) {
      console.error('Error starting server:', error)
      setMessage({ type: 'error', text: 'Error starting redirector server' })
    }
  }

  const stopServer = async () => {
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.stopRedirectorServer()
        setServerStatus(status)
        setMessage({ type: 'success', text: 'Redirector server stopped!' })
      }
    } catch (error) {
      console.error('Error stopping server:', error)
      setMessage({ type: 'error', text: 'Error stopping redirector server' })
    }
  }

  const testRedirect = (domain, path) => {
    const url = `http://${domain}:${serverStatus.port}/${path}`
    window.open(url, '_blank')
  }

  const updateRedirectPath = (domain, oldPath, newPath, targetUrl) => {
    if (!newPath || newPath.trim() === '') return // Don't allow empty paths
    
    const newRedirects = { ...redirects }
    
    // Check if new path already exists (except for the current one)
    if (newRedirects[domain] && newRedirects[domain][newPath] && newPath !== oldPath) {
      setMessage({ type: 'error', text: `Path "${newPath}" already exists for domain "${domain}"` })
      return
    }
    
    // Remove old path and add new one
    delete newRedirects[domain][oldPath]
    newRedirects[domain][newPath] = targetUrl
    setRedirects(newRedirects)
    
    // Clear any previous error messages
    if (message.type === 'error' && message.text.includes('Path')) {
      setMessage({ type: '', text: '' })
    }
  }

  const startEditingPath = (domain, path) => {
    setEditingPaths(prev => ({
      ...prev,
      [`${domain}-${path}`]: path
    }))
  }

  const finishEditingPath = (domain, oldPath, newPath, targetUrl) => {
    if (!newPath || newPath.trim() === '') {
      // If empty, revert to original path
      setEditingPaths(prev => {
        const newEditing = { ...prev }
        delete newEditing[`${domain}-${oldPath}`]
        return newEditing
      })
      return
    }
    
    const newRedirects = { ...redirects }
    
    // Check if new path already exists (except for the current one)
    if (newRedirects[domain] && newRedirects[domain][newPath] && newPath !== oldPath) {
      setMessage({ type: 'error', text: `Path "${newPath}" already exists for domain "${domain}"` })
      // Revert to original path
      setEditingPaths(prev => {
        const newEditing = { ...prev }
        delete newEditing[`${domain}-${oldPath}`]
        return newEditing
      })
      return
    }
    
    // Remove old path and add new one
    delete newRedirects[domain][oldPath]
    newRedirects[domain][newPath] = targetUrl
    setRedirects(newRedirects)
    
    // Remove from editing state
    setEditingPaths(prev => {
      const newEditing = { ...prev }
      delete newEditing[`${domain}-${oldPath}`]
      return newEditing
    })
    
    // Clear any previous error messages
    if (message.type === 'error' && message.text.includes('Path')) {
      setMessage({ type: '', text: '' })
    }
  }

  const updateEditingPath = (domain, oldPath, newPath) => {
    setEditingPaths(prev => ({
      ...prev,
      [`${domain}-${oldPath}`]: newPath
    }))
  }

  const startEditingDomain = (domain) => {
    setEditingDomains(prev => ({
      ...prev,
      [domain]: domain
    }))
  }

  const finishEditingDomain = (oldDomain, newDomain, paths) => {
    if (!newDomain || newDomain.trim() === '') {
      // If empty, revert to original domain
      setEditingDomains(prev => {
        const newEditing = { ...prev }
        delete newEditing[oldDomain]
        return newEditing
      })
      return
    }
    
    const newRedirects = { ...redirects }
    
    // Check if new domain already exists
    if (newRedirects[newDomain] && newDomain !== oldDomain) {
      setMessage({ type: 'error', text: `Domain "${newDomain}" already exists` })
      // Revert to original domain
      setEditingDomains(prev => {
        const newEditing = { ...prev }
        delete newEditing[oldDomain]
        return newEditing
      })
      return
    }
    
    // Remove old domain and add new one
    delete newRedirects[oldDomain]
    newRedirects[newDomain] = paths
    setRedirects(newRedirects)
    
    // Remove from editing state
    setEditingDomains(prev => {
      const newEditing = { ...prev }
      delete newEditing[oldDomain]
      return newEditing
    })
    
    // Clear any previous error messages
    if (message.type === 'error' && message.text.includes('Domain')) {
      setMessage({ type: '', text: '' })
    }
  }

  const updateEditingDomain = (oldDomain, newDomain) => {
    setEditingDomains(prev => ({
      ...prev,
      [oldDomain]: newDomain
    }))
  }

  const updateRedirectDomain = (oldDomain, newDomain, paths) => {
    if (!newDomain || newDomain.trim() === '') return // Don't allow empty domains
    
    const newRedirects = { ...redirects }
    
    // Check if new domain already exists
    if (newRedirects[newDomain] && newDomain !== oldDomain) {
      setMessage({ type: 'error', text: `Domain "${newDomain}" already exists` })
      return
    }
    
    // Remove old domain and add new one
    delete newRedirects[oldDomain]
    newRedirects[newDomain] = paths
    setRedirects(newRedirects)
    
    // Clear any previous error messages
    if (message.type === 'error' && message.text.includes('Domain')) {
      setMessage({ type: '', text: '' })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading redirects...</p>
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
          Local Redirects
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Configure local domain redirects for quick access
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
        {/* Server Status */}
        <div className="card">
          <div 
            className="flex items-center justify-between mb-6 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <Server className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Server Status</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Local redirector server</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: serverStatus.running 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  color: serverStatus.running 
                    ? 'var(--success)' 
                    : 'var(--error)',
                  border: serverStatus.running 
                    ? '1px solid rgba(16, 185, 129, 0.3)' 
                    : '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${serverStatus.running ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: serverStatus.running 
                      ? 'var(--success)' 
                      : 'var(--error)'
                  }}
                ></div>
                {serverStatus.running ? 'Running' : 'Stopped'}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Port:</span>
                <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>{serverStatus.port}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={startServer}
              disabled={serverStatus.running}
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: serverStatus.running 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = serverStatus.running 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(16, 185, 129, 0.2)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <Play className="w-5 h-5" />
              Start Server
            </button>
            <button
              onClick={stopServer}
              disabled={!serverStatus.running}
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: serverStatus.running 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--error)'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = serverStatus.running 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : 'rgba(239, 68, 68, 0.1)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <Square className="w-5 h-5" />
              Stop Server
            </button>
          </div>

          {serverStatus.running && (
            <div 
              className="mt-4 p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--success)' }}>✅ Server is running automatically!</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--success)' }}>The redirector server starts automatically when DevBuddy launches.</p>
              <ol className="text-sm space-y-1" style={{ color: 'var(--success)' }}>
                <li>1. (Optional) Add to /etc/hosts: <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>127.0.0.1 devbuddy.local</code></li>
                <li>2. Configure your redirects below</li>
                <li>3. Visit either:</li>
                <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>localhost:{serverStatus.port}/jira</code> (works immediately)</li>
                <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>devbuddy.local:{serverStatus.port}/jira</code> (requires /etc/hosts setup)</li>
              </ol>
            </div>
          )}

          {!serverStatus.running && (
            <div 
              className="mt-4 p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: 'var(--warning)' }}>⚠️ Server not running</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--warning)' }}>The redirector server should start automatically. If it's not running, try restarting DevBuddy.</p>
              <ol className="text-sm space-y-1" style={{ color: 'var(--warning)' }}>
                <li>1. Start the redirector server manually (button above)</li>
                <li>2. (Optional) Add to /etc/hosts: <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>127.0.0.1 devbuddy.local</code></li>
                <li>3. Configure your redirects below</li>
                <li>4. Visit either:</li>
                <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>localhost:{serverStatus.port}/jira</code> (works immediately)</li>
                <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>devbuddy.local:{serverStatus.port}/jira</code> (requires /etc/hosts setup)</li>
              </ol>
            </div>
          )}
        </div>

        {/* Redirects Configuration */}
        <div className="card">
          <div 
            className="flex items-center justify-between mb-6 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Redirects</h2>
            <button
              onClick={saveRedirects}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--success)' }}></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save All</span>
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            {Object.keys(redirects).length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full mx-auto w-16 h-16 mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Globe className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Redirects Configured</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Get started by adding your first domain and redirect rules
                </p>
                <button
                  onClick={() => {
                    const newDomain = `new-domain-${Date.now()}`
                    setRedirects(prev => ({
                      ...prev,
                      [newDomain]: {}
                    }))
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'var(--accent-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Domain
                </button>
              </div>
            ) : (
              Object.entries(redirects).map(([domain, paths]) => (
              <div 
                key={domain} 
                className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
                style={{
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <input
                      type="text"
                      value={editingDomains[domain] !== undefined ? editingDomains[domain] : domain}
                      onChange={(e) => updateEditingDomain(domain, e.target.value)}
                      onFocus={() => startEditingDomain(domain)}
                      onBlur={(e) => finishEditingDomain(domain, e.target.value, paths)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur()
                        } else if (e.key === 'Escape') {
                          // Cancel editing
                          setEditingDomains(prev => {
                            const newEditing = { ...prev }
                            delete newEditing[domain]
                            return newEditing
                          })
                          e.target.blur()
                        }
                      }}
                      className="text-xl font-semibold bg-transparent border-none outline-none transition-colors duration-200"
                      style={{ color: 'var(--accent-primary)' }}
                      placeholder="Domain (e.g., devbuddy.local)"
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--success)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      {Object.keys(paths).length} redirect{Object.keys(paths).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(paths).map(([path, targetUrl]) => (
                    <div 
                      key={`${domain}-${path}`} 
                      className="group relative rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Path Section */}
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Link className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>PATH</span>
                          </div>
                                                      <div className="relative">
                              <input
                                type="text"
                                value={editingPaths[`${domain}-${path}`] !== undefined ? editingPaths[`${domain}-${path}`] : path}
                                onChange={(e) => updateEditingPath(domain, path, e.target.value)}
                                onFocus={() => startEditingPath(domain, path)}
                                onBlur={(e) => finishEditingPath(domain, path, e.target.value, targetUrl)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.target.blur()
                                  } else if (e.key === 'Escape') {
                                    // Cancel editing
                                    setEditingPaths(prev => {
                                      const newEditing = { ...prev }
                                      delete newEditing[`${domain}-${path}`]
                                      return newEditing
                                    })
                                    e.target.blur()
                                  }
                                }}
                                className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm transition-all duration-200"
                                style={{
                                  backgroundColor: 'var(--bg-secondary)',
                                  border: '1px solid var(--border-primary)',
                                  color: 'var(--text-primary)'
                                }}
                                placeholder="jira"
                              />
                              <Edit3 className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-50" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="md:col-span-1 flex justify-center">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                          </div>
                        </div>

                        {/* Target URL Section */}
                        <div className="md:col-span-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>TARGET URL</span>
                          </div>
                          <input
                            type="url"
                            value={targetUrl}
                            onChange={(e) => {
                              const newRedirects = { ...redirects }
                              newRedirects[domain][path] = e.target.value
                              setRedirects(newRedirects)
                            }}
                            className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm transition-all duration-200"
                            style={{
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              color: 'var(--text-primary)'
                            }}
                            placeholder="https://jira.atlassian.net"
                          />
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-2 flex gap-2 justify-end">
                          <button
                            onClick={() => testRedirect(domain, path)}
                            disabled={!serverStatus.running}
                            className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: 'var(--success)'
                            }}
                            onMouseEnter={(e) => {
                              if (!e.target.disabled) {
                                e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'
                                e.target.style.transform = 'translateY(-1px)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
                              e.target.style.transform = 'translateY(0)'
                            }}
                            title="Test redirect"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeRedirect(domain, path)}
                            className="p-2 rounded-lg transition-all duration-200 group/btn"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: 'var(--error)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
                              e.target.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                              e.target.style.transform = 'translateY(0)'
                            }}
                            title="Remove redirect"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new redirect for this domain */}
                  <button
                    onClick={() => {
                      const newPath = `new-${Date.now()}`
                      addRedirect(domain, newPath, 'https://example.com')
                    }}
                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 group/add"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      border: '2px dashed rgba(59, 130, 246, 0.3)',
                      color: 'var(--accent-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    <div className="p-1 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Add Redirect to {domain}</span>
                  </button>
                </div>
              </div>
            )))} 
            
            {/* Add new domain */}
            <div className="mt-8 p-6 rounded-xl border-2 border-dashed transition-all duration-300 hover:border-solid group"
              style={{
                borderColor: 'rgba(59, 130, 246, 0.3)',
                backgroundColor: 'rgba(59, 130, 246, 0.02)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.02)'
              }}
            >
              <button
                onClick={() => {
                  const newDomain = `new-domain-${Date.now()}`
                  setRedirects(prev => ({
                    ...prev,
                    [newDomain]: {}
                  }))
                }}
                className="w-full flex flex-col items-center justify-center gap-3 py-4 transition-all duration-300"
                style={{ color: 'var(--accent-primary)' }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Server className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">Add New Domain</div>
                  <div className="text-sm opacity-70">Create a new domain for your redirects</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Redirects 