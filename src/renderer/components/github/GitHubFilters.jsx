import React from 'react'
import {
  Search,
  RefreshCw
} from 'lucide-react'

const GitHubFilters = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  onRefresh,
  onForceRefresh,
  onTestConnection
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search pull requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <option value="all">All PRs</option>
        <option value="assigned">Assigned to me</option>
        <option value="review-requested">Review requested</option>
        <option value="reviewing">Requested review</option>
        <option value="draft">Drafts</option>
      </select>

      <button
        onClick={onRefresh}
        className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: 'var(--accent-primary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
          e.target.style.transform = 'translateY(0)'
        }}
        title="Refresh (use cache if available)"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      
      <button
        onClick={onForceRefresh}
        className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--error)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
          e.target.style.transform = 'translateY(0)'
        }}
        title="Force reload (clear cache)"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="ml-1 text-xs">Force</span>
      </button>
      
      <button
        onClick={onTestConnection}
        className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--success)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'
          e.target.style.transform = 'translateY(0)'
        }}
      >
        Test Connection
      </button>
    </div>
  )
}

export default GitHubFilters
