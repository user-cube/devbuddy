import React from 'react'
import {
  Folder,
  RefreshCw,
  Settings,
  ArrowLeft
} from 'lucide-react'

const RepositoriesHeader = ({ 
  title, 
  subtitle, 
  cacheStatus, 
  onRefresh, 
  onRefreshConfig, 
  onSettings, 
  loading, 
  isRefreshingRepositories,
  onBack
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              color: 'var(--text-secondary)'
            }}
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <Folder className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
            {cacheStatus && (
              <span className="ml-2">
                • {cacheStatus.repositoryCount} repositories in repositories.yml
                {cacheStatus.lastUpdated && (
                  <span className="ml-1">
                    (last scan: {new Date(cacheStatus.lastUpdated).toLocaleDateString()})
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshingRepositories}
            className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--success)'
            }}
            title="Refresh repositories scan"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshingRepositories ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        {onRefreshConfig && (
          <button
            onClick={onRefreshConfig}
            disabled={loading}
            className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'var(--accent-primary)'
            }}
            title="Refresh configuration"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        <button
          onClick={onSettings}
          className="p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            color: 'var(--text-secondary)'
          }}
          title="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

export default RepositoriesHeader
