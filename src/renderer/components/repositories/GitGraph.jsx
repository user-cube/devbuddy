import React from 'react'
import {
  GitCommit,
  User,
  Calendar
} from 'lucide-react'
import { formatCommitDate, getCommitColor } from './RepositoriesUtils'

const GitGraph = ({ commits, currentBranch }) => {
  if (!commits || commits.length === 0) {
    return (
      <div className="text-center py-12">
        <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No commits found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {commits.map((commit, index) => (
        <div key={commit.hash} className="group relative">
          <div className="flex items-start gap-4">
            {/* Commit line */}
            <div className="flex flex-col items-center">
              <div 
                className="w-4 h-4 rounded-full border-2 transition-all duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: getCommitColor(commit, currentBranch),
                  borderColor: getCommitColor(commit, currentBranch)
                }}
              />
              {index < commits.length - 1 && (
                <div 
                  className="w-0.5 h-12 mt-2"
                  style={{ backgroundColor: 'var(--border-primary)' }}
                />
              )}
            </div>
            
            {/* Commit card */}
            <div className="flex-1 min-w-0">
              <div className="p-4 rounded-lg transition-all duration-300 group-hover:scale-[1.02]" style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)'
              }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {commit.message}
                    </h4>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {commit.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatCommitDate(commit.date)}
                      </span>
                      <span className="font-mono bg-black/10 px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
                        {commit.hash.substring(0, 7)}
                      </span>
                    </div>
                  </div>
                  {commit.branch === currentBranch && (
                    <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      {commit.branch}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GitGraph
