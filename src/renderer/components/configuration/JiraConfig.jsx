import React, { useState } from 'react'
import { GitBranch, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react'

const JiraConfig = ({ config, updateConfig }) => {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
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
          {/* Configuration Fields */}
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Your Jira instance URL (e.g., https://company.atlassian.net)
              </p>
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Your Atlassian email address
              </p>
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
          </div>

          {/* Test Connection */}
          <div>
            <button
              onClick={async () => {
                if (!config?.jira?.apiToken || !config?.jira?.username || !config?.jira?.baseUrl) {
                  setTestResult({ success: false, message: 'Please enter your API token, username, and base URL first' })
                  return
                }
                
                setTesting(true)
                setTestResult(null)
                
                try {
                  const userInfo = await window.electronAPI.getJiraUserInfo()
                  if (userInfo) {
                    setTestResult({ 
                      success: true, 
                      message: `Connection successful! Logged in as: ${userInfo.displayName || userInfo.name || userInfo.emailAddress}` 
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
              disabled={testing || !config?.jira?.apiToken || !config?.jira?.username || !config?.jira?.baseUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: testing || !config?.jira?.apiToken || !config?.jira?.username || !config?.jira?.baseUrl ? 'var(--bg-primary)' : 'var(--accent-primary)',
                color: testing || !config?.jira?.apiToken || !config?.jira?.username || !config?.jira?.baseUrl ? 'var(--text-muted)' : 'white',
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
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>How to get your Jira API Token</h3>
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
                <span>Make sure it has access to <strong>Jira</strong> product</span>
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
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:jira-work</code>
                  <span>- Read Jira issues and projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read:jira-user</code>
                  <span>- Read user profile data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>write:jira-work</code>
                  <span>- Create and update issues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JiraConfig

