import React from 'react'
import { GitMerge } from 'lucide-react'

const GitLabEmpty = ({ searchQuery, filter }) => {
  return (
    <div className="text-center py-12">
      <GitMerge className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {searchQuery || filter !== 'all' ? 'No matching merge requests' : 'No merge requests found'}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {searchQuery || filter !== 'all' 
          ? 'Try adjusting your search or filters' 
          : 'Merge requests assigned to you will appear here'
        }
      </p>
    </div>
  )
}

export default GitLabEmpty
