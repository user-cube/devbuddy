import React from 'react';

const RedirectsHeader = () => {
  return (
    <div className="text-center mb-8">
      <h1
        className="text-4xl font-bold mb-2"
        style={{
          background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Local Redirects
      </h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
        Configure local domain redirects for quick access
      </p>
    </div>
  );
};

export default RedirectsHeader;
