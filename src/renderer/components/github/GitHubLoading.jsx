import React from 'react'

const GitHubLoading = () => {
  return (
    <div className="p-8">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
          style={{ borderColor: 'var(--accent-primary)' }}
        ></div>
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading pull requests...</p>
      </div>
    </div>
  )
}

export default GitHubLoading
