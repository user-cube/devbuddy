// Helper functions for Repositories component

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

export const formatCommitDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusIcon = (repo) => {
  if (repo.hasChanges) {
    return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--warning)' }}></div>
  }
  if (repo.isUpToDate) {
    return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
  }
  return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--error)' }}></div>
}

export const getCommitColor = (commit, currentBranch) => {
  if (commit.branch === currentBranch) {
    return 'var(--accent-primary)'
  }
  return 'var(--text-secondary)'
}

export const filterRepositories = (repositories, searchQuery) => {
  if (!searchQuery.trim()) {
    return repositories
  }
  
  return repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.branch && repo.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.remote && repo.remote.toLowerCase().includes(searchQuery.toLowerCase()))
  )
}

export const getRepositoryCount = (repositories) => {
  return repositories.length
}

export const getDirectoryCount = (directories) => {
  return directories?.length || 0
}
