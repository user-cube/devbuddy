import React from 'react';
import {
  GitMerge,
  User,
  Eye,
  Clock
} from 'lucide-react';

const GitLabStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total MRs',
      value: stats.total,
      icon: GitMerge,
      color: 'var(--accent-primary)'
    },
    {
      label: 'Assigned',
      value: stats.assigned,
      icon: User,
      color: 'var(--success)'
    },
    {
      label: 'Reviewing',
      value: stats.reviewing,
      icon: Eye,
      color: 'var(--warning)'
    },
    {
      label: 'Drafts',
      value: stats.draft,
      icon: Clock,
      color: 'var(--text-muted)'
    },
    {
      label: 'Review Requested',
      value: stats.reviewRequested,
      icon: Eye,
      color: 'var(--warning)'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
              <IconComponent className="w-8 h-8" style={{ color: stat.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GitLabStats;
