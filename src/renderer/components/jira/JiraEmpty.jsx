import React from 'react';
import { GitBranch } from 'lucide-react';

const JiraEmpty = ({ searchQuery, filter }) => {
  return (
    <div className="text-center py-12">
      <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {searchQuery || filter !== 'all' ? 'No matching issues' : 'No issues found'}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {searchQuery || filter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Issues assigned to you will appear here'
        }
      </p>
    </div>
  );
};

export default JiraEmpty;
