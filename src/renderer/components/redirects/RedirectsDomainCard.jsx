import React from 'react'
import {
  Server,
  Plus
} from 'lucide-react'
import RedirectsPathRow from './RedirectsPathRow'

const RedirectsDomainCard = ({ 
  domain, 
  paths, 
  serverStatus, 
  editingPaths, 
  editingDomains, 
  onUpdateDomain, 
  onStartEditingDomain, 
  onFinishEditingDomain, 
  onUpdateEditingDomain, 
  onUpdatePath, 
  onStartEditingPath, 
  onFinishEditingPath, 
  onUpdateEditingPath, 
  onUpdateTargetUrl, 
  onTestRedirect, 
  onRemoveRedirect, 
  onAddRedirect 
}) => {
  return (
    <div 
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <input
            type="text"
            value={editingDomains[domain] !== undefined ? editingDomains[domain] : domain}
            onChange={(e) => onUpdateEditingDomain(domain, e.target.value)}
            onFocus={() => onStartEditingDomain(domain)}
            onBlur={(e) => onFinishEditingDomain(domain, e.target.value, paths)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur()
              } else if (e.key === 'Escape') {
                // Cancel editing
                onUpdateEditingDomain(domain, domain)
                e.target.blur()
              }
            }}
            className="text-xl font-semibold bg-transparent border-none outline-none transition-colors duration-200"
            style={{ color: 'var(--accent-primary)' }}
            placeholder="Domain (e.g., devbuddy.local)"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span 
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--success)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            {Object.keys(paths).length} redirect{Object.keys(paths).length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(paths).map(([path, targetUrl]) => (
          <RedirectsPathRow
            key={`${domain}-${path}`}
            domain={domain}
            path={path}
            targetUrl={targetUrl}
            serverStatus={serverStatus}
            editingPaths={editingPaths}
            onUpdatePath={onUpdatePath}
            onStartEditingPath={onStartEditingPath}
            onFinishEditingPath={onFinishEditingPath}
            onUpdateEditingPath={onUpdateEditingPath}
            onUpdateTargetUrl={onUpdateTargetUrl}
            onTestRedirect={onTestRedirect}
            onRemoveRedirect={onRemoveRedirect}
          />
        ))}
        
        {/* Add new redirect for this domain */}
        <button
          onClick={() => onAddRedirect(domain)}
          className="w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 group/add"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '2px dashed rgba(59, 130, 246, 0.3)',
            color: 'var(--accent-primary)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          <div className="p-1 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-medium">Add Redirect to {domain}</span>
        </button>
      </div>
    </div>
  )
}

export default RedirectsDomainCard
