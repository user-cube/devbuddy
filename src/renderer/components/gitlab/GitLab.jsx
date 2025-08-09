import React, { useState, useEffect } from 'react';
import GitLabHeader from './GitLabHeader';
import GitLabStats from './GitLabStats';
import GitLabFilters from './GitLabFilters';
import GitLabMRCard from './GitLabMRCard';
import GitLabLoading from './GitLabLoading';
import GitLabError from './GitLabError';
import GitLabEmpty from './GitLabEmpty';
import { calculateStats, filterMergeRequests } from './GitLabUtils';
import { Toast } from '../../hooks/useToast';

const GitLab = () => {
  const [mergeRequests, setMergeRequests] = useState([]);
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
    loadMergeRequests();
  }, []);

  const loadMergeRequests = async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache if force reload is requested
      if (forceReload) {
        try {
          await window.electronAPI.clearGitlabCache();
        } catch {
          // no-op
        }
      }

      const mrs = await window.electronAPI.getGitlabMRs();
      setMergeRequests(mrs);
      setStats(calculateStats(mrs));
    } catch (err) {
      // no-op
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGitLabConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = await window.electronAPI.getGitlabUserInfo();

      if (userInfo) {
        Toast.success(`GitLab connection successful! Logged in as: ${userInfo.username}`);
      } else {
        Toast.error('GitLab connection failed. Please check your configuration.');
      }
    } catch (err) {
      // no-op
      Toast.error(`GitLab connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openMergeRequest = async (mr) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.openExternal(mr.web_url);
      }
    } catch {
      // no-op
    }
  };

  const getFilteredMRs = () => {
    return filterMergeRequests(mergeRequests, searchQuery, filter);
  };

  if (loading) {
    return <GitLabLoading />;
  }

  if (error) {
    return <GitLabError error={error} onRetry={() => loadMergeRequests(false)} />;
  }

  const filteredMRs = getFilteredMRs();

  return (
    <div className="p-8">
      <GitLabHeader />
      <GitLabStats stats={stats} />
      <GitLabFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onRefresh={() => loadMergeRequests(false)}
        onForceRefresh={() => loadMergeRequests(true)}
        onTestConnection={testGitLabConnection}
      />

      {/* Merge Requests List */}
      <div className="space-y-4">
        {filteredMRs.length === 0 ? (
          <GitLabEmpty searchQuery={searchQuery} filter={filter} />
        ) : (
          filteredMRs.map((mr) => (
            <GitLabMRCard
              key={mr.id}
              mr={mr}
              onClick={openMergeRequest}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GitLab;
