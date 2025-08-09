import React from 'react'
import { GitBranch, AlertCircle, RefreshCw } from 'lucide-react'

const BitbucketError = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="flex items-center gap-3 mb-4">
        <GitBranch className="w-8 h-8" style={{ color: '#0052cc' }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Bitbucket Error
        </h2>
      </div>
      
      <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
      
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--bg-tertiary)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bg-secondary)'
        }}
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm">Try Again</span>
      </button>
    </div>
  )
}

export default BitbucketError
