import React, { useState, useEffect } from 'react';

import JiraHeader from './JiraHeader';
import JiraStats from './JiraStats';
import JiraFilters from './JiraFilters';
import JiraIssueCard from './JiraIssueCard';
import JiraLoading from './JiraLoading';
import JiraError from './JiraError';
import JiraEmpty from './JiraEmpty';
import { calculateStats, filterIssues } from './JiraUtils';
import { Toast } from '../../hooks/useToast';

const Jira = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, assigned, reported, priority
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    reported: 0,
    highPriority: 0,
    inProgress: 0
  });

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache if force reload is requested
      if (forceReload) {
        try {
          await window.electronAPI.clearJiraCache();
        } catch {
          // no-op
        }
      }

      const jiraIssues = await window.electronAPI.getJiraIssues();
      setIssues(jiraIssues);
      setStats(calculateStats(jiraIssues));
    } catch (err) {
      // no-op
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testJiraConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const userInfo = await window.electronAPI.getJiraUserInfo();

      if (userInfo) {
        Toast.success(`Jira connection successful! Logged in as: ${userInfo.displayName}`);
      } else {
        Toast.error('Jira connection failed. Please check your configuration.');
      }
    } catch (err) {
      // no-op
      Toast.error(`Jira connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openIssue = async (issue) => {
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getJiraConfig();
        const issueUrl = `${config.baseUrl}/browse/${issue.key}`;
        await window.electronAPI.openExternal(issueUrl);
      }
    } catch {
      // no-op
    }
  };

  const getFilteredIssues = () => {
    return filterIssues(issues, searchQuery, filter);
  };

  if (loading) {
    return <JiraLoading />;
  }

  if (error) {
    return <JiraError error={error} onRetry={() => loadIssues(false)} />;
  }

  const filteredIssues = getFilteredIssues();

  return (
    <div className="p-8">
      <JiraHeader />
      <JiraStats stats={stats} />
      <JiraFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onRefresh={() => loadIssues(false)}
        onForceRefresh={() => loadIssues(true)}
        onTestConnection={testJiraConnection}
      />

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <JiraEmpty searchQuery={searchQuery} filter={filter} />
        ) : (
          filteredIssues.map((issue) => (
            <JiraIssueCard
              key={issue.id}
              issue={issue}
              onClick={openIssue}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Jira;
