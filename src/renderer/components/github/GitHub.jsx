import React, { useState, useEffect } from 'react';
import GitHubHeader from './GitHubHeader';
import GitHubStats from './GitHubStats';
import GitHubFilters from './GitHubFilters';
import GitHubPRList from './GitHubPRList';
import GitHubLoading from './GitHubLoading';
import GitHubError from './GitHubError';
import { calculateStats, getFilteredPRs } from './GitHubUtils';
import { Toast } from '../../hooks/useToast';

const GitHub = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, assigned, reviewing, draft, review-requested
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    reviewing: 0,
    draft: 0,
    reviewRequested: 0
  });

  useEffect(() => {
    loadPullRequests();
  }, []);

  const loadPullRequests = async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache if force reload is requested
      if (forceReload) {
        try {
          await window.electronAPI.clearGithubCache();
        } catch {
          // no-op
        }
      }

      const prs = await window.electronAPI.getGithubPRs();
      setPullRequests(prs);

      // Calculate stats
      const newStats = calculateStats(prs);
      setStats(newStats);
    } catch (err) {
      // no-op
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGitHubConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = await window.electronAPI.getGithubUserInfo();

      if (userInfo) {
        Toast.success(`GitHub connection successful! Logged in as: ${userInfo.login}`);
      } else {
        Toast.error('GitHub connection failed. Please check your configuration.');
      }
    } catch (err) {
      Toast.error(`GitHub connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openPullRequest = async (pr) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(pr.html_url);
      }
    } catch {
      // no-op
    }
  };

  const handleRefresh = () => loadPullRequests(false);
  const handleForceRefresh = () => loadPullRequests(true);
  const handleRetry = () => loadPullRequests(false);

  // Get filtered pull requests
  const filteredPRs = getFilteredPRs(pullRequests, searchQuery, filter);

  if (loading) {
    return <GitHubLoading />;
  }

  if (error) {
    return <GitHubError error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="p-8">
      <GitHubHeader />
      <GitHubStats stats={stats} />
      <GitHubFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onRefresh={handleRefresh}
        onForceRefresh={handleForceRefresh}
        onTestConnection={testGitHubConnection}
      />
      <GitHubPRList
        pullRequests={filteredPRs}
        searchQuery={searchQuery}
        filter={filter}
        onPRClick={openPullRequest}
      />
    </div>
  );
};

export default GitHub;
