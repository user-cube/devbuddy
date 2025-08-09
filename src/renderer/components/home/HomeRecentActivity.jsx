import React from 'react';
import {
  Activity,
  GitBranch,
  GitPullRequest,
  GitMerge,
  Folder,
  Settings,
  ExternalLink
} from 'lucide-react';
import { getStatusIcon } from './HomeUtils';

const HomeRecentActivity = ({ activeIntegrations, recentItems, onOpenItem }) => {
  const integrations = [
    {
      key: 'jira',
      name: 'Jira',
      icon: GitBranch,
      color: '#3b82f6',
      items: recentItems.jira,
      enabled: activeIntegrations.jira
    },
    {
      key: 'github',
      name: 'GitHub',
      icon: GitPullRequest,
      color: '#10b981',
      items: recentItems.github,
      enabled: activeIntegrations.github
    },
    {
      key: 'gitlab',
      name: 'GitLab',
      icon: GitMerge,
      color: '#f56565',
      items: recentItems.gitlab,
      enabled: activeIntegrations.gitlab
    },
    {
      key: 'bitbucket',
      name: 'Bitbucket',
      icon: GitPullRequest,
      color: '#0052cc',
      items: recentItems.bitbucket,
      enabled: activeIntegrations.bitbucket
    },
    {
      key: 'repositories',
      name: 'Repositories',
      icon: Folder,
      color: '#8b5cf6',
      items: recentItems.repositories,
      enabled: activeIntegrations.repositories
    }
  ];

  const hasAnyIntegration = integrations.some(integration => integration.enabled);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          if (!integration.enabled || integration.items.length === 0) return null;

          const IntegrationIcon = integration.icon;

          return (
            <div key={integration.key}>
              <div className="flex items-center gap-2 mb-3">
                <IntegrationIcon className="w-4 h-4" style={{ color: integration.color }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {integration.name}
                </span>
              </div>
              <div className="space-y-2">
                {integration.items.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)'
                    }}
                    onClick={() => onOpenItem(item, integration.key)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(item, integration.key)}
                          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {integration.key === 'jira' ? item.key :
                              integration.key === 'github' ? `#${item.number}` :
                                integration.key === 'gitlab' ? `!${item.iid}` :
                                  integration.key === 'bitbucket' ? `#${item.id}` :
                                    item.name}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                          {integration.key === 'jira' ? item.fields?.summary :
                            integration.key === 'github' || integration.key === 'gitlab' || integration.key === 'bitbucket' ? item.title :
                              item.path}
                        </p>
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!hasAnyIntegration && (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Configure integrations to see recent activity
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeRecentActivity;
