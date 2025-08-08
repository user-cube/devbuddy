import React from 'react'

const JiraLoading = () => {
  return (
    <div className="p-8">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
          style={{ borderColor: 'var(--accent-primary)' }}
        ></div>
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading issues...</p>
      </div>
    </div>
  )
}

export default JiraLoading
