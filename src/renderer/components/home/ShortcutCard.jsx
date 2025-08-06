import React from 'react'
import { Rocket, Server, Globe, GitBranch, GitPullRequest, GitMerge } from 'lucide-react'

const ShortcutCard = ({ shortcut, onClick }) => {
  const getIcon = (iconName) => {
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

  const Icon = getIcon(shortcut.icon)

  return (
    <button
      onClick={onClick}
      className="group rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
        border: '1px solid var(--border-primary)'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
        e.target.style.borderColor = 'var(--accent-primary)'
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))'
        e.target.style.borderColor = 'var(--border-primary)'
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Icon 
          className="w-6 h-6 transition-colors" 
          style={{ color: 'var(--accent-primary)' }}
        />
        <span 
          className="text-sm font-medium transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {shortcut.name}
        </span>
        {shortcut.description && (
          <span 
            className="text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {shortcut.description}
          </span>
        )}
      </div>
    </button>
  )
}

export default ShortcutCard 