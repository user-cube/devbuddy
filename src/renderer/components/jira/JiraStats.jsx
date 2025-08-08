import React from 'react'
import {
  GitBranch,
  User,
  Clock,
  Flag
} from 'lucide-react'

const JiraStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Issues',
      value: stats.total,
      icon: GitBranch,
      color: 'var(--accent-primary)'
    },
    {
      label: 'Assigned',
      value: stats.assigned,
      icon: User,
      color: 'var(--success)'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'var(--warning)'
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      icon: Flag,
      color: 'var(--error)'
    },
    {
      label: 'Reported',
      value: stats.reported,
      icon: User,
      color: 'var(--accent-primary)'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
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
        )
      })}
    </div>
  )
}

export default JiraStats
