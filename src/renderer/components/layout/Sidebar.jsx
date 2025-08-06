import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Home, 
  Rocket,
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
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shortcuts', icon: Rocket, label: 'Shortcuts' },
    { path: '/redirects', icon: Globe, label: 'Redirects' },
    { path: '/jira', icon: GitBranch, label: 'Jira' },
    { path: '/github', icon: GitPullRequest, label: 'GitHub' },
    { path: '/gitlab', icon: GitMerge, label: 'GitLab' },
    { path: '/config', icon: Settings, label: 'Configuration' }
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
      </nav>

      {/* Footer */}
      <div 
        className="p-4"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          <p>Keyboard shortcuts:</p>
          <p>Ctrl/Cmd + 1-7 to navigate</p>
          <p>Esc to go home</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar 