import React, { useState } from 'react';
import { GitMerge, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react';

const GitLabConfig = ({ config, updateConfig }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
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
          {/* Configuration Fields */}
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Use <code>https://gitlab.com</code> for GitLab.com or your self-hosted GitLab URL
              </p>
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

          {/* Test Connection */}
          <div>
            <button
              onClick={async () => {
                if (!config?.gitlab?.apiToken) {
                  setTestResult({ success: false, message: 'Please enter your API token first' });
                  return;
                }

                setTesting(true);
                setTestResult(null);

                try {
                  const userInfo = await window.electronAPI.getGitlabUserInfo();
                  if (userInfo) {
                    setTestResult({
                      success: true,
                      message: `Connection successful! Logged in as: ${userInfo.name || userInfo.username}`
                    });
                  } else {
                    setTestResult({
                      success: false,
                      message: 'Connection failed. Please check your token and try again.'
                    });
                  }
                } catch (error) {
                  setTestResult({
                    success: false,
                    message: `Connection failed: ${error.message}`
                  });
                } finally {
                  setTesting(false);
                }
              }}
              disabled={testing || !config?.gitlab?.apiToken}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: testing || !config?.gitlab?.apiToken ? 'var(--bg-primary)' : 'var(--accent-primary)',
                color: testing || !config?.gitlab?.apiToken ? 'var(--text-muted)' : 'white',
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
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>How to get your GitLab Personal Access Token</h3>
            </div>
            <ol className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Go to <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">GitLab Profile → Access Tokens <ExternalLink className="w-3 h-3" /></a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Click &quot;Add new token&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>Give it a descriptive name (e.g., &quot;DevBuddy&quot;)</span>
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
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read_api</code>
                  <span>- Read API access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read_user</code>
                  <span>- Read user profile data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">•</span>
                  <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}>read_repository</code>
                  <span>- Read repository data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitLabConfig;

