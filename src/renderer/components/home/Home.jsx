import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  Link, 
  BarChart3, 
  GitPullRequest, 
  GitMerge, 
  GitBranch, 
  AlertCircle, 
  CheckCircle, 
  Clock as ClockIcon,
  Flag,
  TrendingUp,
  Users,
  Eye,
  RefreshCw,
  ExternalLink,
  Activity,
  Calendar,
  Target,
  Wifi,
  WifiOff,
  Bookmark,
  Plus,
  Settings,
  Zap,
  Star,
  Heart
} from 'lucide-react'
import BookmarkCard from './BookmarkCard'

const Home = ({ currentTime }) => {
  const [shortcuts, setShortcuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    jira: { total: 0, assigned: 0, inProgress: 0, highPriority: 0 },
    github: { total: 0, assigned: 0, reviewing: 0, draft: 0 },
    gitlab: { total: 0, assigned: 0, reviewing: 0, draft: 0 }
  })
  const [recentItems, setRecentItems] = useState({
    jira: [],
    github: [],
    gitlab: []
  })
  const [backgroundRefreshStatus, setBackgroundRefreshStatus] = useState({
    isRunning: false,
    lastRefreshTime: null,
    nextRefreshTime: null
  })
  const [lastRefreshNotification, setLastRefreshNotification] = useState(null)
  const [config, setConfig] = useState(null)
  const [activeIntegrations, setActiveIntegrations] = useState({
    jira: false,
    github: false,
    gitlab: false
  })

  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        await window.electronAPI.waitForInitialization();
        await loadDashboardData();
      } catch (error) {
        console.error('Error during initialization:', error);
        await loadDashboardData();
      }
    };

    initializeAndLoadData();
    loadBackgroundRefreshStatus();
    loadConfig();
    
    const handleBackgroundRefreshCompleted = (event, data) => {
      console.log('Background refresh completed:', data);
      setLastRefreshNotification({
        timestamp: data.timestamp,
        services: data.services
      });
      
      setTimeout(() => {
        loadDashboardData();
        loadBackgroundRefreshStatus();
      }, 1000);
    };

    if (window.electronAPI) {
      window.electronAPI.onBackgroundRefreshCompleted(handleBackgroundRefreshCompleted);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeBackgroundRefreshCompletedListener(handleBackgroundRefreshCompleted);
      }
    };
  }, [])

  useEffect(() => {
    const handleConfigChange = () => {
      loadConfig();
    };

    window.addEventListener('config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('config-changed', handleConfigChange);
    };
  }, []);

  const loadBackgroundRefreshStatus = async () => {
    try {
      if (window.electronAPI) {
        const status = await window.electronAPI.getBackgroundRefreshStatus();
        setBackgroundRefreshStatus(status);
      }
    } catch (error) {
      console.error('Error loading background refresh status:', error);
    }
  };

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const configData = await window.electronAPI.getConfig();
        setConfig(configData);
        setActiveIntegrations({
          jira: configData?.jira?.enabled || false,
          github: configData?.github?.enabled || false,
          gitlab: configData?.gitlab?.enabled || false
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const bookmarksData = await window.electronAPI.getAllBookmarks()
      setShortcuts(bookmarksData || [])
      
      const timeout = 10000
      const loadPromises = [
        loadJiraData().catch(err => {
          console.error('Jira load failed:', err)
          return null
        }),
        loadGitHubData().catch(err => {
          console.error('GitHub load failed:', err)
          return null
        }),
        loadGitLabData().catch(err => {
          console.error('GitLab load failed:', err)
          return null
        })
      ]
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), timeout)
      })
      
      await Promise.race([
        Promise.all(loadPromises),
        timeoutPromise
      ])
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      if (error.message === 'Load timeout') {
        setError('Some data took too long to load. Please try refreshing.')
      } else {
        setError('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadJiraData = async () => {
    try {
      const config = await window.electronAPI.getJiraConfig()
      if (config.enabled) {
        const issues = await window.electronAPI.getJiraIssues()
        
        setStats(prev => ({
          ...prev,
          jira: {
            total: issues.length,
            assigned: issues.filter(issue => issue.fields?.assignee).length,
            inProgress: issues.filter(issue => issue.fields?.status?.name === 'In Progress').length,
            highPriority: issues.filter(issue => 
              issue.fields?.priority?.name === 'High' || 
              issue.fields?.priority?.name === 'Highest'
            ).length
          }
        }))
        
        setRecentItems(prev => ({
          ...prev,
          jira: issues.slice(0, 3)
        }))
      }
    } catch (error) {
      console.error('Error loading Jira data:', error)
    }
  }

  const loadGitHubData = async () => {
    try {
      const config = await window.electronAPI.getGithubConfig()
      if (config.enabled) {
        const prs = await window.electronAPI.getGithubPRs()
        
        setStats(prev => ({
          ...prev,
          github: {
            total: prs.length,
            assigned: prs.filter(pr => pr.assignees?.length > 0).length,
            reviewing: prs.filter(pr => pr.requested_reviewers?.length > 0).length,
            draft: prs.filter(pr => pr.draft).length
          }
        }))
        
        setRecentItems(prev => ({
          ...prev,
          github: prs.slice(0, 3)
        }))
      }
    } catch (error) {
      console.error('Error loading GitHub data:', error)
    }
  }

  const loadGitLabData = async () => {
    try {
      const config = await window.electronAPI.getGitlabConfig()
      if (config.enabled) {
        const mrs = await window.electronAPI.getGitlabMRs()
        
        setStats(prev => ({
          ...prev,
          gitlab: {
            total: mrs.length,
            assigned: mrs.filter(mr => mr.assignees?.length > 0).length,
            reviewing: mrs.filter(mr => mr.reviewers?.length > 0).length,
            draft: mrs.filter(mr => mr.work_in_progress).length
          }
        }))
        
        setRecentItems(prev => ({
          ...prev,
          gitlab: mrs.slice(0, 3)
        }))
      }
    } catch (error) {
      console.error('Error loading GitLab data:', error)
    }
  }

  const handleBookmarkClick = async (bookmarkId) => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openBookmark(bookmarkId)
        console.log('Bookmark result:', result)
      } catch (error) {
        console.error('Error opening bookmark:', error)
      }
    }
  }

  const openItem = async (item, type) => {
    try {
      if (type === 'jira') {
        const config = await window.electronAPI.getJiraConfig()
        const issueUrl = `${config.baseUrl}/browse/${item.key}`
        await window.electronAPI.openExternal(issueUrl)
      } else if (type === 'github') {
        await window.electronAPI.openExternal(item.html_url)
      } else if (type === 'gitlab') {
        await window.electronAPI.openExternal(item.web_url)
      }
    } catch (error) {
      console.error('Error opening item:', error)
    }
  }

  const getStatusIcon = (item, type) => {
    if (type === 'jira') {
      const status = item.fields?.status?.name?.toLowerCase()
      if (status?.includes('done') || status?.includes('closed')) return <CheckCircle className="w-4 h-4 text-green-500" />
      if (status?.includes('in progress')) return <ClockIcon className="w-4 h-4 text-blue-500" />
      if (status?.includes('blocked')) return <AlertCircle className="w-4 h-4 text-red-500" />
      return <GitBranch className="w-4 h-4 text-gray-500" />
    } else if (type === 'github') {
      if (item.draft) return <ClockIcon className="w-4 h-4 text-yellow-500" />
      if (item.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />
      return <GitPullRequest className="w-4 h-4 text-blue-500" />
    } else if (type === 'gitlab') {
      if (item.work_in_progress) return <ClockIcon className="w-4 h-4 text-yellow-500" />
      if (item.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />
      return <GitMerge className="w-4 h-4 text-orange-500" />
    }
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

  const getIntegrationStatus = (integration) => {
    if (!activeIntegrations[integration]) {
      return { status: 'disabled', icon: WifiOff, color: 'var(--text-muted)' }
    }
    
    const hasData = stats[integration]?.total > 0
    return {
      status: hasData ? 'active' : 'no-data',
      icon: hasData ? Wifi : AlertCircle,
      color: hasData ? 'var(--success)' : 'var(--warning)'
    }
  }

  const handleQuickAction = (action) => {
    // Handle quick actions for integrations
    console.log('Quick action:', action)
    
    // Navigate to corresponding pages
    switch (action) {
      case 'jira':
        window.location.hash = '#/jira'
        break
      case 'github':
        window.location.hash = '#/github'
        break
      case 'gitlab':
        window.location.hash = '#/gitlab'
        break
      case 'overview':
      case 'assigned':
      case 'review':
      case 'priority':
        // These are stats cards, could show detailed view or filter
        console.log(`Stats action: ${action}`)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Dashboard Error</h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-primary)'
            }}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalItems = stats.jira.total + stats.github.total + stats.gitlab.total
  const totalAssigned = stats.jira.assigned + stats.github.assigned + stats.gitlab.assigned
  const totalReviewing = stats.github.reviewing + stats.gitlab.reviewing
  const totalHighPriority = stats.jira.highPriority

  return (
    <div className="min-h-screen p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 
            className="text-5xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Welcome back!
          </h1>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-3 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-primary)'
            }}
            title="Refresh data"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
              {currentTime || 'Loading...'}
            </span>
          </div>
          
          {lastRefreshNotification && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full text-sm animate-pulse" style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success)'
              }}>
                <Zap className="w-4 h-4 inline mr-1" />
                Auto-refreshed
              </div>
              <button
                onClick={() => setLastRefreshNotification(null)}
                className="text-sm opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div 
          className="p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => handleQuickAction('overview')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Items</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalItems}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>

        <div 
          className="p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => handleQuickAction('assigned')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Assigned</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalAssigned}</p>
            </div>
            <Users className="w-8 h-8" style={{ color: 'var(--success)' }} />
          </div>
        </div>

        <div 
          className="p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => handleQuickAction('review')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>In Review</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalReviewing}</p>
            </div>
            <Eye className="w-8 h-8" style={{ color: 'var(--warning)' }} />
          </div>
        </div>

        <div 
          className="p-6 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => handleQuickAction('priority')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>High Priority</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalHighPriority}</p>
            </div>
            <Flag className="w-8 h-8" style={{ color: 'var(--error)' }} />
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {['jira', 'github', 'gitlab'].map((integration) => {
          const status = getIntegrationStatus(integration)
          const IconComponent = status.icon
          const integrationNames = { jira: 'Jira', github: 'GitHub', gitlab: 'GitLab' }
          const integrationIcons = { jira: GitBranch, github: GitPullRequest, gitlab: GitMerge }
          const IntegrationIcon = integrationIcons[integration]
          
          return (
            <div
              key={integration}
              className="p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => handleQuickAction(integration)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IntegrationIcon className="w-6 h-6" style={{ color: status.color }} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {integrationNames[integration]}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {status.status === 'disabled' ? 'Disabled' : 
                       status.status === 'active' ? `${stats[integration]?.total || 0} items` : 
                       'No data'}
                    </p>
                  </div>
                </div>
                <IconComponent className="w-5 h-5" style={{ color: status.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Bookmarks */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bookmark className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Bookmarks</h2>
                {shortcuts.length > 0 && (
                  <span className="text-sm px-2 py-1 rounded-full" style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--accent-primary)'
                  }}>
                    {shortcuts.length} {shortcuts.length === 1 ? 'bookmark' : 'bookmarks'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.hash = '#/bookmarks'}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add
                </button>
                <button
                  onClick={() => window.location.hash = '#/bookmarks'}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    border: '1px solid rgba(107, 114, 128, 0.2)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Manage
                </button>
              </div>
            </div>
            
            {shortcuts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                {shortcuts.slice(0, 8).map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onClick={() => handleBookmarkClick(bookmark.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Bookmarks Yet
                </h3>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Create your first bookmark to get quick access to your favorite resources
                </p>
                <button
                  onClick={() => window.location.hash = '#/bookmarks'}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white'
                  }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create First Bookmark
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {/* Jira */}
            {activeIntegrations.jira && recentItems.jira.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4" style={{ color: '#3b82f6' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Jira</span>
                </div>
                <div className="space-y-2">
                  {recentItems.jira.slice(0, 2).map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onClick={() => openItem(issue, 'jira')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(issue, 'jira')}
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {issue.key}
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {issue.fields?.summary}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub */}
            {activeIntegrations.github && recentItems.github.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GitPullRequest className="w-4 h-4" style={{ color: '#10b981' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>GitHub</span>
                </div>
                <div className="space-y-2">
                  {recentItems.github.slice(0, 2).map((pr) => (
                    <div
                      key={pr.id}
                      className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onClick={() => openItem(pr, 'github')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(pr, 'github')}
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              #{pr.number}
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {pr.title}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GitLab */}
            {activeIntegrations.gitlab && recentItems.gitlab.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GitMerge className="w-4 h-4" style={{ color: '#f56565' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>GitLab</span>
                </div>
                <div className="space-y-2">
                  {recentItems.gitlab.slice(0, 2).map((mr) => (
                    <div
                      key={mr.id}
                      className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      onClick={() => openItem(mr, 'gitlab')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(mr, 'gitlab')}
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              !{mr.iid}
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {mr.title}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!activeIntegrations.jira && !activeIntegrations.github && !activeIntegrations.gitlab && (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Configure integrations to see recent activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Quick Actions Footer */}
      <div className="mt-12 p-6 rounded-xl" style={{
        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
        border: '1px solid var(--border-primary)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Quick Actions</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.hash = '#/bookmarks'}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: 'var(--accent-primary)'
                }}
              >
                Bookmarks
              </button>
              <button
                onClick={() => window.location.hash = '#/jira'}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: 'var(--accent-primary)'
                }}
              >
                Jira
              </button>
              <button
                onClick={() => window.location.hash = '#/github'}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: 'var(--success)'
                }}
              >
                GitHub
              </button>
              <button
                onClick={() => window.location.hash = '#/gitlab'}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(245, 101, 101, 0.1)',
                  border: '1px solid rgba(245, 101, 101, 0.2)',
                  color: '#f56565'
                }}
              >
                GitLab
              </button>
              <button
                onClick={() => window.location.hash = '#/repositories'}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: 'var(--accent-primary)'
                }}
              >
                Repositories
              </button>
              <button
                onClick={() => window.location.hash = '#/config'}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  color: 'var(--text-secondary)'
                }}
              >
                Settings
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Made with DevBuddy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 