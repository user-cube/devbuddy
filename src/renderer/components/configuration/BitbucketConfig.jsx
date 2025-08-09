import React from 'react'
import { GitBranch } from 'lucide-react'

const BitbucketConfig = ({ config, updateConfig }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <GitBranch className="w-6 h-6" style={{ color: '#0052cc' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Bitbucket</h2>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={config?.bitbucket?.enabled || false}
            onChange={(e) => updateConfig('bitbucket', 'enabled', e.target.checked)}
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
      
      {config?.bitbucket?.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL</label>
              <input
                type="url"
                placeholder="https://api.bitbucket.org"
                value={config?.bitbucket?.baseUrl || 'https://api.bitbucket.org'}
                onChange={(e) => updateConfig('bitbucket', 'baseUrl', e.target.value)}
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
                placeholder="Enter your Atlassian API Token"
                value={config?.bitbucket?.apiToken || ''}
                onChange={(e) => updateConfig('bitbucket', 'apiToken', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                placeholder="your-email@company.com"
                value={config?.bitbucket?.email || ''}
                onChange={(e) => updateConfig('bitbucket', 'email', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Must be your Atlassian email address (used for API Token authentication)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text"
                placeholder="your-bitbucket-username"
                value={config?.bitbucket?.username || ''}
                onChange={(e) => updateConfig('bitbucket', 'username', e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Workspaces</label>
              <input
                type="text"
                placeholder="workspace1,workspace2"
                value={config?.bitbucket?.workspaces?.join(',') || ''}
                onChange={(e) => {
                  const workspaces = e.target.value.split(',').map(w => w.trim()).filter(w => w);
                  updateConfig('bitbucket', 'workspaces', workspaces);
                }}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Comma-separated list of workspace names
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Refresh Interval (seconds)</label>
              <input
                type="number"
                min="60"
                max="3600"
                value={config?.bitbucket?.refreshInterval || 300}
                onChange={(e) => updateConfig('bitbucket', 'refreshInterval', parseInt(e.target.value))}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Max Results</label>
              <input
                type="number"
                min="10"
                max="100"
                value={config?.bitbucket?.maxResults || 50}
                onChange={(e) => updateConfig('bitbucket', 'maxResults', parseInt(e.target.value))}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config?.bitbucket?.showDrafts || false}
                    onChange={(e) => updateConfig('bitbucket', 'showDrafts', e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      accentColor: 'var(--accent-primary)'
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Show Drafts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config?.bitbucket?.showClosed || false}
                    onChange={(e) => updateConfig('bitbucket', 'showClosed', e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      accentColor: 'var(--accent-primary)'
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Show Closed</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Setup Instructions</h4>
            <ol className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <li>1. Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline">Atlassian API Tokens</a></li>
              <li>2. Create a new API token with appropriate permissions</li>
              <li>3. Copy the generated token to the API Token field</li>
              <li>4. Enter your <strong>Atlassian email address</strong> (must match the email used for the API token)</li>
              <li>5. Enter your Bitbucket username</li>
              <li>6. Optionally add workspace names (comma-separated)</li>
            </ol>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Required API Token Scopes</h5>
              <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <p className="mb-2">Make sure your API token has access to <strong>Bitbucket</strong> and includes these scopes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                    <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>read:account</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                    <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>read:user:bitbucket</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                    <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>read:repository:bitbucket</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                    <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>read:pullrequest:bitbucket</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                    <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>read:workspace:bitbucket</code>
                  </div>
                </div>
                <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <strong>Note:</strong> If you get a 403 error, check that your token has access to the Bitbucket product and all required scopes.
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                onClick={async () => {
                  try {
                    if (window.electronAPI) {
                      const result = await window.electronAPI.testBitbucketConnection();
                      alert('Connection successful! User: ' + result.display_name);
                    }
                  } catch (error) {
                    alert('Connection failed: ' + error.message);
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BitbucketConfig
