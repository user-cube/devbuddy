// Helper functions for Jira component

import React from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  GitBranch,
  Flag
} from 'lucide-react';

export const getStatusIcon = (issue) => {
  const status = issue.fields?.status?.name?.toLowerCase();

  if (status?.includes('done') || status?.includes('closed')) return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status?.includes('in progress')) return <Clock className="w-4 h-4 text-blue-500" />;
  if (status?.includes('blocked') || status?.includes('stopped')) return <XCircle className="w-4 h-4 text-red-500" />;
  return <GitBranch className="w-4 h-4 text-gray-500" />;
};

export const getPriorityIcon = (priority) => {
  if (!priority) return null;

  const priorityName = priority.name?.toLowerCase();
  if (priorityName?.includes('highest') || priorityName?.includes('critical')) {
    return <Flag className="w-4 h-4 text-red-500" />;
  }
  if (priorityName?.includes('high')) {
    return <Flag className="w-4 h-4 text-orange-500" />;
  }
  if (priorityName?.includes('medium')) {
    return <Flag className="w-4 h-4 text-yellow-500" />;
  }
  return <Flag className="w-4 h-4 text-green-500" />;
};

export const getPriorityColor = (priority) => {
  if (!priority) return 'var(--text-muted)';

  const priorityName = priority.name?.toLowerCase();
  if (priorityName?.includes('highest') || priorityName?.includes('critical')) {
    return 'var(--error)';
  }
  if (priorityName?.includes('high')) {
    return '#f97316'; // orange
  }
  if (priorityName?.includes('medium')) {
    return 'var(--warning)';
  }
  return 'var(--success)';
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

export const calculateStats = (issues) => {
  return {
    total: issues.length,
    assigned: issues.filter(issue => issue.fields?.assignee).length,
    reported: issues.filter(issue => issue.fields?.reporter).length,
    highPriority: issues.filter(issue =>
      issue.fields?.priority?.name === 'High' ||
      issue.fields?.priority?.name === 'Highest'
    ).length,
    inProgress: issues.filter(issue => issue.fields?.status?.name === 'In Progress').length
  };
};

export const filterIssues = (issues, searchQuery, filter) => {
  let filtered = issues;

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(issue =>
      issue.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.fields?.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.fields?.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter
  switch (filter) {
  case 'assigned':
    filtered = filtered.filter(issue => issue.fields?.assignee);
    break;
  case 'reported':
    filtered = filtered.filter(issue => issue.fields?.reporter);
    break;
  case 'high-priority':
    filtered = filtered.filter(issue =>
      issue.fields?.priority?.name === 'High' ||
        issue.fields?.priority?.name === 'Highest'
    );
    break;
  case 'in-progress':
    filtered = filtered.filter(issue => issue.fields?.status?.name === 'In Progress');
    break;
  default:
    break;
  }

  return filtered;
};
