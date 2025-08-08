import React from 'react'
import { Star, Heart } from 'lucide-react'

const HomeQuickActions = () => {
  const quickActions = [
    { label: 'Bookmarks', route: '#/bookmarks', color: 'var(--accent-primary)' },
    { label: 'Jira', route: '#/jira', color: 'var(--accent-primary)' },
    { label: 'GitHub', route: '#/github', color: 'var(--success)' },
    { label: 'GitLab', route: '#/gitlab', color: '#f56565' },
    { label: 'Repositories', route: '#/repositories', color: 'var(--accent-primary)' },
    { label: 'Settings', route: '#/config', color: 'var(--text-secondary)' }
  ]

  return (
    <div className="mt-12 p-6 rounded-xl" style={{
      background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
      border: '1px solid var(--border-primary)'
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Quick Actions</span>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => window.location.hash = action.route}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: action.color === 'var(--success)' ? 'rgba(16, 185, 129, 0.1)' :
                               action.color === '#f56565' ? 'rgba(245, 101, 101, 0.1)' :
                               action.color === 'var(--text-secondary)' ? 'rgba(107, 114, 128, 0.1)' :
                               'rgba(59, 130, 246, 0.1)',
                  border: action.color === 'var(--success)' ? '1px solid rgba(16, 185, 129, 0.2)' :
                         action.color === '#f56565' ? '1px solid rgba(245, 101, 101, 0.2)' :
                         action.color === 'var(--text-secondary)' ? '1px solid rgba(107, 114, 128, 0.2)' :
                         '1px solid rgba(59, 130, 246, 0.2)',
                  color: action.color
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Made with DevBuddy
          </span>
        </div>
      </div>
    </div>
  )
}

export default HomeQuickActions
