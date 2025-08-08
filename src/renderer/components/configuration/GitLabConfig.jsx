import React from 'react'
import { GitMerge } from 'lucide-react'

const GitLabConfig = ({ config, updateConfig }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <GitMerge className="w-6 h-6" style={{ color: '#f97316' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GitLab</h2>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={config?.gitlab?.enabled || false}
            onChange={(e) => updateConfig('gitlab', 'enabled', e.target.checked)}
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
      
      {config?.gitlab?.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL</label>
              <input
                type="url"
                placeholder="https://gitlab.com"
                value={config?.gitlab?.baseUrl || 'https://gitlab.com'}
                onChange={(e) => updateConfig('gitlab', 'baseUrl', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Token</label>
              <input
                type="password"
                placeholder="Enter your GitLab Personal Access Token"
                value={config?.gitlab?.apiToken || ''}
                onChange={(e) => updateConfig('gitlab', 'apiToken', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GitLabConfig

