import React from 'react'
import {
  TrendingUp,
  Users,
  Eye,
  Flag,
  Folder
} from 'lucide-react'

const HomeStats = ({ stats, onQuickAction }) => {
  const totalItems = stats.jira.total + stats.github.total + stats.gitlab.total
  const totalAssigned = stats.jira.assigned + stats.github.assigned + stats.gitlab.assigned
  const totalReviewing = stats.github.reviewing + stats.gitlab.reviewing
  const totalHighPriority = stats.jira.highPriority
  const totalRepositories = stats.repositories.total

  const statCards = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: TrendingUp,
      color: 'var(--accent-primary)',
      action: 'overview'
    },
    {
      label: 'Assigned',
      value: totalAssigned,
      icon: Users,
      color: 'var(--success)',
      action: 'assigned'
    },
    {
      label: 'In Review',
      value: totalReviewing,
      icon: Eye,
      color: 'var(--warning)',
      action: 'review'
    },
    {
      label: 'High Priority',
      value: totalHighPriority,
      icon: Flag,
      color: 'var(--error)',
      action: 'priority'
    },
    {
      label: 'Repositories',
      value: totalRepositories,
      icon: Folder,
      color: 'var(--accent-primary)',
      action: 'repositories'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <div 
            key={index}
            className="p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => onQuickAction(stat.action)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
              <IconComponent className="w-8 h-8" style={{ color: stat.color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HomeStats
