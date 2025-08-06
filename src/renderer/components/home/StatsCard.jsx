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
            className="text-center p-4 bg-primary-500/10 rounded-lg border border-primary-500/20 hover:bg-primary-500/20 transition-colors cursor-pointer"
          >
            <Icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {item.value}
            </div>
            <div className="text-xs text-dark-400">
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCard 