import React from 'react';

const GitLabHeader = () => {
  return (
    <div className="text-center mb-8">
      <h1
        className="text-4xl font-bold mb-2"
        style={{
          background: 'linear-gradient(to right, #f56565, #ed8936)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        GitLab Merge Requests
      </h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
        Monitor and manage your merge requests
      </p>
    </div>
  );
};

export default GitLabHeader;
