import React from 'react'

const JiraHeader = () => {
  return (
    <div className="text-center mb-8">
      <h1 
        className="text-4xl font-bold mb-2"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Jira Issues
      </h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
        Monitor and manage your tasks
      </p>
    </div>
  )
}

export default JiraHeader
