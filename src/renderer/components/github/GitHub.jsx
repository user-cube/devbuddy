import React, { useState, useEffect } from 'react'
import {
  GitPullRequest,
  GitBranch,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Settings,
  User,
  Calendar,
  GitCommit,
  FileText,
  Star,
  Users,
  TrendingUp
} from 'lucide-react'

const GitHub = () => {
  const [pullRequests, setPullRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPR, setSelectedPR] = useState(null)
  const [prDetails, setPrDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, assigned, reviewing, draft, review-requested
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    reviewing: 0,
    draft: 0,
    reviewRequested: 0
  })

  useEffect(() => {
    loadPullRequests()
  }, [])

  const loadPullRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const prs = await window.electronAPI.getGithubPRs()
      setPullRequests(prs)
      
      // Calculate stats
      const stats = {
        total: prs.length,
        assigned: prs.filter(pr => pr.assignees?.length > 0).length,
        reviewing: prs.filter(pr => pr.requested_reviewers?.length > 0).length,
        draft: prs.filter(pr => pr.draft).length,
        reviewRequested: prs.filter(pr => pr.requested_reviewers?.length > 0).length
      }
      setStats(stats)
    } catch (err) {
      console.error('GitHub component: Error loading PRs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testGitHubConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = await window.electronAPI.getGithubUserInfo()
      
      if (userInfo) {
        alert(`GitHub connection successful! Logged in as: ${userInfo.login}`)
      } else {
        alert('GitHub connection failed. Please check your configuration.')
      }
    } catch (err) {
      console.error('GitHub connection test failed:', err)
      alert(`GitHub connection test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadPullRequestDetails = async (pr) => {
    try {
      const repo = pr.repository_url.split('/repos/')[1]
      const details = await window.electronAPI.getGithubPRDetails(pr.number, repo)
      setPrDetails(details)
      setSelectedPR(pr)
    } catch (err) {
      console.error('Error loading PR details:', err)
    }
  }

  const openPullRequest = async (pr) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(pr.html_url)
      }
    } catch (error) {
      console.error('Error opening PR:', error)
    }
  }

  const getFilteredPRs = () => {
    let filtered = pullRequests

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(pr => 
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.repository?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.user?.login?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'assigned':
        filtered = filtered.filter(pr => pr.assignees?.length > 0)
        break
      case 'reviewing':
        filtered = filtered.filter(pr => pr.requested_reviewers?.length > 0)
        break
      case 'review-requested':
        filtered = filtered.filter(pr => pr.requested_reviewers?.length > 0)
        break
      case 'draft':
        filtered = filtered.filter(pr => pr.draft)
        break
      default:
        break
    }

    return filtered
  }

  const getStatusIcon = (pr) => {
    if (pr.draft) return <Clock className="w-4 h-4 text-yellow-500" />
    if (pr.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (pr.state === 'closed') return <XCircle className="w-4 h-4 text-red-500" />
    return <GitPullRequest className="w-4 h-4 text-blue-500" />
  }

  const getStatusText = (pr) => {
    if (pr.draft) return 'Draft'
    if (pr.merged_at) return 'Merged'
    if (pr.state === 'closed') return 'Closed'
    return 'Open'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading pull requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Error Loading Pull Requests</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={loadPullRequests}
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
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const filteredPRs = getFilteredPRs()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          GitHub Pull Requests
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Monitor and manage your pull requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div 
          className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total PRs</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
            </div>
            <GitPullRequest className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>

        <div 
          className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Assigned</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.assigned}</p>
            </div>
            <User className="w-8 h-8" style={{ color: 'var(--success)' }} />
          </div>
        </div>

        <div 
          className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reviewing</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.reviewing}</p>
            </div>
            <Eye className="w-8 h-8" style={{ color: 'var(--warning)' }} />
          </div>
        </div>

        <div 
          className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Drafts</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.draft}</p>
            </div>
            <Clock className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div 
          className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review Requested</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.reviewRequested}</p>
            </div>
            <Eye className="w-8 h-8" style={{ color: 'var(--warning)' }} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
          onClick={loadPullRequests}
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
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        
        <button
          onClick={testGitHubConnection}
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

      {/* Pull Requests List */}
      <div className="space-y-4">
        {filteredPRs.length === 0 ? (
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
        ) : (
          filteredPRs.map((pr) => (
            <div
              key={pr.id}
              className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => openPullRequest(pr)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(pr)}
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: pr.draft 
                          ? 'rgba(245, 158, 11, 0.1)' 
                          : pr.merged_at 
                          ? 'rgba(16, 185, 129, 0.1)'
                          : pr.state === 'closed'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(59, 130, 246, 0.1)',
                        color: pr.draft 
                          ? 'var(--warning)' 
                          : pr.merged_at 
                          ? 'var(--success)'
                          : pr.state === 'closed'
                          ? 'var(--error)'
                          : 'var(--accent-primary)',
                        border: pr.draft 
                          ? '1px solid rgba(245, 158, 11, 0.3)' 
                          : pr.merged_at 
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : pr.state === 'closed'
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {getStatusText(pr)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      #{pr.number}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {pr.title}
                  </h3>
                  
                                     <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                     <div className="flex items-center gap-1">
                       <GitBranch className="w-4 h-4" />
                       <span>{pr.repository?.full_name || pr.repository_url.split('/repos/')[1]}</span>
                     </div>
                     
                     <div className="flex items-center gap-1">
                       <User className="w-4 h-4" />
                       <span>{pr.user?.login}</span>
                     </div>
                     
                     <div className="flex items-center gap-1">
                       <Calendar className="w-4 h-4" />
                       <span>{formatDate(pr.created_at)}</span>
                     </div>
                     
                     {pr.assignees?.length > 0 && (
                       <div className="flex items-center gap-1">
                         <User className="w-4 h-4" />
                         <span>Assigned</span>
                       </div>
                     )}
                     
                     {pr.requested_reviewers?.length > 0 && (
                       <div className="flex items-center gap-1">
                         <Eye className="w-4 h-4" />
                         <span>Reviewer</span>
                       </div>
                     )}
                     
                     {pr.comments > 0 && (
                       <div className="flex items-center gap-1">
                         <MessageSquare className="w-4 h-4" />
                         <span>{pr.comments}</span>
                       </div>
                     )}
                     
                     {pr.commits > 0 && (
                       <div className="flex items-center gap-1">
                         <GitCommit className="w-4 h-4" />
                         <span>{pr.commits}</span>
                       </div>
                     )}
                     
                     {pr.changed_files > 0 && (
                       <div className="flex items-center gap-1">
                         <FileText className="w-4 h-4" />
                         <span>{pr.changed_files}</span>
                       </div>
                     )}
                   </div>
                </div>
                
                <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GitHub 