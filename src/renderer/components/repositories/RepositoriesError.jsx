import React from 'react'
import {
  AlertCircle,
  RefreshCw
} from 'lucide-react'

const RepositoriesError = ({ 
  error, 
  selectedFolder, 
  selectedDirectory, 
  onRetry 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-8">
        <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
        <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Repositories Error</h3>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--accent-primary)'
          }}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    </div>
  )
}

export default RepositoriesError
