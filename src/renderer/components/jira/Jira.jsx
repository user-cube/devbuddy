import React from 'react'
import { GitBranch, Wrench } from 'lucide-react'

const Jira = () => {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
          Jira Tasks
        </h1>
        <p className="text-dark-300 text-lg">
          Your active tasks and issues
        </p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <div className="text-center">
          <Wrench className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-dark-300">
            Jira integration will be available soon! You'll be able to view and manage your tasks directly from DevBuddy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Jira 