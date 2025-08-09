import React, { useState, useEffect } from 'react';
import BitbucketHeader from './BitbucketHeader';
import BitbucketStats from './BitbucketStats';
import BitbucketFilters from './BitbucketFilters';
import BitbucketPRList from './BitbucketPRList';
import BitbucketLoading from './BitbucketLoading';
import BitbucketError from './BitbucketError';
import { Toast } from '../../hooks/useToast';
import { calculateStats, getFilteredPRs } from './BitbucketUtils';

const Bitbucket = () => {
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
          await window.electronAPI.clearBitbucketCache();
        } catch {
          // no-op
        }
      }

      const prs = await window.electronAPI.getBitbucketPRs();
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

  const testBitbucketConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = await window.electronAPI.testBitbucketConnection();

      if (userInfo) {
        Toast.success(`Bitbucket connection successful! Logged in as: ${userInfo.display_name}`);
      } else {
        Toast.error('Bitbucket connection failed. Please check your configuration.');
      }
    } catch (err) {
      Toast.error(`Bitbucket connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openPullRequest = async (pr) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(pr.links.html.href);
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
    return <BitbucketLoading />;
  }

  if (error) {
    return <BitbucketError error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="p-8">
      <BitbucketHeader />
      <BitbucketStats stats={stats} />
      <BitbucketFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onRefresh={handleRefresh}
        onForceRefresh={handleForceRefresh}
        onTestConnection={testBitbucketConnection}
      />
      <BitbucketPRList
        pullRequests={filteredPRs}
        searchQuery={searchQuery}
        filter={filter}
        onPRClick={openPullRequest}
      />
    </div>
  );
};

export default Bitbucket;
