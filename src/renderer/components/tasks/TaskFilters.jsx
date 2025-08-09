import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

const TaskFilters = ({ filters, onFiltersChange, tasks }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);

  useEffect(() => {
    loadOptions();
  }, [tasks]);

  const loadOptions = async () => {
    try {
      const [categoriesData, prioritiesData] = await Promise.all([
        window.electronAPI.getTaskCategoryDetails(),
        window.electronAPI.getTaskPriorities()
      ]);
      setCategories(categoriesData);
      setPriorities(prioritiesData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      category: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.category !== 'all' || 
                          filters.search;

  const getFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'var(--accent-primary)'
          }}
        />
      </div>

      {/* Filter Toggle and Clear */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-opacity-20"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              {getFilterCount()}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors hover:bg-opacity-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div 
          className="p-4 rounded-lg border space-y-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Status
            </label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' }
              ].map(status => (
                <button
                  key={status.value}
                  onClick={() => handleFilterChange('status', status.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status === status.value
                      ? 'text-white'
                      : 'hover:bg-opacity-20'
                  }`}
                  style={{
                    backgroundColor: filters.status === status.value 
                      ? 'var(--accent-primary)' 
                      : 'transparent',
                    color: filters.status === status.value 
                      ? 'white' 
                      : 'var(--text-primary)',
                    border: filters.status === status.value 
                      ? 'none' 
                      : '1px solid var(--border-primary)'
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Priority
            </label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
                { value: 'high', label: 'High', color: 'text-orange-500' },
                { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
                { value: 'low', label: 'Low', color: 'text-green-500' }
              ].map(priority => (
                <button
                  key={priority.value}
                  onClick={() => handleFilterChange('priority', priority.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.priority === priority.value
                      ? 'text-white'
                      : priority.color || 'hover:bg-opacity-20'
                  }`}
                  style={{
                    backgroundColor: filters.priority === priority.value 
                      ? 'var(--accent-primary)' 
                      : 'transparent',
                    color: filters.priority === priority.value 
                      ? 'white' 
                      : 'var(--text-primary)',
                    border: filters.priority === priority.value 
                      ? 'none' 
                      : '1px solid var(--border-primary)'
                  }}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.category === 'all'
                    ? 'text-white'
                    : 'hover:bg-opacity-20'
                }`}
                style={{
                  backgroundColor: filters.category === 'all' 
                    ? 'var(--accent-primary)' 
                    : 'transparent',
                  color: filters.category === 'all' 
                    ? 'white' 
                    : 'var(--text-primary)',
                  border: filters.category === 'all' 
                    ? 'none' 
                    : '1px solid var(--border-primary)'
                }}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange('category', category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.category === category.id
                      ? 'text-white'
                      : 'hover:bg-opacity-20'
                  }`}
                  style={{
                    backgroundColor: filters.category === category.id 
                      ? category.color
                      : 'transparent',
                    color: filters.category === category.id 
                      ? 'white' 
                      : 'var(--text-primary)',
                    border: filters.category === category.id 
                      ? 'none' 
                      : `1px solid ${category.color}`
                  }}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
