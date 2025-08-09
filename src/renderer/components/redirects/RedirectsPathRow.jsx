import React from 'react';
import {
  Link,
  Globe,
  Zap,
  ExternalLink,
  Trash2,
  Edit3
} from 'lucide-react';

const RedirectsPathRow = ({
  domain,
  path,
  targetUrl,
  serverStatus,
  editingPaths,
  _onUpdatePath,
  onStartEditingPath,
  onFinishEditingPath,
  onUpdateEditingPath,
  onUpdateTargetUrl,
  onTestRedirect,
  onRemoveRedirect
}) => {
  return (
    <div
      className="group relative rounded-lg p-4 transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Path Section */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>PATH</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={editingPaths[`${domain}-${path}`] !== undefined ? editingPaths[`${domain}-${path}`] : path}
              onChange={(e) => onUpdateEditingPath(domain, path, e.target.value)}
              onFocus={() => onStartEditingPath(domain, path)}
              onBlur={(e) => onFinishEditingPath(domain, path, e.target.value, targetUrl)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur();
                } else if (e.key === 'Escape') {
                  // Cancel editing
                  onUpdateEditingPath(domain, path, path);
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              placeholder="jira"
            />
            <Edit3 className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-50" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Arrow */}
        <div className="md:col-span-1 flex justify-center">
          <div className="flex items-center">
            <Zap className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
          </div>
        </div>

        {/* Target URL Section */}
        <div className="md:col-span-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>TARGET URL</span>
          </div>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => onUpdateTargetUrl(domain, path, e.target.value)}
            className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            placeholder="https://jira.atlassian.net"
          />
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button
            onClick={() => onTestRedirect(domain, path)}
            disabled={!serverStatus.running}
            className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
            title="Test redirect"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemoveRedirect(domain, path)}
            className="p-2 rounded-lg transition-all duration-200 group/btn"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
            title="Remove redirect"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedirectsPathRow;
