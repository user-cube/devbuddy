import React from 'react'
import { GitBranch } from 'lucide-react'

const JiraConfig = ({ config, updateConfig }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <GitBranch className="w-6 h-6" style={{ color: '#3b82f6' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Jira</h2>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={config?.jira?.enabled || false}
            onChange={(e) => updateConfig('jira', 'enabled', e.target.checked)}
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
      
      {config?.jira?.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL</label>
              <input
                type="url"
                placeholder="https://your-domain.atlassian.net"
                value={config?.jira?.baseUrl || ''}
                onChange={(e) => updateConfig('jira', 'baseUrl', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text"
                placeholder="your-email@domain.com"
                value={config?.jira?.username || ''}
                onChange={(e) => updateConfig('jira', 'username', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Token</label>
            <input
              type="password"
              placeholder="Enter your Jira API token"
              value={config?.jira?.apiToken || ''}
              onChange={(e) => updateConfig('jira', 'apiToken', e.target.value)}
              className="w-full rounded-lg px-3 py-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Get your API token from <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>Atlassian Account Settings</a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default JiraConfig

