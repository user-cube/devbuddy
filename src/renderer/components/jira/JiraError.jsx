import React from 'react';
import {
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const JiraError = ({ error, onRetry }) => {
  return (
    <div className="p-8">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
        <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Error Loading Issues</h3>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--accent-primary)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    </div>
  );
};

export default JiraError;
