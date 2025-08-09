// Helper functions for GitLab component

export const calculateStats = (mergeRequests) => {
  return {
    total: mergeRequests.length,
    assigned: mergeRequests.filter(mr => mr.assignees?.length > 0).length,
    reviewing: mergeRequests.filter(mr => mr.reviewers?.length > 0).length,
    draft: mergeRequests.filter(mr => mr.work_in_progress).length,
    reviewRequested: mergeRequests.filter(mr => mr.reviewers?.length > 0).length
  };
};

export const filterMergeRequests = (mergeRequests, searchQuery, filter) => {
  let filtered = mergeRequests;

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(mr =>
      mr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mr.source_branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mr.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter
  switch (filter) {
  case 'assigned':
    filtered = filtered.filter(mr => mr.assignees?.length > 0);
    break;
  case 'reviewing':
    filtered = filtered.filter(mr => mr.reviewers?.length > 0);
    break;
  case 'review-requested':
    filtered = filtered.filter(mr => mr.reviewers?.length > 0);
    break;
  case 'draft':
    filtered = filtered.filter(mr => mr.work_in_progress);
    break;
  default:
    break;
  }

  return filtered;
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

export const getStatusIcon = (mr) => {
  if (mr.work_in_progress) return 'clock';
  if (mr.merged_at) return 'check-circle';
  if (mr.state === 'closed') return 'x-circle';
  return 'git-merge';
};

export const getStatusText = (mr) => {
  if (mr.work_in_progress) return 'Draft';
  if (mr.merged_at) return 'Merged';
  if (mr.state === 'closed') return 'Closed';
  return 'Open';
};

export const getStatusColor = (mr) => {
  if (mr.work_in_progress) return 'var(--warning)';
  if (mr.merged_at) return 'var(--success)';
  if (mr.state === 'closed') return 'var(--error)';
  return 'var(--accent-primary)';
};

export const getStatusBackground = (mr) => {
  if (mr.work_in_progress) return 'rgba(245, 158, 11, 0.1)';
  if (mr.merged_at) return 'rgba(16, 185, 129, 0.1)';
  if (mr.state === 'closed') return 'rgba(239, 68, 68, 0.1)';
  return 'rgba(245, 101, 101, 0.1)';
};

export const getStatusBorder = (mr) => {
  if (mr.work_in_progress) return '1px solid rgba(245, 158, 11, 0.3)';
  if (mr.merged_at) return '1px solid rgba(16, 185, 129, 0.3)';
  if (mr.state === 'closed') return '1px solid rgba(239, 68, 68, 0.3)';
  return '1px solid rgba(245, 101, 101, 0.3)';
};
