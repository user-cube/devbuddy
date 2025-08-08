import React from 'react'
import { Search, X } from 'lucide-react'

const BookmarkSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  searchInputRef, 
  filteredBookmarks 
}) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search bookmarks by name, description, URL, or file path... (Ctrl+K)"
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
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-black/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Found {filteredBookmarks.reduce((total, cat) => total + (cat.bookmarks?.length || 0), 0)} bookmarks matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}

export default BookmarkSearch
