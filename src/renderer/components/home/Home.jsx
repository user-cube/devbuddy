import React, { useState, useEffect } from 'react';
import HomeHeader from './HomeHeader';
import HomeStats from './HomeStats';
import HomeIntegrationStatus from './HomeIntegrationStatus';
import HomeBookmarks from './HomeBookmarks';
import HomeRecentActivity from './HomeRecentActivity';
import HomeQuickActions from './HomeQuickActions';
import HomeLoading from './HomeLoading';
import HomeError from './HomeError';

const Home = ({ currentTime }) => {
  const [shortcuts, setShortcuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compactMode, setCompactMode] = useState(false);
  const [stats, setStats] = useState({
    jira: { total: 0, assigned: 0, inProgress: 0, highPriority: 0 },
    github: { total: 0, assigned: 0, reviewing: 0, draft: 0 },
    gitlab: { total: 0, assigned: 0, reviewing: 0, draft: 0 },
    repositories: { total: 0 }
  });
  const [recentItems, setRecentItems] = useState({
    jira: [],
    github: [],
    gitlab: []
  });
  const [lastRefreshNotification, setLastRefreshNotification] = useState(null);

  // Bottom extras: redirects, tasks, notes
  const [extras, setExtras] = useState({
    redirects: { domains: 0, count: 0, running: false, port: null },
    tasks: { total: 0, pending: 0, dueToday: 0, overdue: 0, completionRate: 0 },
    notes: { notebooks: 0, notes: 0 }
  });

  const [activeIntegrations, setActiveIntegrations] = useState({
    jira: false,
    github: false,
    gitlab: false,
    repositories: false
  });

  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        await window.electronAPI.waitForInitialization();
        await loadDashboardData();
      } catch {
        await loadDashboardData();
      }
    };

    initializeAndLoadData();
    loadConfig();

    const handleBackgroundRefreshCompleted = (event, data) => {
      setLastRefreshNotification({
        timestamp: data.timestamp,
        services: data.services
      });

      setTimeout(() => {
        loadDashboardData();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleConfigChange = () => {
      loadConfig();
    };

    window.addEventListener('config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('config-changed', handleConfigChange);
    };
  }, []);

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const configData = await window.electronAPI.getConfig();
        const repositoriesConfig = await window.electronAPI.getRepositoriesConfig();
        setActiveIntegrations({
          jira: configData?.jira?.enabled || false,
          github: configData?.github?.enabled || false,
          gitlab: configData?.gitlab?.enabled || false,
          bitbucket: configData?.bitbucket?.enabled || false,
          repositories: repositoriesConfig?.enabled || false
        });

        // Ignore compact mode preference (reverted to standard view)
        setCompactMode(false);
      }
    } catch {
      // no-op
    }
  };

  // Compact mode disabled; keeping state for potential future use

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookmarksData = await window.electronAPI.getAllBookmarks();
      setShortcuts(bookmarksData || []);

      const timeout = 10000;
      const loadPromises = [
        loadJiraData().catch(_err => {
          // no-op
          return null;
        }),
        loadGitHubData().catch(_err => {
          // no-op
          return null;
        }),
        loadGitLabData().catch(_err => {
          // no-op
          return null;
        }),
        loadBitbucketData().catch(_err => {
          // no-op
          return null;
        }),
        loadRepositoriesData().catch(_err => {
          // no-op
          return null;
        }),
        loadRedirectsData().catch(_err => null),
        loadTasksData().catch(_err => null),
        loadNotesData().catch(_err => null)
      ];

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), timeout);
      });

      await Promise.race([
        Promise.all(loadPromises),
        timeoutPromise
      ]);

    } catch (error) {
      // no-op
      if (error.message === 'Load timeout') {
        setError('Some data took too long to load. Please try refreshing.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadJiraData = async () => {
    try {
      const config = await window.electronAPI.getJiraConfig();
      if (config.enabled) {
        const issues = await window.electronAPI.getJiraIssues();

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
        }));

        setRecentItems(prev => ({
          ...prev,
          jira: issues.slice(0, 3)
        }));
      }
    } catch {
      // no-op
    }
  };

  const loadGitHubData = async () => {
    try {
      const config = await window.electronAPI.getGithubConfig();
      if (config.enabled) {
        const prs = await window.electronAPI.getGithubPRs();

        setStats(prev => ({
          ...prev,
          github: {
            total: prs.length,
            assigned: prs.filter(pr => pr.assignees?.length > 0).length,
            reviewing: prs.filter(pr => pr.requested_reviewers?.length > 0).length,
            draft: prs.filter(pr => pr.draft).length
          }
        }));

        setRecentItems(prev => ({
          ...prev,
          github: prs.slice(0, 3)
        }));
      }
    } catch {
      // no-op
    }
  };

  const loadGitLabData = async () => {
    try {
      const config = await window.electronAPI.getGitlabConfig();
      if (config.enabled) {
        const mrs = await window.electronAPI.getGitlabMRs();

        setStats(prev => ({
          ...prev,
          gitlab: {
            total: mrs.length,
            assigned: mrs.filter(mr => mr.assignees?.length > 0).length,
            reviewing: mrs.filter(mr => mr.reviewers?.length > 0).length,
            draft: mrs.filter(mr => mr.work_in_progress).length
          }
        }));

        setRecentItems(prev => ({
          ...prev,
          gitlab: mrs.slice(0, 3)
        }));
      }
    } catch {
      // no-op
    }
  };

  const loadBitbucketData = async () => {
    try {
      const config = await window.electronAPI.getBitbucketConfig();
      if (config.enabled) {
        const prs = await window.electronAPI.getBitbucketPRs();

        setStats(prev => ({
          ...prev,
          bitbucket: {
            total: prs.length,
            assigned: prs.filter(pr => pr.reviewers?.length > 0).length,
            reviewing: prs.filter(pr => pr.participants?.length > 0).length,
            draft: prs.filter(pr => pr.title?.toLowerCase().includes('[wip]') || pr.title?.toLowerCase().includes('[draft]')).length
          }
        }));

        setRecentItems(prev => ({
          ...prev,
          bitbucket: prs.slice(0, 3)
        }));
      }
    } catch {
      // no-op
    }
  };

  const loadRepositoriesData = async () => {
    try {
      const config = await window.electronAPI.getRepositoriesConfig();
      if (config.enabled) {
        const repos = await window.electronAPI.getRepositories();
        setStats(prev => ({
          ...prev,
          repositories: {
            total: repos.length
          }
        }));
        setRecentItems(prev => ({
          ...prev,
          repositories: repos.slice(0, 3)
        }));
      }
    } catch {
      // no-op
    }
  };

  const loadRedirectsData = async () => {
    try {
      const status = await window.electronAPI.getRedirectorStatus();
      const redirects = status?.redirects || {};
      const domains = Object.keys(redirects).length;
      const count = Object.values(redirects).reduce((acc, paths) => acc + Object.keys(paths || {}).length, 0);
      setExtras(prev => ({
        ...prev,
        redirects: { domains, count, running: !!status?.running, port: status?.port || null }
      }));
    } catch {
      // no-op
    }
  };

  const loadTasksData = async () => {
    try {
      const statsData = await window.electronAPI.getTaskStats();
      const tasks = await window.electronAPI.getTasks();
      const total = statsData?.total || (tasks ? tasks.length : 0);
      const pending = statsData?.pending ?? (tasks ? tasks.filter(t => !t.completed).length : 0);
      setExtras(prev => ({
        ...prev,
        tasks: {
          total,
          pending,
          dueToday: statsData?.dueToday || 0,
          overdue: statsData?.overdue || 0,
          completionRate: statsData?.completionRate || (total > 0 ? Math.round(((total - pending) / total) * 100) : 0)
        }
      }));
    } catch {
      // no-op
    }
  };

  const loadNotesData = async () => {
    try {
      const notebooks = await window.electronAPI.getNotebooks();
      let totalNotes = 0;
      for (const nb of (notebooks || [])) {
        try {
          const notes = await window.electronAPI.getNotes(nb.id);
          totalNotes += (notes || []).length;
        } catch {
          // per-notebook no-op
        }
      }
      setExtras(prev => ({
        ...prev,
        notes: { notebooks: (notebooks || []).length, notes: totalNotes }
      }));
    } catch {
      // no-op
    }
  };

  const handleBookmarkClick = async (bookmarkId) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.openBookmark(bookmarkId);
      } catch {
        // no-op
      }
    }
  };

  const openItem = async (item, type) => {
    try {
      if (type === 'jira') {
        const config = await window.electronAPI.getJiraConfig();
        const issueUrl = `${config.baseUrl}/browse/${item.key}`;
        await window.electronAPI.openExternal(issueUrl);
      } else if (type === 'github') {
        await window.electronAPI.openExternal(item.html_url);
      } else if (type === 'gitlab') {
        await window.electronAPI.openExternal(item.web_url);
      } else if (type === 'bitbucket') {
        await window.electronAPI.openExternal(item.links?.html?.href || item.url);
      } else if (type === 'repositories') {
        // For repositories, we can open the folder in file explorer
        await window.electronAPI.openRepository(item.path);
      }
    } catch {
      // no-op
    }
  };

  const handleQuickAction = (action) => {
    // Handle quick actions for integrations

    // Navigate to corresponding pages
    switch (action) {
    case 'jira':
      window.location.hash = '#/jira';
      break;
    case 'github':
      window.location.hash = '#/github';
      break;
    case 'gitlab':
      window.location.hash = '#/gitlab';
      break;
    case 'bitbucket':
      window.location.hash = '#/bitbucket';
      break;
    case 'repositories':
      window.location.hash = '#/repositories';
      break;
    case 'overview':
    case 'assigned':
    case 'review':
    case 'priority':
      // These are stats cards, could show detailed view or filter
      break;
    default:
      // no-op
      break;
    }
  };

  if (loading) {
    return <HomeLoading />;
  }

  if (error) {
    return <HomeError error={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="min-h-screen p-6">
      <HomeHeader
        currentTime={currentTime}
        loading={loading}
        onRefresh={loadDashboardData}
        lastRefreshNotification={lastRefreshNotification}
        onDismissNotification={() => setLastRefreshNotification(null)}
      />

      <HomeStats stats={stats} onQuickAction={handleQuickAction} extras={extras} />

      <HomeIntegrationStatus
        activeIntegrations={activeIntegrations}
        stats={stats}
        onQuickAction={handleQuickAction}
        extras={extras}
      />

      {/* Recent activity first */}
      <div className="mb-8">
        <HomeRecentActivity
          activeIntegrations={activeIntegrations}
          recentItems={recentItems}
          onOpenItem={openItem}
        />
      </div>

      {/* Bookmarks as a single horizontal row under recent activity */}
      <div className="mb-4">
        <HomeBookmarks
          shortcuts={shortcuts}
          onBookmarkClick={handleBookmarkClick}
          variant="row"
        />
      </div>

      <HomeQuickActions />
    </div>
  );
};

export default Home;
