import React, { useState } from 'react'
import { GitBranch, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react'

const BitbucketConfig = ({ config, updateConfig }) => {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
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
                value={Array.isArray(config?.bitbucket?.workspaces) ? config.bitbucket.workspaces.join(',') : ''}
                onChange={(e) => {
                  const workspaces = e.target.value.split(',').map(w => w.trim()).filter(w => w);
                  updateConfig('bitbucket', 'workspaces', workspaces || []);
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
          </div>

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

          {/* Test Connection */}
          <div>
            <button
              onClick={async () => {
                if (!config?.bitbucket?.apiToken || !config?.bitbucket?.email) {
                  setTestResult({ success: false, message: 'Please enter your API token and email first' })
                  return
                }
                
                setTesting(true)
                setTestResult(null)
                
                try {
                  const userInfo = await window.electronAPI.getBitbucketUserInfo()
                  
                  // Check if the response indicates an error
                  if (userInfo && userInfo.error) {
                    setTestResult({ 
                      success: false, 
                      message: `Connection failed: ${userInfo.error}` 
                    })
                  } else if (userInfo && (userInfo.username === 'unknown' || userInfo.connection_method?.includes('fallback'))) {
                    setTestResult({ 
                      success: false, 
                      message: 'Connection failed. Please check your API token and email address.' 
                    })
                  } else if (userInfo) {
                    setTestResult({ 
                      success: true, 
                      message: `Connection successful! Logged in as: ${userInfo.display_name || userInfo.username}` 
                    })
                  } else {
                    setTestResult({ 
                      success: false, 
                      message: 'Connection failed. Please check your credentials and try again.' 
                    })
                  }
                } catch (error) {
                  setTestResult({ 
                    success: false, 
                    message: `Connection failed: ${error.message}` 
                  })
                } finally {
                  setTesting(false)
                }
              }}
              disabled={testing || !config?.bitbucket?.apiToken || !config?.bitbucket?.email}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: testing || !config?.bitbucket?.apiToken || !config?.bitbucket?.email ? 'var(--bg-primary)' : 'var(--accent-primary)',
                color: testing || !config?.bitbucket?.apiToken || !config?.bitbucket?.email ? 'var(--text-muted)' : 'white',
                border: '1px solid var(--border-primary)'
              }}
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
            
            {testResult && (
              <div className={`flex items-center gap-2 mt-2 p-2 rounded text-sm ${
                testResult.success 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {testResult.message}
              </div>
            )}
          </div>

          {/* Token Setup Instructions */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>How to get your Atlassian API Token</h3>
            </div>
            <ol className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">Atlassian API Tokens <ExternalLink className="w-3 h-3" /></a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Click "Create API token"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>Give it a descriptive name (e.g., "DevBuddy")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>Make sure it has access to <strong>Bitbucket</strong> product</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">5.</span>
                <span>The token will automatically have the required scopes</span>
              </li>
            </ol>
            <div className="mt-3 ml-6">
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:account</code>
                  <span>- Read account information</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:user:bitbucket</code>
                  <span>- Read user data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:repository:bitbucket</code>
                  <span>- Read repository data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:pullrequest:bitbucket</code>
                  <span>- Read pull request data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:workspace:bitbucket</code>
                  <span>- Read workspace data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BitbucketConfig
