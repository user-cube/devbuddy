import React from 'react'
import { GitPullRequest } from 'lucide-react'

const GitHubConfig = ({ config, updateConfig }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <GitPullRequest className="w-6 h-6" style={{ color: '#10b981' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GitHub</h2>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={config?.github?.enabled || false}
            onChange={(e) => updateConfig('github', 'enabled', e.target.checked)}
            className="w-4 h-4 rounded"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              accentColor: 'var(--accent-primary)'
            }}
          />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable</span>
        </label>
      </div>
      
      {config?.github?.enabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Token</label>
            <input
              type="password"
              placeholder="Enter your GitHub Personal Access Token"
              value={config?.github?.apiToken || ''}
              onChange={(e) => updateConfig('github', 'apiToken', e.target.value)}
              className="w-full rounded-lg px-3 py-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Create a token with <code>repo</code> and <code>read:org</code> scopes
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GitHubConfig

