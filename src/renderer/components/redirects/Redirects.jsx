import React, { useState, useEffect } from 'react'
import {
  Save,
  Server,
  Plus
} from 'lucide-react'
import RedirectsHeader from './RedirectsHeader'
import RedirectsMessage from './RedirectsMessage'
import RedirectsServerStatus from './RedirectsServerStatus'
import RedirectsDomainCard from './RedirectsDomainCard'
import RedirectsEmpty from './RedirectsEmpty'
import RedirectsLoading from './RedirectsLoading'
import { generateNewDomain, generateNewPath, formatRedirectUrl } from './RedirectsUtils'

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

  const addRedirect = (domain) => {
    const newPath = generateNewPath()
    setRedirects(prev => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        [newPath]: 'https://example.com'
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

  const testRedirect = async (domain, path) => {
    const url = formatRedirectUrl(domain, path, serverStatus.port)
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(url)
      }
    } catch (error) {
      console.error('Error opening redirect URL:', error)
    }
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
    return <RedirectsLoading />
  }

  return (
    <div className="p-8">
      <RedirectsHeader />
      <RedirectsMessage message={message} />
      
      <div className="space-y-6">
        <RedirectsServerStatus 
          serverStatus={serverStatus}
          onStartServer={startServer}
          onStopServer={stopServer}
        />

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
              <RedirectsEmpty onAddFirstDomain={() => {
                const newDomain = generateNewDomain()
                setRedirects(prev => ({
                  ...prev,
                  [newDomain]: {}
                }))
              }} />
            ) : (
              Object.entries(redirects).map(([domain, paths]) => (
                <RedirectsDomainCard
                  key={domain}
                  domain={domain}
                  paths={paths}
                  serverStatus={serverStatus}
                  editingPaths={editingPaths}
                  editingDomains={editingDomains}
                  onUpdateDomain={updateRedirectDomain}
                  onStartEditingDomain={startEditingDomain}
                  onFinishEditingDomain={finishEditingDomain}
                  onUpdateEditingDomain={updateEditingDomain}
                  onUpdatePath={updateRedirectPath}
                  onStartEditingPath={startEditingPath}
                  onFinishEditingPath={finishEditingPath}
                  onUpdateEditingPath={updateEditingPath}
                  onUpdateTargetUrl={(domain, path, value) => {
                    const newRedirects = { ...redirects }
                    newRedirects[domain][path] = value
                    setRedirects(newRedirects)
                  }}
                  onTestRedirect={testRedirect}
                  onRemoveRedirect={removeRedirect}
                  onAddRedirect={addRedirect}
                />
              ))
            )} 
            
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
                  const newDomain = generateNewDomain()
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