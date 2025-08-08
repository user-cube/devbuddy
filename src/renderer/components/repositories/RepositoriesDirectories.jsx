import React from 'react'
import {
  Folder,
  ExternalLink,
  Settings
} from 'lucide-react'

const RepositoriesDirectories = ({ directories, onDirectoryClick, onSettingsClick }) => {
  if (!directories || directories.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No Directories Configured
        </h3>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Add directories in settings to scan for repositories
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
          Configure Directories
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {directories.map((directory) => (
        <div
          key={directory.id}
          className="card hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={() => onDirectoryClick(directory)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Folder className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                  {directory.tag || 'Untagged'}
                </h3>
                <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                  {directory.path}
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{
              backgroundColor: directory.enabled 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(107, 114, 128, 0.1)',
              color: directory.enabled 
                ? 'var(--success)' 
                : 'var(--text-secondary)'
            }}>
              {directory.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Click to view folders
            </span>
            <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default RepositoriesDirectories
