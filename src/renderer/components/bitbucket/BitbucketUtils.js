// Format Bitbucket pull requests for UI display
export const formatBitbucketPRs = (prs) => {
  if (!Array.isArray(prs)) {
    return [];
  }

  return prs.map(pr => ({
    id: pr.id,
    title: pr.title,
    description: pr.description || '',
    state: pr.state,
    url: pr.links?.html?.href || '',
    created_at: pr.created_on,
    updated_at: pr.updated_on,
    author: {
      username: pr.author?.username || '',
      display_name: pr.author?.display_name || '',
      avatar_url: pr.author?.links?.avatar?.href || ''
    },
    source: {
      branch: pr.source?.branch?.name || '',
      repository: pr.source?.repository?.full_name || ''
    },
    destination: {
      branch: pr.destination?.branch?.name || '',
      repository: pr.destination?.repository?.full_name || ''
    },
    reviewers: pr.reviewers || [],
    participants: pr.participants || [],
    comment_count: pr.comment_count || 0,
    task_count: pr.task_count || 0,
    is_draft: pr.title?.toLowerCase().includes('[wip]') ||
              pr.title?.toLowerCase().includes('[draft]') ||
              false
  }));
};

// Get status color for PR state
export const getPRStatusColor = (state) => {
  switch (state?.toUpperCase()) {
  case 'OPEN':
    return 'text-green-500';
  case 'CLOSED':
    return 'text-red-500';
  case 'MERGED':
    return 'text-purple-500';
  case 'DECLINED':
    return 'text-gray-500';
  default:
    return 'text-gray-400';
  }
};

// Get status icon for PR state
export const getPRStatusIcon = (state) => {
  switch (state?.toUpperCase()) {
  case 'OPEN':
    return '🔵';
  case 'CLOSED':
    return '🔴';
  case 'MERGED':
    return '🟣';
  case 'DECLINED':
    return '⚫';
  default:
    return '⚪';
  }
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return 'Unknown date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  } catch {
    // no-op
    return 'Invalid date';
  }
};

// Get reviewer status
export const getReviewerStatus = (reviewers, _participants) => {
  if (!reviewers || !Array.isArray(reviewers) || reviewers.length === 0) {
    return { status: 'no-reviewers', count: 0, approved: 0 };
  }

  try {
    const approved = reviewers.filter(r => r && r.approved).length;
    const total = reviewers.length;

    if (approved === total) {
      return { status: 'approved', count: total, approved };
    } else if (approved > 0) {
      return { status: 'partially-approved', count: total, approved };
    } else {
      return { status: 'pending', count: total, approved };
    }
  } catch {
    // no-op
    return { status: 'error', count: 0, approved: 0 };
  }
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get repository name from full name
export const getRepoName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.split('/');
  return parts[parts.length - 1] || fullName;
};

// Get workspace name from full name
export const getWorkspaceName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.split('/');
  return parts[0] || fullName;
};

// Calculate stats for Bitbucket pull requests
export const calculateStats = (prs) => {
  if (!Array.isArray(prs)) {
    return {
      total: 0,
      assigned: 0,
      reviewing: 0,
      draft: 0,
      reviewRequested: 0
    };
  }

  return {
    total: prs.length,
    assigned: prs.filter(pr => pr.reviewers?.length > 0).length,
    reviewing: prs.filter(pr => pr.reviewers?.length > 0).length,
    draft: prs.filter(pr => pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft) || pr.title?.toLowerCase().includes('[wip]') || pr.title?.toLowerCase().includes('[draft]')).length,
    reviewRequested: prs.filter(pr => pr.reviewers?.length > 0).length
  };
};

// Filter pull requests based on search query and filter
export const getFilteredPRs = (prs, searchQuery, filter) => {
  if (!Array.isArray(prs)) {
    return [];
  }

  let filtered = prs;

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(pr =>
      (typeof pr.title === 'string' ? pr.title : pr.title?.name || '').toLowerCase().includes(query) ||
      (typeof pr.source?.branch === 'string' ? pr.source.branch : pr.source?.branch?.name || '').toLowerCase().includes(query) ||
      (typeof pr.author === 'string' ? pr.author : pr.author?.display_name || pr.author?.username || pr.author?.name || '').toLowerCase().includes(query)
    );
  }

  // Apply status filter
  switch (filter) {
  case 'assigned':
    filtered = filtered.filter(pr => pr.reviewers?.length > 0);
    break;
  case 'reviewing':
    filtered = filtered.filter(pr => pr.reviewers?.length > 0);
    break;
  case 'review-requested':
    filtered = filtered.filter(pr => pr.reviewers?.length > 0);
    break;
  case 'draft':
    filtered = filtered.filter(pr => pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft) || (typeof pr.title === 'string' ? pr.title : pr.title?.name || '').toLowerCase().includes('[wip]') || (typeof pr.title === 'string' ? pr.title : pr.title?.name || '').toLowerCase().includes('[draft]'));
    break;
  default:
    break;
  }

  return filtered;
};

export const getStatusText = (pr) => {
  if (pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft)) return 'Draft';
  if (pr.state === 'MERGED' || (typeof pr.state === 'object' && pr.state?.name === 'MERGED')) return 'Merged';
  if (pr.state === 'CLOSED' || (typeof pr.state === 'object' && pr.state?.name === 'CLOSED')) return 'Closed';
  return 'Open';
};

export const getStatusColor = (pr) => {
  if (pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft)) return 'var(--warning)';
  if (pr.state === 'MERGED' || (typeof pr.state === 'object' && pr.state?.name === 'MERGED')) return 'var(--success)';
  if (pr.state === 'CLOSED' || (typeof pr.state === 'object' && pr.state?.name === 'CLOSED')) return 'var(--error)';
  return 'var(--accent-primary)';
};

export const getStatusBackground = (pr) => {
  if (pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft)) return 'rgba(245, 158, 11, 0.1)';
  if (pr.state === 'MERGED' || (typeof pr.state === 'object' && pr.state?.name === 'MERGED')) return 'rgba(16, 185, 129, 0.1)';
  if (pr.state === 'CLOSED' || (typeof pr.state === 'object' && pr.state?.name === 'CLOSED')) return 'rgba(239, 68, 68, 0.1)';
  return 'rgba(245, 101, 101, 0.1)';
};

export const getStatusBorder = (pr) => {
  if (pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft)) return '1px solid rgba(245, 158, 11, 0.3)';
  if (pr.state === 'MERGED' || (typeof pr.state === 'object' && pr.state?.name === 'MERGED')) return '1px solid rgba(16, 185, 129, 0.3)';
  if (pr.state === 'CLOSED' || (typeof pr.state === 'object' && pr.state?.name === 'CLOSED')) return '1px solid rgba(239, 68, 68, 0.3)';
  return '1px solid rgba(245, 101, 101, 0.3)';
};
