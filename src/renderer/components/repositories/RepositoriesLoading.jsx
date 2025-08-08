import React from 'react'

const RepositoriesLoading = ({ selectedFolder, selectedDirectory }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: 'var(--accent-primary)' }}
        ></div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          {selectedFolder ? `Loading repository information...` : 
           selectedDirectory ? `Loading folders from ${selectedDirectory.path}...` : 
           'Loading repositories...'}
        </p>
      </div>
    </div>
  )
}

export default RepositoriesLoading
