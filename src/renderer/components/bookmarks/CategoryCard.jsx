import React from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import BookmarkCard from './BookmarkCard'

const CategoryCard = ({ 
  category, 
  isExpanded, 
  searchQuery,
  onToggle, 
  onAddBookmark, 
  onEditCategory, 
  onDeleteCategory,
  onOpenBookmark,
  onEditBookmark,
  onDeleteBookmark
}) => {
  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)'
      }}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(category.id)}
            className="p-1 rounded transition-colors hover:bg-black/10"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
          <i 
            className={`fas fa-${category.icon || 'folder'} text-lg`}
            style={{ color: category.color || '#6b7280' }}
          ></i>
          <h3 className="text-lg font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
            {category.name}
          </h3>
          <span className="text-sm px-3 py-1 rounded-full" style={{
            backgroundColor: 'rgba(107, 114, 128, 0.2)',
            color: 'var(--text-muted)'
          }}>
            {category.bookmarks?.length || 0} bookmarks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddBookmark(category.id)}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)'
            }}
            title="Add bookmark"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent-primary)'
            }}
            title="Edit category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)'
            }}
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Content */}
      {isExpanded && (
        <div className="px-4 pb-6">
          {category.bookmarks?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.bookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  categoryId={category.id}
                  searchQuery={searchQuery}
                  onOpen={onOpenBookmark}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No bookmarks in this category
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CategoryCard
