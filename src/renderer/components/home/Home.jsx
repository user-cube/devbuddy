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
  ArrowRight
} from 'lucide-react'
import ShortcutCard from './ShortcutCard'

const Home = ({ currentTime }) => {
  const [shortcuts, setShortcuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    jira: {
      total: 0,
      assigned: 0,
      inProgress: 0,
      highPriority: 0,
      reported: 0
    },
    github: {
      total: 0,
      assigned: 0,
      reviewing: 0,
      draft: 0,
      reviewRequested: 0
    },
    gitlab: {
      total: 0,
      assigned: 0,
      reviewing: 0,
      draft: 0,
      reviewRequested: 0
    }
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
        // Wait for app initialization to complete
        await window.electronAPI.waitForInitialization();
        
        // Load dashboard data
        await loadDashboardData();
      } catch (error) {
        console.error('Error during initialization:', error);
        // Fallback: try to load data anyway
        await loadDashboardData();
      }
    };

    initializeAndLoadData();
    
    // Load background refresh status and config
    loadBackgroundRefreshStatus();
    loadConfig();
    
    // Listen for background refresh events
    const handleBackgroundRefreshCompleted = (event, data) => {
      console.log('Background refresh completed:', data);
      setLastRefreshNotification({
        timestamp: data.timestamp,
        services: data.services
      });
      
      // Reload dashboard data after background refresh
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

  // Listen for configuration changes
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
      
      // Load shortcuts first (fast, local data)
      const shortcutsData = await window.electronAPI.getShortcuts()
      setShortcuts(shortcutsData || [])
      
      // Load data from all integrations in parallel with timeout
      const timeout = 10000 // 10 seconds timeout
      
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
      
      // Use Promise.race to implement timeout
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
            ).length,
            reported: issues.filter(issue => issue.fields?.reporter).length
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
            draft: prs.filter(pr => pr.draft).length,
            reviewRequested: prs.filter(pr => pr.requested_reviewers?.length > 0).length
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
            draft: mrs.filter(mr => mr.work_in_progress).length,
            reviewRequested: mrs.filter(mr => mr.reviewers?.length > 0).length
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

  const handleShortcutClick = async (shortcutName) => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openShortcut(shortcutName)
        console.log('Shortcut result:', result)
      } catch (error) {
        console.error('Error opening shortcut:', error)
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



  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Dashboard Error</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
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
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 
            className="text-4xl font-bold"
            style={{
              background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Welcome to DevBuddy
          </h1>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-primary)'
            }}
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Your development companion
        </p>
        
        {/* Last Refresh Notification */}
        {lastRefreshNotification && (
          <div className="mt-2 flex items-center justify-center">
            <div className="px-3 py-1 rounded-full text-xs animate-pulse" style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-primary)'
            }}>
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Data refreshed automatically
            </div>
            <button
              onClick={() => setLastRefreshNotification(null)}
              className="ml-2 text-xs opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Integration Status Overview */}
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
              className="p-4 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => handleQuickAction(integration)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IntegrationIcon className="w-6 h-6" style={{ color: status.color }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div 
          className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Items</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalItems}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>

        <div 
          className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Assigned</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalAssigned}</p>
            </div>
            <Users className="w-8 h-8" style={{ color: 'var(--success)' }} />
          </div>
        </div>

        <div 
          className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reviewing</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalReviewing}</p>
            </div>
            <Eye className="w-8 h-8" style={{ color: 'var(--warning)' }} />
          </div>
        </div>

        <div 
          className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>High Priority</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalHighPriority}</p>
            </div>
            <Flag className="w-8 h-8" style={{ color: 'var(--error)' }} />
          </div>
        </div>
      </div>



      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Time Card */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <Clock className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Current Time</h3>
          </div>
          <div className="text-center">
            <div 
              className="text-3xl font-mono font-bold p-4 rounded-lg"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--accent-primary)'
              }}
            >
              {currentTime || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <Link className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Shortcuts</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {shortcuts.slice(0, 4).map((shortcut) => (
              <ShortcutCard
                key={shortcut.name}
                shortcut={shortcut}
                onClick={() => handleShortcutClick(shortcut.name)}
              />
            ))}
            {shortcuts.length === 0 && (
              <div className="col-span-2 text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No shortcuts configured
              </div>
            )}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Platform Stats</h3>
          </div>
          <div className="space-y-4">
            {/* Jira Stats */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" style={{ color: '#3b82f6' }} />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Jira</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.jira.total}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>issues</div>
              </div>
            </div>

            {/* GitHub Stats */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" style={{ color: '#10b981' }} />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>GitHub</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.github.total}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>PRs</div>
              </div>
            </div>

            {/* GitLab Stats */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2">
                <GitMerge className="w-5 h-5" style={{ color: '#f56565' }} />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>GitLab</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats.gitlab.total}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>MRs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Jira Issues */}
        <div className="card">
          <div 
            className="flex items-center justify-between mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6" style={{ color: '#3b82f6' }} />
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Jira Issues</h3>
            </div>
            {activeIntegrations.jira && (
              <button
                onClick={() => handleQuickAction('jira')}
                className="text-sm px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--accent-primary)'
                }}
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentItems.jira.length > 0 ? (
              recentItems.jira.map((issue) => (
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(issue, 'jira')}
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {issue.key}
                        </span>
                        {issue.fields?.priority?.name === 'High' || issue.fields?.priority?.name === 'Highest' ? (
                          <Flag className="w-3 h-3" style={{ color: 'var(--error)' }} />
                        ) : null}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {issue.fields?.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(issue.fields?.created)}
                        </p>
                        {issue.fields?.assignee && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--accent-primary)'
                          }}>
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                {activeIntegrations.jira ? 'No recent issues' : 'Jira disabled'}
              </div>
            )}
          </div>
        </div>

        {/* Recent GitHub PRs */}
        <div className="card">
          <div 
            className="flex items-center justify-between mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <GitPullRequest className="w-6 h-6" style={{ color: '#10b981' }} />
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Recent GitHub PRs</h3>
            </div>
            {activeIntegrations.github && (
              <button
                onClick={() => handleQuickAction('github')}
                className="text-sm px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981'
                }}
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentItems.github.length > 0 ? (
              recentItems.github.map((pr) => (
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(pr, 'github')}
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          #{pr.number}
                        </span>
                        {pr.draft && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: 'rgba(156, 163, 175, 0.1)',
                            color: 'var(--text-muted)'
                          }}>
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {pr.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(pr.created_at)}
                        </p>
                        {pr.user && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981'
                          }}>
                            {pr.user.login}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                {activeIntegrations.github ? 'No recent PRs' : 'GitHub disabled'}
              </div>
            )}
          </div>
        </div>

        {/* Recent GitLab MRs */}
        <div className="card">
          <div 
            className="flex items-center justify-between mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <div className="flex items-center gap-3">
              <GitMerge className="w-6 h-6" style={{ color: '#f56565' }} />
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Recent GitLab MRs</h3>
            </div>
            {activeIntegrations.gitlab && (
              <button
                onClick={() => handleQuickAction('gitlab')}
                className="text-sm px-2 py-1 rounded transition-colors"
                style={{
                  backgroundColor: 'rgba(245, 101, 101, 0.1)',
                  color: '#f56565'
                }}
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentItems.gitlab.length > 0 ? (
              recentItems.gitlab.map((mr) => (
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(mr, 'gitlab')}
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          !{mr.iid}
                        </span>
                        {mr.work_in_progress && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: 'rgba(156, 163, 175, 0.1)',
                            color: 'var(--text-muted)'
                          }}>
                            WIP
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {mr.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(mr.created_at)}
                        </p>
                        {mr.author && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            backgroundColor: 'rgba(245, 101, 101, 0.1)',
                            color: '#f56565'
                          }}>
                            {mr.author.username}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                {activeIntegrations.gitlab ? 'No recent MRs' : 'GitLab disabled'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Activity Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5" style={{ color: 'var(--success)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Today's Focus</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {totalAssigned > 0 ? `${totalAssigned} assigned items` : 'No assigned items'}
            </p>
            {totalHighPriority > 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                {totalHighPriority} high priority items
              </p>
            )}
          </div>

          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5" style={{ color: 'var(--warning)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>In Review</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {totalReviewing > 0 ? `${totalReviewing} items in review` : 'No items in review'}
            </p>
          </div>

          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Last Updated</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {backgroundRefreshStatus.lastRefreshTime ? 
                formatDate(backgroundRefreshStatus.lastRefreshTime) : 
                'Never'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Additional Shortcuts */}
      {shortcuts.length > 4 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>All Shortcuts</h2>
            <button
              onClick={() => window.location.href = '/shortcuts'}
              className="text-sm px-3 py-1 rounded transition-colors flex items-center gap-1"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)'
              }}
            >
              Manage
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => (
              <ShortcutCard
                key={shortcut.name}
                shortcut={shortcut}
                onClick={() => handleShortcutClick(shortcut.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home 