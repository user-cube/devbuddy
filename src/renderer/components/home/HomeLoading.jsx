import React from 'react'

const HomeLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: 'var(--accent-primary)' }}
        ></div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
      </div>
    </div>
  )
}

export default HomeLoading
