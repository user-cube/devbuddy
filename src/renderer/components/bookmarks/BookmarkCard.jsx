import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { getBookmarkIcon, truncateText, createHighlightedText } from './BookmarkUtils'

const BookmarkCard = ({ 
  bookmark, 
  categoryId, 
  searchQuery, 
  onOpen, 
  onEdit, 
  onDelete 
}) => {
  const renderHighlightedText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text
    
    const parts = createHighlightedText(text, searchTerm)
    return parts.map(part => {
      if (part.type === 'highlight') {
        return (
          <span 
            key={part.key} 
            className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
            style={{ backgroundColor: 'rgba(255, 255, 0, 0.3)' }}
          >
            {part.text}
          </span>
        )
      }
      return part.text
    })
  }

  return (
    <div
      className="p-4 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer h-28 flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-primary)'
      }}
      onClick={() => onOpen(bookmark.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <i 
              className={`${getBookmarkIcon(bookmark)} text-sm`}
              style={{ 
                color: bookmark.filePath ? 'var(--success)' : 'var(--accent-primary)'
              }}
            ></i>
            <span 
              className="text-sm font-medium block truncate" 
              style={{ color: 'var(--text-primary)' }}
              title={bookmark.name}
            >
              {searchQuery ? renderHighlightedText(truncateText(bookmark.name, 25), searchQuery) : truncateText(bookmark.name, 25)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit({ categoryId, bookmark })
            }}
            className="p-1.5 rounded transition-colors hover:bg-black/10"
            style={{ color: 'var(--text-muted)' }}
            title="Edit bookmark"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(categoryId, bookmark.id)
            }}
            className="p-1.5 rounded transition-colors hover:bg-black/10"
            style={{ color: 'var(--text-muted)' }}
            title="Delete bookmark"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p 
        className="text-xs mt-2 truncate" 
        style={{ color: 'var(--text-secondary)' }}
        title={bookmark.description || bookmark.url || bookmark.filePath}
      >
        {searchQuery ? renderHighlightedText(truncateText(bookmark.description || bookmark.url || bookmark.filePath, 50), searchQuery) : truncateText(bookmark.description || bookmark.url || bookmark.filePath, 50)}
      </p>
    </div>
  )
}

export default BookmarkCard 