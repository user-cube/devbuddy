import React from 'react'
import { GitPullRequest, Wrench } from 'lucide-react'

const GitHub = () => {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">
          GitHub Pull Requests
        </h1>
        <p className="text-dark-300 text-lg">
          Your pull requests and reviews
        </p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <Wrench className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-dark-300">
            GitHub integration will be available soon! You'll be able to monitor your pull requests and reviews directly from DevBuddy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GitHub 