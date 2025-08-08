import React from 'react'
import {
  GitBranch,
  ExternalLink,
  FileText,
  Calendar,
  RefreshCw,
  Settings
} from 'lucide-react'
import GitGraph from './GitGraph'

const RepositoriesDetails = ({ 
  selectedFolder, 
  selectedDirectory, 
  appConfig, 
  repositoryCommits, 
  onBack, 
  onRefresh, 
  onSettings, 
  onOpenRepository, 
  onOpenInEditor, 
  onRefreshCommits, 
  loading 
}) => {
  const getStatusIcon = (repo) => {
    if (repo.hasChanges) {
      return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--warning)' }}></div>
    }
    if (repo.isUpToDate) {
      return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
    }
    return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--error)' }}></div>
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              color: 'var(--text-secondary)'
            }}
            title="Back to folders"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <GitBranch className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedFolder.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {selectedFolder.path}
              </p>
            </div>
          </div>
          
          {getStatusIcon(selectedFolder)}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'var(--accent-primary)'
            }}
            title="Refresh repository info"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onSettings}
            className="p-3 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              color: 'var(--text-secondary)'
            }}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Repository Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repository Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <GitBranch className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedFolder.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {selectedFolder.path}
                </p>
              </div>
              {getStatusIcon(selectedFolder)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Current Branch</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedFolder.branch || 'No branch'}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Commit</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(selectedFolder.lastCommitDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Remote</span>
                  </div>
                  <p className="text-sm font-mono truncate" style={{ color: 'var(--text-primary)' }} title={selectedFolder.remote || 'None'}>
                    {selectedFolder.remote || 'None'}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ 
                      backgroundColor: selectedFolder.hasChanges ? 'var(--warning)' : 
                                  selectedFolder.isUpToDate ? 'var(--success)' : 'var(--error)' 
                    }}></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedFolder.hasChanges ? 'Has changes' : 
                     selectedFolder.isUpToDate ? 'Up to date' : 'Behind remote'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => onOpenRepository(selectedFolder.path)}
              className="w-full px-4 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              <ExternalLink className="w-5 h-5" />
              <span>Open in File Explorer</span>
            </button>
            <button
              onClick={() => onOpenInEditor(selectedFolder.path)}
              className="w-full px-4 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)'
              }}
            >
              <FileText className="w-5 h-5" />
              <span>Open in {appConfig?.defaultEditor === 'cursor' ? 'Cursor' : 'VS Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Git Graph */}
      <div className="mt-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recent Commits
              </h3>
              <span className="text-sm px-2 py-1 rounded-full" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)'
              }}>
                {repositoryCommits[selectedFolder.path]?.length || 0} commits
              </span>
            </div>
            <button
              onClick={onRefreshCommits}
              className="p-3 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
              title="Refresh commits"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <GitGraph 
            commits={repositoryCommits[selectedFolder.path] || []} 
            currentBranch={selectedFolder.branch}
          />
        </div>
      </div>
    </div>
  )
}

export default RepositoriesDetails
