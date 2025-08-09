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
      }
    } catch {
      // no-op
    }
  };

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
        })
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

      <HomeStats stats={stats} onQuickAction={handleQuickAction} />

      <HomeIntegrationStatus
        activeIntegrations={activeIntegrations}
        stats={stats}
        onQuickAction={handleQuickAction}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <HomeBookmarks shortcuts={shortcuts} onBookmarkClick={handleBookmarkClick} />
        <HomeRecentActivity
          activeIntegrations={activeIntegrations}
          recentItems={recentItems}
          onOpenItem={openItem}
        />
      </div>

      <HomeQuickActions />
    </div>
  );
};

export default Home;
