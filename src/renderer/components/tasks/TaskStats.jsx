import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Calendar, TrendingUp, Folder } from 'lucide-react';

const TaskStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: CheckCircle,
      color: 'var(--accent-primary)',
      description: 'All tasks'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'var(--success)',
      description: 'Finished tasks'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'var(--warning)',
      description: 'In progress'
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'var(--error)',
      description: 'Past due date'
    },
    {
      label: 'Due Today',
      value: stats.dueToday,
      icon: Calendar,
      color: 'var(--warning)',
      description: 'Due today'
    },
    {
      label: 'Categories',
      value: stats.totalCategories || 0,
      icon: Folder,
      color: '#8B5CF6',
      description: 'Total categories'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="p-4 rounded-lg border text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <Icon 
                className="w-5 h-5" 
                style={{ color: item.color }}
              />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {item.value}
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {item.label}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {item.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStats;
