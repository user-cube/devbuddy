import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
  TrendingUp,
  Flag,
  Tag,
  FolderOpen
} from 'lucide-react'

const Jira = () => {
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [issueDetails, setIssueDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, assigned, reported, priority
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    reported: 0,
    highPriority: 0,
    inProgress: 0
  })

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async (forceReload = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear cache if force reload is requested
      if (forceReload) {
        try {
          await window.electronAPI.clearJiraCache()
          console.log('Jira cache cleared for force reload')
        } catch (error) {
          console.error('Error clearing Jira cache:', error)
        }
      }
      
      const jiraIssues = await window.electronAPI.getJiraIssues()
      setIssues(jiraIssues)
      
      // Calculate stats
      const stats = {
        total: jiraIssues.length,
        assigned: jiraIssues.filter(issue => issue.fields?.assignee).length,
        reported: jiraIssues.filter(issue => issue.fields?.reporter).length,
        highPriority: jiraIssues.filter(issue => issue.fields?.priority?.name === 'High' || issue.fields?.priority?.name === 'Highest').length,
        inProgress: jiraIssues.filter(issue => issue.fields?.status?.name === 'In Progress').length
      }
      setStats(stats)
    } catch (err) {
      console.error('Jira component: Error loading issues:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testJiraConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = await window.electronAPI.getJiraUserInfo()
      
      if (userInfo) {
        alert(`Jira connection successful! Logged in as: ${userInfo.displayName}`)
      } else {
        alert('Jira connection failed. Please check your configuration.')
      }
    } catch (err) {
      console.error('Jira connection test failed:', err)
      alert(`Jira connection test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadIssueDetails = async (issue) => {
    try {
      const details = await window.electronAPI.getJiraIssueDetails(issue.key)
      setIssueDetails(details)
      setSelectedIssue(issue)
    } catch (err) {
      console.error('Error loading issue details:', err)
    }
  }

  const openIssue = async (issue) => {
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getJiraConfig()
        const issueUrl = `${config.baseUrl}/browse/${issue.key}`
        await window.electronAPI.openExternal(issueUrl)
      }
    } catch (error) {
      console.error('Error opening issue:', error)
    }
  }

  const getFilteredIssues = () => {
    let filtered = issues

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(issue => 
        issue.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.fields?.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.fields?.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'assigned':
        filtered = filtered.filter(issue => issue.fields?.assignee)
        break
      case 'reported':
        filtered = filtered.filter(issue => issue.fields?.reporter)
        break
      case 'high-priority':
        filtered = filtered.filter(issue => 
          issue.fields?.priority?.name === 'High' || 
          issue.fields?.priority?.name === 'Highest'
        )
        break
      case 'in-progress':
        filtered = filtered.filter(issue => issue.fields?.status?.name === 'In Progress')
        break
      default:
        break
    }

    return filtered
  }

  const getStatusIcon = (issue) => {
    const status = issue.fields?.status?.name?.toLowerCase()
    
    if (status?.includes('done') || status?.includes('closed')) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status?.includes('in progress')) return <Clock className="w-4 h-4 text-blue-500" />
    if (status?.includes('blocked') || status?.includes('stopped')) return <XCircle className="w-4 h-4 text-red-500" />
    return <GitBranch className="w-4 h-4 text-gray-500" />
  }

  const getPriorityIcon = (priority) => {
    if (!priority) return null
    
    const priorityName = priority.name?.toLowerCase()
    if (priorityName?.includes('highest') || priorityName?.includes('critical')) {
      return <Flag className="w-4 h-4 text-red-500" />
    }
    if (priorityName?.includes('high')) {
      return <Flag className="w-4 h-4 text-orange-500" />
    }
    if (priorityName?.includes('medium')) {
      return <Flag className="w-4 h-4 text-yellow-500" />
    }
    return <Flag className="w-4 h-4 text-green-500" />
  }

  const getPriorityColor = (priority) => {
    if (!priority) return 'var(--text-muted)'
    
    const priorityName = priority.name?.toLowerCase()
    if (priorityName?.includes('highest') || priorityName?.includes('critical')) {
      return 'var(--error)'
    }
    if (priorityName?.includes('high')) {
      return '#f97316' // orange
    }
    if (priorityName?.includes('medium')) {
      return 'var(--warning)'
    }
    return 'var(--success)'
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
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading issues...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Error Loading Issues</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={() => loadIssues(false)}
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

  const filteredIssues = getFilteredIssues()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Jira Issues
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Monitor and manage your tasks
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Issues</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
            </div>
            <GitBranch className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>In Progress</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8" style={{ color: 'var(--warning)' }} />
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>High Priority</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.highPriority}</p>
            </div>
            <Flag className="w-8 h-8" style={{ color: 'var(--error)' }} />
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
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reported</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.reported}</p>
            </div>
            <User className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search issues..."
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
          <option value="all">All Issues</option>
          <option value="assigned">Assigned to me</option>
          <option value="reported">Reported by me</option>
          <option value="high-priority">High Priority</option>
          <option value="in-progress">In Progress</option>
        </select>

        <button
          onClick={() => loadIssues(false)}
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
          onClick={() => loadIssues(true)}
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
          onClick={testJiraConnection}
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
        
        <button
          onClick={() => navigate('/config?showJiraStatus=true')}
          className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: 'var(--accent-primary)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.3)'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.2)'
            e.target.style.transform = 'translateY(0)'
          }}
          title="Configure status filters"
        >
          <Filter className="w-4 h-4" />
          Status Filters
        </button>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchQuery || filter !== 'all' ? 'No matching issues' : 'No issues found'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Issues assigned to you will appear here'
              }
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => openIssue(issue)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(issue)}
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--accent-primary)',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {issue.fields?.status?.name || 'Unknown'}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {issue.key}
                    </span>
                    {getPriorityIcon(issue.fields?.priority)}
                    {issue.fields?.priority && (
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: getPriorityColor(issue.fields?.priority),
                          border: `1px solid ${getPriorityColor(issue.fields?.priority)}40`
                        }}
                      >
                        {issue.fields.priority.name}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {issue.fields?.summary}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" />
                      <span>{issue.fields?.project?.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{issue.fields?.issuetype?.name}</span>
                    </div>
                    
                    {issue.fields?.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{issue.fields.assignee.displayName}</span>
                      </div>
                    )}
                    
                    {issue.fields?.reporter && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Reporter: {issue.fields.reporter.displayName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(issue.fields?.created)}</span>
                    </div>
                    
                    {issue.fields?.comment?.total > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{issue.fields.comment.total}</span>
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

export default Jira 