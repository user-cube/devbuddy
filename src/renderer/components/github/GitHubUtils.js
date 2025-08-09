export const getStatusText = (pr) => {
  if (pr.draft) return 'Draft';
  if (pr.merged_at) return 'Merged';
  if (pr.state === 'closed') return 'Closed';
  return 'Open';
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

export const calculateStats = (pullRequests) => {
  return {
    total: pullRequests.length,
    assigned: pullRequests.filter(pr => pr.assignees?.length > 0).length,
    reviewing: pullRequests.filter(pr => pr.requested_reviewers?.length > 0).length,
    draft: pullRequests.filter(pr => pr.draft).length,
    reviewRequested: pullRequests.filter(pr => pr.requested_reviewers?.length > 0).length
  };
};

export const getFilteredPRs = (pullRequests, searchQuery, filter) => {
  let filtered = pullRequests;

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(pr =>
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.repository?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.user?.login?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply status filter
  switch (filter) {
  case 'assigned':
    filtered = filtered.filter(pr => pr.assignees?.length > 0);
    break;
  case 'reviewing':
    filtered = filtered.filter(pr => pr.requested_reviewers?.length > 0);
    break;
  case 'review-requested':
    filtered = filtered.filter(pr => pr.requested_reviewers?.length > 0);
    break;
  case 'draft':
    filtered = filtered.filter(pr => pr.draft);
    break;
  default:
    break;
  }

  return filtered;
};
