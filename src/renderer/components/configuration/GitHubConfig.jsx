import React, { useState } from 'react'
import { GitPullRequest, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react'

const GitHubConfig = ({ config, updateConfig }) => {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
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
          {/* API Token Input */}
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
          </div>

          {/* Test Connection */}
          <div>
            <button
              onClick={async () => {
                if (!config?.github?.apiToken) {
                  setTestResult({ success: false, message: 'Please enter your API token first' })
                  return
                }
                
                setTesting(true)
                setTestResult(null)
                
                try {
                  const userInfo = await window.electronAPI.getGithubUserInfo()
                  if (userInfo) {
                    setTestResult({ 
                      success: true, 
                      message: `Connection successful! Logged in as: ${userInfo.login}` 
                    })
                  } else {
                    setTestResult({ 
                      success: false, 
                      message: 'Connection failed. Please check your token and try again.' 
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
              disabled={testing || !config?.github?.apiToken}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: testing || !config?.github?.apiToken ? 'var(--bg-primary)' : 'var(--accent-primary)',
                color: testing || !config?.github?.apiToken ? 'var(--text-muted)' : 'white',
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
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>How to get your GitHub Personal Access Token</h3>
            </div>
            <ol className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">GitHub Settings → Developer settings → Personal access tokens <ExternalLink className="w-3 h-3" /></a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Click "Generate new token (classic)"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>Give it a descriptive name (e.g., "DevBuddy")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>Set expiration (recommended: 90 days)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">5.</span>
                <span>Select the following scopes:</span>
              </li>
            </ol>
            <div className="mt-3 ml-6">
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>repo</code>
                  <span>- Full control of private repositories</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:org</code>
                  <span>- Read organization data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>user</code>
                  <span>- Read user profile data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GitHubConfig

