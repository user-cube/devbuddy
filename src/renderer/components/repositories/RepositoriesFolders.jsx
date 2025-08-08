import React from 'react'
import {
  GitBranch,
  RefreshCw
} from 'lucide-react'

const RepositoriesFolders = ({ 
  repositories, 
  filteredRepositories, 
  searchQuery, 
  onFolderClick, 
  onRefresh, 
  loading 
}) => {
  if (filteredRepositories.length === 0) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {searchQuery ? 'No Matching Repositories' : 'No Repositories Found'}
        </h3>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          {searchQuery 
            ? `No repositories match your search for "${searchQuery}"`
            : `No Git repositories found in this directory`
          }
        </p>
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            Clear Search
          </button>
        ) : (
          <button
            onClick={onRefresh}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry Scan
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRepositories.map((folder) => (
        <div
          key={folder.path}
          className="group relative p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => onFolderClick(folder)}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
            e.target.style.borderColor = 'var(--accent-primary)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))'
            e.target.style.borderColor = 'var(--border-primary)'
          }}
        >
          {/* Repository Icon and Name */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <GitBranch className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {folder.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {folder.tag || 'Untagged'}
                </p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Repository Path */}
          <div className="mb-4">
            <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }} title={folder.path}>
              {folder.path}
            </p>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Git Repository
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFolderClick(folder)
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RepositoriesFolders
