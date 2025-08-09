import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Filter } from 'lucide-react';

const JiraFilters = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  onForceRefresh,
  onTestConnection
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <option value="all">All Issues</option>
        <option value="assigned">Assigned to me</option>
        <option value="reported">Reported by me</option>
        <option value="high-priority">High Priority</option>
        <option value="in-progress">In Progress</option>
      </select>

      <button
        onClick={onForceRefresh}
        className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--error)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
        title="Force reload (clear cache)"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="ml-1 text-xs">Force</span>
      </button>

      <button
        onClick={onTestConnection}
        className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--success)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Test Connection
      </button>

      <button
        onClick={() => navigate('/config?showJiraStatus=true')}
        className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
        style={{
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: 'var(--accent-primary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.3)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
        title="Configure status filters"
      >
        <Filter className="w-4 h-4" />
        Status Filters
      </button>
    </div>
  );
};

export default JiraFilters;
