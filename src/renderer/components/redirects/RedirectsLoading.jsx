import React from 'react'

const RedirectsLoading = () => {
  return (
    <div className="p-8">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
          style={{ borderColor: 'var(--accent-primary)' }}
        ></div>
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading redirects...</p>
      </div>
    </div>
  )
}

export default RedirectsLoading
