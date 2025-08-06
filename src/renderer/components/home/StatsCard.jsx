import React from 'react'
import { GitBranch, GitPullRequest, GitMerge } from 'lucide-react'

const StatsCard = ({ stats }) => {
  const statItems = [
    {
      label: 'Jira Tasks',
      value: stats.jiraTasks,
      icon: GitBranch,
      color: 'text-blue-400'
    },
    {
      label: 'GitHub PRs',
      value: stats.githubPRs,
      icon: GitPullRequest,
      color: 'text-green-400'
    },
    {
      label: 'GitLab PRs',
      value: stats.gitlabPRs,
      icon: GitMerge,
      color: 'text-orange-400'
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="text-center p-4 rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
            }}
          >
            <Icon 
              className="w-6 h-6 mx-auto mb-2" 
              style={{ color: 'var(--accent-primary)' }}
            />
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--accent-primary)' }}
            >
              {item.value}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCard 