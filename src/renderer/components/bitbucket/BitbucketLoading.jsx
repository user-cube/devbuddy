import React from 'react'
import { GitBranch, Loader2 } from 'lucide-react'

const BitbucketLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="flex items-center gap-3 mb-4">
        <GitBranch className="w-8 h-8" style={{ color: '#0052cc' }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Loading Bitbucket Pull Requests
        </h2>
      </div>
      
      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Fetching pull requests...</span>
      </div>
    </div>
  )
}

export default BitbucketLoading
