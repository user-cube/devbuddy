import React from 'react';
import { LinkIcon, StickyNote, CheckSquare, ExternalLink } from 'lucide-react';

const StatCard = ({ title, subtitle, icon: Icon, color, onClick, children }) => (
  <div
    className="p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-[fadeIn_300ms_ease-out]"
    style={{
      background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
      border: '1px solid var(--border-primary)'
    }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6" style={{ color }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{subtitle}</p>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 opacity-60" style={{ color: 'var(--text-muted)' }} />
    </div>
    {children}
  </div>
);

const HomeBottom = ({ extras }) => {
  const { redirects, tasks, notes } = extras || {};

  const go = (hash) => { window.location.hash = hash; };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Redirects"
        subtitle={`${redirects.count || 0} entries • ${redirects.domains || 0} domains`}
        icon={LinkIcon}
        color="#51cf66"
        onClick={() => go('#/redirects')}
      >
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {redirects.running ? `Server running on :${redirects.port}` : 'Server stopped'}
        </div>
      </StatCard>

      <StatCard
        title="Notes"
        subtitle={`${notes.notes || 0} notes • ${notes.notebooks || 0} notebooks`}
        icon={StickyNote}
        color="#60a5fa"
        onClick={() => go('#/notes')}
      >
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Organize ideas and docs
        </div>
      </StatCard>

      <StatCard
        title="Tasks"
        subtitle={`${tasks.total || 0} tasks • ${tasks.completionRate || 0}% done`}
        icon={CheckSquare}
        color="#f59e0b"
        onClick={() => go('#/tasks')}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(148,163,184,0.25)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(tasks.completionRate || 0, 100)}%`, background: 'linear-gradient(90deg, rgba(16,185,129,0.9), rgba(59,130,246,0.9))' }} />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {tasks.pending || 0} pending{tasks.dueToday ? ` • ${tasks.dueToday} today` : ''}{tasks.overdue ? ` • ${tasks.overdue} overdue` : ''}
          </span>
        </div>
      </StatCard>
    </div>
  );
};

export default HomeBottom;


