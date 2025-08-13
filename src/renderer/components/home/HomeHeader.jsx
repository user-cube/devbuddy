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
    <div className="mb-4">
      <div className="flex items-center justify-end gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-lg font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentTime || 'Loading...'}
          </span>
        </div>

        {lastRefreshNotification && (
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full text-xs animate-pulse" style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)'
            }}>
              <Zap className="w-3.5 h-3.5 inline mr-1" />
              Auto-refreshed
            </div>
            <button
              onClick={onDismissNotification}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              ×
            </button>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--accent-primary)'
          }}
          title="Refresh data"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-center">
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
      </div>
    </div>
  );
};

export default HomeHeader;
