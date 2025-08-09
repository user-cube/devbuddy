import React from 'react';
import { GitPullRequest, RefreshCw } from 'lucide-react';

const BitbucketEmpty = ({ searchQuery, filter }) => {
  const getMessage = () => {
    if (searchQuery) {
      return `No pull requests found matching "${searchQuery}"`;
    }

    switch (filter) {
    case 'assigned':
      return 'No pull requests assigned to you';
    case 'review-requested':
      return 'No pull requests requesting your review';
    case 'reviewing':
      return 'No pull requests you are currently reviewing';
    case 'draft':
      return 'No draft pull requests found';
    default:
      return 'No pull requests found in your Bitbucket repositories';
    }
  };

  const getSubMessage = () => {
    if (searchQuery) {
      return 'Try adjusting your search terms or check your filters';
    }

    switch (filter) {
    case 'assigned':
      return 'Pull requests assigned to you will appear here';
    case 'review-requested':
      return 'Pull requests requesting your review will appear here';
    case 'reviewing':
      return 'Pull requests you are currently reviewing will appear here';
    case 'draft':
      return 'Draft pull requests will appear here';
    default:
      return 'This could be because there are no open pull requests or the integration needs to be configured';
    }
  };

  return (
    <div className="text-center py-12">
      <div className="flex items-center justify-center mb-6">
        <GitPullRequest className="w-16 h-16" style={{ color: 'var(--text-muted)' }} />
      </div>

      <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        {getMessage()}
      </h3>

      <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
        {getSubMessage()}
      </p>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300"
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'white'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
        }}
      >
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
};

export default BitbucketEmpty;
