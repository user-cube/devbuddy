import React from 'react';
import {
  GitBranch,
  GitPullRequest,
  GitMerge,
  Folder,
  Wifi,
  WifiOff,
  AlertCircle,
  Lock,
  LinkIcon,
  StickyNote,
  CheckSquare
} from 'lucide-react';

const HomeIntegrationStatus = ({ activeIntegrations, stats, onQuickAction, extras }) => {
  const getIntegrationStatus = (integration) => {
    if (!activeIntegrations[integration]) {
      return { status: 'disabled', icon: Lock, color: 'var(--text-muted)' };
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
    { key: 'repositories', name: 'Repositories', icon: Folder, color: '#8b5cf6' },
    // Extra summary cards after repositories - reordered: Redirects, Tasks, Notes
    { key: 'redirectsSummary', name: 'Redirects', icon: LinkIcon, color: '#51cf66' },
    { key: 'tasksSummary', name: 'Tasks', icon: CheckSquare, color: '#f59e0b' },
    { key: 'notesSummary', name: 'Notes', icon: StickyNote, color: '#60a5fa' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {integrations.map((integration) => {
        if (integration.key === 'redirectsSummary') {
          const badgeColor = extras?.redirects?.running ? 'var(--success)' : 'var(--error)';
          const badgeTitle = extras?.redirects?.running ? 'Server running' : 'Server stopped';
          const noRedirects = (extras?.redirects?.count || 0) === 0;
          return (
            <div
              key="redirectsSummary"
              className="relative group p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-[fadeIn_300ms_ease-out]"
              style={{
                background: noRedirects
                  ? 'linear-gradient(135deg, rgba(148,163,184,0.08), rgba(148,163,184,0.04))'
                  : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                border: noRedirects ? '1px dashed rgba(148,163,184,0.35)' : '1px solid var(--border-primary)'
              }}
              onClick={() => { window.location.hash = '#/redirects'; }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-6 h-6" style={{ color: '#51cf66' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Redirects
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(extras?.redirects?.count || 0)} entries • {(extras?.redirects?.domains || 0)} domains
                    </p>
                  </div>
                </div>
                <span title={badgeTitle} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: badgeColor }} />
              </div>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
                <div className="px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                  Redirects: {extras?.redirects?.count || 0} entries in {extras?.redirects?.domains || 0} domains • Server: {extras?.redirects?.running ? 'running' : 'stopped'}{extras?.redirects?.port ? ` :${extras.redirects.port}` : ''}
                </div>
              </div>
            </div>
          );
        }

        if (integration.key === 'notesSummary') {
          const noNotes = (extras?.notes?.notes || 0) === 0;
          return (
            <div
              key="notesSummary"
              className="relative group p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-[fadeIn_300ms_ease-out]"
              style={{
                background: noNotes
                  ? 'linear-gradient(135deg, rgba(96,165,250,0.10), rgba(96,165,250,0.05))'
                  : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                border: noNotes ? '1px dashed rgba(96,165,250,0.35)' : '1px solid var(--border-primary)'
              }}
              onClick={() => { window.location.hash = '#/notes'; }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StickyNote className="w-6 h-6" style={{ color: '#60a5fa' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Notes
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(extras?.notes?.notes || 0)} notes • {(extras?.notes?.notebooks || 0)} notebooks
                    </p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(96,165,250,0.8)' }} />
              </div>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
                <div className="px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                  Notes: {extras?.notes?.notes || 0} notes across {extras?.notes?.notebooks || 0} notebooks
                </div>
              </div>
            </div>
          );
        }

        if (integration.key === 'tasksSummary') {
          const hasOverdue = (extras?.tasks?.overdue || 0) > 0;
          const badgeColor = hasOverdue ? 'var(--warning)' : 'var(--success)';
          const badgeTitle = hasOverdue ? `${extras?.tasks?.overdue || 0} overdue` : 'Healthy';
          const overdue = extras?.tasks?.overdue || 0;
          const bgStyle = overdue >= 5
            ? 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))'
            : hasOverdue
              ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))'
              : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))';
          const borderStyle = overdue >= 5
            ? '1px solid rgba(239,68,68,0.35)'
            : hasOverdue
              ? '1px solid rgba(245,158,11,0.30)'
              : '1px solid var(--border-primary)';
          return (
            <div
              key="tasksSummary"
              className="relative group p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-[fadeIn_300ms_ease-out]"
              style={{
                background: bgStyle,
                border: borderStyle
              }}
              onClick={() => { window.location.hash = '#/tasks'; }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-6 h-6" style={{ color: '#f59e0b' }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Tasks
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(extras?.tasks?.total || 0)} total • {(extras?.tasks?.pending || 0)} pending{extras?.tasks?.overdue ? ` • ${extras.tasks.overdue} overdue` : ''}
                    </p>
                  </div>
                </div>
                <span title={badgeTitle} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: badgeColor }} />
              </div>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block">
                <div className="px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                  Tasks: {extras?.tasks?.total || 0} total • {extras?.tasks?.pending || 0} pending • {extras?.tasks?.dueToday || 0} due today • {extras?.tasks?.overdue || 0} overdue • {extras?.tasks?.completionRate || 0}% complete
                </div>
              </div>
            </div>
          );
        }

        const status = getIntegrationStatus(integration.key);
        const StatusIcon = status.icon;
        const IntegrationIcon = integration.icon;

        return (
          <div
            key={integration.key}
            className="p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-[fadeIn_300ms_ease-out]"
            style={{
              background: status.status === 'disabled'
                ? 'linear-gradient(135deg, rgba(148,163,184,0.08), rgba(148,163,184,0.05))'
                : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
              border: status.status === 'disabled' ? '1px dashed rgba(148,163,184,0.35)' : '1px solid var(--border-primary)',
              opacity: status.status === 'disabled' ? 0.8 : 1
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
