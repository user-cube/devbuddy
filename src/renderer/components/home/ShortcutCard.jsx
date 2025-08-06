import React from 'react'
import { Rocket, Server, Globe, GitBranch, GitPullRequest, GitMerge } from 'lucide-react'

const ShortcutCard = ({ shortcut, onClick }) => {
  const getIcon = (iconName) => {
    const icons = {
      rocket: Rocket,
      server: Server,
      globe: Globe,
      jira: GitBranch,
      github: GitPullRequest,
      gitlab: GitMerge
    }
    return icons[iconName] || Rocket
  }

  const Icon = getIcon(shortcut.icon)

  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 rounded-lg p-4 hover:from-primary-500/20 hover:to-primary-600/20 hover:border-primary-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Icon className="w-6 h-6 text-primary-400 group-hover:text-primary-300 transition-colors" />
        <span className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">
          {shortcut.name}
        </span>
        {shortcut.description && (
          <span className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors">
            {shortcut.description}
          </span>
        )}
      </div>
    </button>
  )
}

export default ShortcutCard 