import React from 'react'
import {
  Settings
} from 'lucide-react'

const RepositoriesDisabled = ({ onSettingsClick }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-8">
        <Settings className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Repositories Disabled</h3>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enable repositories in settings to view your local repositories
        </p>
        <button
          onClick={onSettingsClick}
          className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white'
          }}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Go to Settings
        </button>
      </div>
    </div>
  )
}

export default RepositoriesDisabled
