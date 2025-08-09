import React from 'react';
import { Clock, RefreshCw, Zap } from 'lucide-react';

const HomeHeader = ({
  currentTime,
  loading,
  onRefresh,
  lastRefreshNotification,
  onDismissNotification
}) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-4 mb-6">
        <h1
          className="text-5xl font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Welcome back!
        </h1>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-3 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--accent-primary)'
          }}
          title="Refresh data"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentTime || 'Loading...'}
          </span>
        </div>

        {lastRefreshNotification && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-sm animate-pulse" style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)'
            }}>
              <Zap className="w-4 h-4 inline mr-1" />
              Auto-refreshed
            </div>
            <button
              onClick={onDismissNotification}
              className="text-sm opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeHeader;
