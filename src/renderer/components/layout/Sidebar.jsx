import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Home, 
  Bookmark,
  Globe,
  GitBranch, 
  GitPullRequest, 
  GitMerge,
  Code,
  Settings,
  AlertCircle
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Sidebar = ({ currentPath, isConfigured }) => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        if (window.electronAPI) {
          const configData = await window.electronAPI.getConfig()
          setConfig(configData)
        }
      } catch (error) {
        console.error('Error loading config for sidebar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()

    // Listen for configuration changes
    const handleConfigChange = () => {
      loadConfig()
      setHasUnsavedChanges(false)
    }

    // Listen for unsaved changes
    const handleUnsavedChanges = () => {
      setHasUnsavedChanges(true)
    }

    // Add event listeners
    window.addEventListener('config-changed', handleConfigChange)
    window.addEventListener('config-unsaved', handleUnsavedChanges)

    return () => {
      window.removeEventListener('config-changed', handleConfigChange)
      window.removeEventListener('config-unsaved', handleUnsavedChanges)
    }
  }, [])

  // Base navigation items (always visible)
  const baseNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { path: '/redirects', icon: Globe, label: 'Redirects' }
  ]

  // Integration navigation items (only if enabled)
  const integrationNavItems = [
    { 
      path: '/jira', 
      icon: GitBranch, 
      label: 'Jira',
      enabled: config?.jira?.enabled || false
    },
    { 
      path: '/github', 
      icon: GitPullRequest, 
      label: 'GitHub',
      enabled: config?.github?.enabled || false
    },
    { 
      path: '/gitlab', 
      icon: GitMerge, 
      label: 'GitLab',
      enabled: config?.gitlab?.enabled || false
    }
  ]

  // Configuration item (always visible)
  const configNavItem = { path: '/config', icon: Settings, label: 'Configuration' }

  // Combine all navigation items
  const navItems = [
    ...baseNavItems,
    ...integrationNavItems.filter(item => item.enabled),
    configNavItem
  ]

  return (
    <aside 
      className="w-64 flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))',
        borderRight: '1px solid var(--border-primary)'
      }}
    >
      {/* Header */}
      <div 
        className="p-6"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Code className="w-8 h-8" />
            DevBuddy
          </h1>
          <ThemeToggle />
        </div>
        
        {/* Configuration Status */}
        {!isConfigured && (
          <div 
            className="mt-3 p-2 rounded-lg"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--warning)' }}>
              <AlertCircle className="w-4 h-4" />
              <span>Setup Required</span>
            </div>
          </div>
        )}
        
        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div 
            className="mt-3 p-2 rounded-lg"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--accent-primary)' }}>
              <AlertCircle className="w-4 h-4" />
              <span>Unsaved Changes</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.path === '/config' && !isConfigured && (
                    <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Disabled Integrations Info */}
        {!loading && integrationNavItems.some(item => !item.enabled) && (
          <div className="mt-6 p-3 rounded-lg" style={{
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            border: '1px solid rgba(107, 114, 128, 0.2)'
          }}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <p className="font-medium mb-2">Disabled Integrations:</p>
              <ul className="space-y-1">
                {integrationNavItems
                  .filter(item => !item.enabled)
                  .map(item => (
                    <li key={item.path} className="flex items-center gap-2">
                      <item.icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </li>
                  ))}
              </ul>
              <p className="mt-2 text-xs opacity-75">
                Enable in Configuration to access
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div 
        className="p-4"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          <p>Keyboard shortcuts:</p>
          <p>Ctrl/Cmd + 1-{navItems.length} to navigate</p>
          <p>Esc to go home</p>
          {navItems.length < 7 && (
            <p className="mt-1 text-xs opacity-75">
              {7 - navItems.length} integration{7 - navItems.length !== 1 ? 's' : ''} disabled
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar 