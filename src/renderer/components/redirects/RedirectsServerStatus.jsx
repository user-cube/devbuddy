import React from 'react'
import {
  Server,
  Play,
  Square
} from 'lucide-react'

const RedirectsServerStatus = ({ 
  serverStatus, 
  onStartServer, 
  onStopServer 
}) => {
  return (
    <div className="card">
      <div 
        className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Server className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Server Status</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Local redirector server</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              backgroundColor: serverStatus.running 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              color: serverStatus.running 
                ? 'var(--success)' 
                : 'var(--error)',
              border: serverStatus.running 
                ? '1px solid rgba(16, 185, 129, 0.3)' 
                : '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <div 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${serverStatus.running ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: serverStatus.running 
                  ? 'var(--success)' 
                  : 'var(--error)'
              }}
            ></div>
            {serverStatus.running ? 'Running' : 'Stopped'}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Port:</span>
            <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>{serverStatus.port}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onStartServer}
          disabled={serverStatus.running}
          className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: serverStatus.running 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = serverStatus.running 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(16, 185, 129, 0.2)'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <Play className="w-5 h-5" />
          Start Server
        </button>
        <button
          onClick={onStopServer}
          disabled={!serverStatus.running}
          className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: serverStatus.running 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--error)'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.2)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = serverStatus.running 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'rgba(239, 68, 68, 0.1)'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
        >
          <Square className="w-5 h-5" />
          Stop Server
        </button>
      </div>

      {serverStatus.running && (
        <div 
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: 'var(--success)' }}>✅ Server is running automatically!</h3>
          <p className="text-sm mb-3" style={{ color: 'var(--success)' }}>The redirector server starts automatically when DevBuddy launches.</p>
          <ol className="text-sm space-y-1" style={{ color: 'var(--success)' }}>
            <li>1. (Optional) Add to /etc/hosts: <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>127.0.0.1 devbuddy.local</code></li>
            <li>2. Configure your redirects below</li>
            <li>3. Visit either:</li>
            <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>localhost:{serverStatus.port}/jira</code> (works immediately)</li>
            <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>devbuddy.local:{serverStatus.port}/jira</code> (requires /etc/hosts setup)</li>
          </ol>
        </div>
      )}

      {!serverStatus.running && (
        <div 
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: 'var(--warning)' }}>⚠️ Server not running</h3>
          <p className="text-sm mb-3" style={{ color: 'var(--warning)' }}>The redirector server should start automatically. If it's not running, try restarting DevBuddy.</p>
          <ol className="text-sm space-y-1" style={{ color: 'var(--warning)' }}>
            <li>1. Start the redirector server manually (button above)</li>
            <li>2. (Optional) Add to /etc/hosts: <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>127.0.0.1 devbuddy.local</code></li>
            <li>3. Configure your redirects below</li>
            <li>4. Visit either:</li>
            <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>localhost:{serverStatus.port}/jira</code> (works immediately)</li>
            <li className="ml-4">• <code className="px-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>devbuddy.local:{serverStatus.port}/jira</code> (requires /etc/hosts setup)</li>
          </ol>
        </div>
      )}
    </div>
  )
}

export default RedirectsServerStatus
