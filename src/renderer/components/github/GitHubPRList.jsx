import React from 'react'
import { GitPullRequest } from 'lucide-react'
import GitHubPRCard from './GitHubPRCard'

const GitHubPRList = ({ pullRequests, searchQuery, filter, onPRClick }) => {
  if (pullRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <GitPullRequest className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {searchQuery || filter !== 'all' ? 'No matching pull requests' : 'No pull requests found'}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {searchQuery || filter !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'Pull requests assigned to you will appear here'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pullRequests.map((pr) => (
        <GitHubPRCard
          key={pr.id}
          pr={pr}
          onClick={() => onPRClick(pr)}
        />
      ))}
    </div>
  )
}

export default GitHubPRList
