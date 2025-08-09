// Helper functions for Home component

import React from 'react';
import {
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  GitBranch,
  GitPullRequest,
  GitMerge,
  Folder
} from 'lucide-react';

export const getStatusIcon = (item, type) => {
  if (type === 'jira') {
    const status = item.fields?.status?.name?.toLowerCase();
    if (status?.includes('done') || status?.includes('closed')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status?.includes('in progress')) return <ClockIcon className="w-4 h-4 text-blue-500" />;
    if (status?.includes('blocked')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <GitBranch className="w-4 h-4 text-gray-500" />;
  } else if (type === 'github') {
    if (item.draft) return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    if (item.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <GitPullRequest className="w-4 h-4 text-blue-500" />;
  } else if (type === 'gitlab') {
    if (item.work_in_progress) return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    if (item.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <GitMerge className="w-4 h-4 text-orange-500" />;
  } else if (type === 'bitbucket') {
    if (item.title?.toLowerCase().includes('[wip]') || item.title?.toLowerCase().includes('[draft]')) {
      return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    }
    if (item.state === 'MERGED') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <GitPullRequest className="w-4 h-4 text-blue-500" />;
  } else if (type === 'repositories') {
    return <Folder className="w-4 h-4 text-purple-500" />;
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  return date.toLocaleDateString();
};

export const calculateTotalStats = (stats) => {
  return {
    totalItems: stats.jira.total + stats.github.total + stats.gitlab.total + stats.bitbucket.total,
    totalAssigned: stats.jira.assigned + stats.github.assigned + stats.gitlab.assigned + stats.bitbucket.assigned,
    totalReviewing: stats.github.reviewing + stats.gitlab.reviewing + stats.bitbucket.reviewing,
    totalHighPriority: stats.jira.highPriority,
    totalRepositories: stats.repositories.total
  };
};

export const getIntegrationStatus = (integration, activeIntegrations, stats) => {
  if (!activeIntegrations[integration]) {
    return { status: 'disabled', icon: 'WifiOff', color: 'var(--text-muted)' };
  }

  const hasData = stats[integration]?.total > 0;
  return {
    status: hasData ? 'active' : 'no-data',
    icon: hasData ? 'Wifi' : 'AlertCircle',
    color: hasData ? 'var(--success)' : 'var(--warning)'
  };
};
