import React from 'react'

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const containerStyle = fullScreen
    ? { backgroundColor: 'var(--bg-primary)' }
    : { backgroundColor: 'var(--bg-primary)', minHeight: '60vh', width: '100%' }

  return (
    <div
      className={`${fullScreen ? 'flex h-screen w-full' : 'flex w-full'} items-center justify-center`}
      style={containerStyle}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
          style={{ borderColor: 'var(--accent-primary)' }}
        />
        {message && (
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default Loading


