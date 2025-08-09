import React from 'react';

const GitHubHeader = () => {
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
        GitHub Pull Requests
      </h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
        Monitor and manage your pull requests
      </p>
    </div>
  );
};

export default GitHubHeader;
