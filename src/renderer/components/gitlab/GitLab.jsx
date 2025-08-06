import React, { useState, useEffect } from 'react'
import {
  GitMerge,
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

const GitLab = () => {
  const [mergeRequests, setMergeRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMR, setSelectedMR] = useState(null)
  const [mrDetails, setMrDetails] = useState(null)
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
    loadMergeRequests()
  }, [])

  const loadMergeRequests = async (forceReload = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear cache if force reload is requested
      if (forceReload) {
        try {
          await window.electronAPI.clearGitlabCache()
          console.log('GitLab cache cleared for force reload')
        } catch (error) {
          console.error('Error clearing GitLab cache:', error)
        }
      }
      
      const mrs = await window.electronAPI.getGitlabMRs()
      setMergeRequests(mrs)
      
      // Calculate stats
      const stats = {
        total: mrs.length,
        assigned: mrs.filter(mr => mr.assignees?.length > 0).length,
        reviewing: mrs.filter(mr => mr.reviewers?.length > 0).length,
        draft: mrs.filter(mr => mr.work_in_progress).length,
        reviewRequested: mrs.filter(mr => mr.reviewers?.length > 0).length
      }
      setStats(stats)
    } catch (err) {
      console.error('GitLab component: Error loading MRs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testGitLabConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = await window.electronAPI.getGitlabUserInfo()
      
      if (userInfo) {
        alert(`GitLab connection successful! Logged in as: ${userInfo.username}`)
      } else {
        alert('GitLab connection failed. Please check your configuration.')
      }
    } catch (err) {
      console.error('GitLab connection test failed:', err)
      alert(`GitLab connection test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadMergeRequestDetails = async (mr) => {
    try {
      const details = await window.electronAPI.getGitlabMRDetails(mr.iid, mr.project_id)
      setMrDetails(details)
      setSelectedMR(mr)
    } catch (err) {
      console.error('Error loading MR details:', err)
    }
  }

  const openMergeRequest = async (mr) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(mr.web_url)
      }
    } catch (error) {
      console.error('Error opening MR:', error)
    }
  }

  const getFilteredMRs = () => {
    let filtered = mergeRequests

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(mr => 
        mr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mr.source_branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mr.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'assigned':
        filtered = filtered.filter(mr => mr.assignees?.length > 0)
        break
      case 'reviewing':
        filtered = filtered.filter(mr => mr.reviewers?.length > 0)
        break
      case 'review-requested':
        filtered = filtered.filter(mr => mr.reviewers?.length > 0)
        break
      case 'draft':
        filtered = filtered.filter(mr => mr.work_in_progress)
        break
      default:
        break
    }

    return filtered
  }

  const getStatusIcon = (mr) => {
    if (mr.work_in_progress) return <Clock className="w-4 h-4 text-yellow-500" />
    if (mr.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (mr.state === 'closed') return <XCircle className="w-4 h-4 text-red-500" />
    return <GitMerge className="w-4 h-4 text-orange-500" />
  }

  const getStatusText = (mr) => {
    if (mr.work_in_progress) return 'Draft'
    if (mr.merged_at) return 'Merged'
    if (mr.state === 'closed') return 'Closed'
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
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading merge requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Error Loading Merge Requests</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={() => loadMergeRequests(false)}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
            style={{
              backgroundColor: 'rgba(245, 101, 101, 0.2)',
              border: '1px solid rgba(245, 101, 101, 0.3)',
              color: 'var(--accent-primary)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(245, 101, 101, 0.3)'
              e.target.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(245, 101, 101, 0.2)'
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

  const filteredMRs = getFilteredMRs()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(to right, #f56565, #ed8936)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          GitLab Merge Requests
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Monitor and manage your merge requests
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total MRs</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
            </div>
            <GitMerge className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
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
            placeholder="Search merge requests..."
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
          <option value="all">All MRs</option>
          <option value="assigned">Assigned to me</option>
          <option value="review-requested">Review requested</option>
          <option value="reviewing">Requested review</option>
          <option value="draft">Drafts</option>
        </select>

        <button
          onClick={() => loadMergeRequests(false)}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
          style={{
            backgroundColor: 'rgba(245, 101, 101, 0.2)',
            border: '1px solid rgba(245, 101, 101, 0.3)',
            color: 'var(--accent-primary)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(245, 101, 101, 0.3)'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(245, 101, 101, 0.2)'
            e.target.style.transform = 'translateY(0)'
          }}
          title="Refresh (use cache if available)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => loadMergeRequests(true)}
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
          onClick={testGitLabConnection}
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

      {/* Merge Requests List */}
      <div className="space-y-4">
        {filteredMRs.length === 0 ? (
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
        ) : (
          filteredMRs.map((mr) => (
            <div
              key={mr.id}
              className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => openMergeRequest(mr)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(mr)}
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: mr.work_in_progress 
                          ? 'rgba(245, 158, 11, 0.1)' 
                          : mr.merged_at 
                          ? 'rgba(16, 185, 129, 0.1)'
                          : mr.state === 'closed'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(245, 101, 101, 0.1)',
                        color: mr.work_in_progress 
                          ? 'var(--warning)' 
                          : mr.merged_at 
                          ? 'var(--success)'
                          : mr.state === 'closed'
                          ? 'var(--error)'
                          : 'var(--accent-primary)',
                        border: mr.work_in_progress 
                          ? '1px solid rgba(245, 158, 11, 0.3)' 
                          : mr.merged_at 
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : mr.state === 'closed'
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(245, 101, 101, 0.3)'
                      }}
                    >
                      {getStatusText(mr)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      !{mr.iid}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {mr.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      <span>{mr.source_branch} → {mr.target_branch}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{mr.author?.name || mr.author?.username}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(mr.created_at)}</span>
                    </div>
                    
                    {mr.assignees?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Assigned</span>
                      </div>
                    )}
                    
                    {mr.reviewers?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Reviewer</span>
                      </div>
                    )}
                    
                    {mr.user_notes_count > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{mr.user_notes_count}</span>
                      </div>
                    )}
                    
                    {mr.commits_count > 0 && (
                      <div className="flex items-center gap-1">
                        <GitCommit className="w-4 h-4" />
                        <span>{mr.commits_count}</span>
                      </div>
                    )}
                    
                    {mr.changes_count > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{mr.changes_count} files</span>
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

export default GitLab 