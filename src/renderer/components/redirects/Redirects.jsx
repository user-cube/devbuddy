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
  Settings
} from 'lucide-react'

const Redirects = () => {
  const [redirects, setRedirects] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [serverStatus, setServerStatus] = useState({ running: false, port: 80 })

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-dark-300">Loading redirects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
          Local Redirects
        </h1>
        <p className="text-dark-300 text-lg">
          Configure local domain redirects for quick access
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
        {/* Server Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-600">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-semibold">Server Status</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                serverStatus.running 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  serverStatus.running ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                {serverStatus.running ? 'Running' : 'Stopped'}
              </div>
              <div className="text-sm text-dark-300">
                Port: {serverStatus.port}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={startServer}
              disabled={serverStatus.running}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Start Server
            </button>
            <button
              onClick={stopServer}
              disabled={!serverStatus.running}
              className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-4 h-4" />
              Stop Server
            </button>
          </div>

          {serverStatus.running && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">✅ Server is running automatically!</h3>
              <p className="text-green-300 text-sm mb-3">The redirector server starts automatically when DevBuddy launches.</p>
              <ol className="text-green-300 text-sm space-y-1">
                <li>1. (Optional) Add to /etc/hosts: <code className="bg-dark-700 px-1 rounded">127.0.0.1 devbuddy.local</code></li>
                <li>2. Configure your redirects below</li>
                <li>3. Visit either:</li>
                <li className="ml-4">• <code className="bg-dark-700 px-1 rounded">localhost:{serverStatus.port}/jira</code> (works immediately)</li>
                <li className="ml-4">• <code className="bg-dark-700 px-1 rounded">devbuddy.local:{serverStatus.port}/jira</code> (requires /etc/hosts setup)</li>
              </ol>
            </div>
          )}

          {!serverStatus.running && (
            <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Server not running</h3>
              <p className="text-yellow-300 text-sm mb-3">The redirector server should start automatically. If it's not running, try restarting DevBuddy.</p>
              <ol className="text-yellow-300 text-sm space-y-1">
                <li>1. Start the redirector server manually (button above)</li>
                <li>2. (Optional) Add to /etc/hosts: <code className="bg-dark-700 px-1 rounded">127.0.0.1 devbuddy.local</code></li>
                <li>3. Configure your redirects below</li>
                <li>4. Visit either:</li>
                <li className="ml-4">• <code className="bg-dark-700 px-1 rounded">localhost:{serverStatus.port}/jira</code> (works immediately)</li>
                <li className="ml-4">• <code className="bg-dark-700 px-1 rounded">devbuddy.local:{serverStatus.port}/jira</code> (requires /etc/hosts setup)</li>
              </ol>
            </div>
          )}
        </div>

        {/* Redirects Configuration */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-600">
            <h2 className="text-2xl font-semibold">Redirects</h2>
            <button
              onClick={saveRedirects}
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {Object.entries(redirects).map(([domain, paths]) => (
              <div key={domain} className="border border-dark-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-primary-400 mb-3">{domain}</h3>
                <div className="space-y-3">
                  {Object.entries(paths).map(([path, targetUrl]) => (
                    <div key={`${domain}-${path}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-dark-800/50 rounded-lg border border-dark-600">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary-400" />
                        <span className="font-mono text-sm">{domain}/{path}</span>
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="url"
                          value={targetUrl}
                          onChange={(e) => {
                            const newRedirects = { ...redirects }
                            newRedirects[domain][path] = e.target.value
                            setRedirects(newRedirects)
                          }}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none text-sm"
                          placeholder="Target URL"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => testRedirect(domain, path)}
                          disabled={!serverStatus.running}
                          className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          title="Test redirect"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeRedirect(domain, path)}
                          className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Remove redirect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new redirect for this domain */}
                  <button
                    onClick={() => {
                      const newPath = `new-${Date.now()}`
                      addRedirect(domain, newPath, 'https://example.com')
                    }}
                    className="w-full bg-primary-500/20 border border-primary-500/30 text-primary-400 px-4 py-2 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Redirect to {domain}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add new domain */}
            <button
              onClick={() => {
                const newDomain = `new-domain-${Date.now()}`
                setRedirects(prev => ({
                  ...prev,
                  [newDomain]: {}
                }))
              }}
              className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Redirects 