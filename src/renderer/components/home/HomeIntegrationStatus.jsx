import React from 'react';
import {
  GitBranch,
  GitPullRequest,
  GitMerge,
  Folder,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';

const HomeIntegrationStatus = ({ activeIntegrations, stats, onQuickAction }) => {
  const getIntegrationStatus = (integration) => {
    if (!activeIntegrations[integration]) {
      return { status: 'disabled', icon: WifiOff, color: 'var(--text-muted)' };
    }

    const hasData = stats[integration]?.total > 0;
    return {
      status: hasData ? 'active' : 'no-data',
      icon: hasData ? Wifi : AlertCircle,
      color: hasData ? 'var(--success)' : 'var(--warning)'
    };
  };

  const integrations = [
    { key: 'jira', name: 'Jira', icon: GitBranch, color: '#3b82f6' },
    { key: 'github', name: 'GitHub', icon: GitPullRequest, color: '#10b981' },
    { key: 'gitlab', name: 'GitLab', icon: GitMerge, color: '#f56565' },
    { key: 'bitbucket', name: 'Bitbucket', icon: GitPullRequest, color: '#0052cc' },
    { key: 'repositories', name: 'Repositories', icon: Folder, color: '#8b5cf6' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {integrations.map((integration) => {
        const status = getIntegrationStatus(integration.key);
        const StatusIcon = status.icon;
        const IntegrationIcon = integration.icon;

        return (
          <div
            key={integration.key}
            className="p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => onQuickAction(integration.key)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IntegrationIcon className="w-6 h-6" style={{ color: status.color }} />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {integration.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {status.status === 'disabled' ? 'Disabled' :
                      status.status === 'active' ? `${stats[integration.key]?.total || 0} items` :
                        'No data'}
                  </p>
                </div>
              </div>
              <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HomeIntegrationStatus;
