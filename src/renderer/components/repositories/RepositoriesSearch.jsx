import React from 'react'

const RepositoriesSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  filteredCount, 
  totalCount, 
  searchInputRef 
}) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search repositories by name, path, branch, or remote... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
            focusRingColor: 'var(--accent-primary)'
          }}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--text-muted)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-black/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Found {filteredCount} repository{filteredCount !== 1 ? 'ies' : ''} matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}

export default RepositoriesSearch
