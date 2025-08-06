import React, { useState, useEffect } from 'react'
import { 
  Bookmark, 
  Plus, 
  Edit, 
  Trash2, 
  FolderPlus,
  ExternalLink,
  Save,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import Toast from '../layout/Toast'
import IconSelector from '../common/IconSelector'

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState({ categories: [] })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddBookmark, setShowAddBookmark] = useState(null) // categoryId

  const truncateText = (text, maxLength = 60) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    
    // For URLs, try to keep the domain part
    if (text.startsWith('http')) {
      try {
        const url = new URL(text)
        const domain = url.hostname
        const path = url.pathname
        
        if (domain.length + path.length <= maxLength) {
          return `${domain}${path}`
        } else if (domain.length <= maxLength - 3) {
          return `${domain}...`
        } else {
          return `${domain.substring(0, maxLength - 3)}...`
        }
      } catch {
        // If URL parsing fails, just truncate normally
        return text.substring(0, maxLength - 3) + '...'
      }
    }
    
    return text.substring(0, maxLength - 3) + '...'
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      setLoading(true)
      if (window.electronAPI) {
        const data = await window.electronAPI.getBookmarks()
        setBookmarks(data)
        // Expand all categories by default
        const expanded = new Set(data.categories?.map(cat => cat.id) || [])
        setExpandedCategories(expanded)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      setMessage({ type: 'error', text: 'Error loading bookmarks' })
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleOpenBookmark = async (bookmarkId) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.openBookmark(bookmarkId)
        if (result.success) {
          setMessage({ type: 'success', text: result.message })
        } else {
          setMessage({ type: 'error', text: result.message })
        }
      }
    } catch (error) {
      console.error('Error opening bookmark:', error)
      setMessage({ type: 'error', text: 'Error opening bookmark' })
    }
  }

  const handleAddCategory = async (categoryData) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.addBookmarkCategory(categoryData)
        setMessage({ type: 'success', text: 'Category added successfully!' })
        await loadBookmarks()
        setShowAddCategory(false)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      setMessage({ type: 'error', text: 'Error adding category' })
    }
  }

  const handleUpdateCategory = async (categoryId, updatedData) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.updateBookmarkCategory(categoryId, updatedData)
        setMessage({ type: 'success', text: 'Category updated successfully!' })
        await loadBookmarks()
        setEditingCategory(null)
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setMessage({ type: 'error', text: 'Error updating category' })
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All bookmarks in this category will also be deleted.')) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.deleteBookmarkCategory(categoryId)
          setMessage({ type: 'success', text: 'Category deleted successfully!' })
          await loadBookmarks()
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        setMessage({ type: 'error', text: 'Error deleting category' })
      }
    }
  }

  const handleAddBookmark = async (categoryId, bookmarkData) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.addBookmark(categoryId, bookmarkData)
        setMessage({ type: 'success', text: 'Bookmark added successfully!' })
        await loadBookmarks()
        setShowAddBookmark(null)
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
      setMessage({ type: 'error', text: 'Error adding bookmark' })
    }
  }

  const handleUpdateBookmark = async (categoryId, bookmarkId, updatedData) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.updateBookmark(categoryId, bookmarkId, updatedData)
        setMessage({ type: 'success', text: 'Bookmark updated successfully!' })
        await loadBookmarks()
        setEditingBookmark(null)
      }
    } catch (error) {
      console.error('Error updating bookmark:', error)
      setMessage({ type: 'error', text: 'Error updating bookmark' })
    }
  }

  const handleDeleteBookmark = async (categoryId, bookmarkId) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.deleteBookmark(categoryId, bookmarkId)
          setMessage({ type: 'success', text: 'Bookmark deleted successfully!' })
          await loadBookmarks()
        }
      } catch (error) {
        console.error('Error deleting bookmark:', error)
        setMessage({ type: 'error', text: 'Error deleting bookmark' })
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading bookmarks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Bookmark className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Bookmarks</h1>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {bookmarks.categories?.map((category) => (
                <div
                  key={category.id}
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
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 rounded transition-colors hover:bg-black/10"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        ) : (
                          <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        )}
                      </button>
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color || '#6b7280' }}
                      ></div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {category.name}
                      </h3>
                      <span className="text-sm px-2 py-1 rounded-full" style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.2)',
                        color: 'var(--text-muted)'
                      }}>
                        {category.bookmarks?.length || 0} bookmarks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddBookmark(category.id)}
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
                        onClick={() => setEditingCategory(category)}
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
                        onClick={() => handleDeleteCategory(category.id)}
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
                  {expandedCategories.has(category.id) && (
                    <div className="px-4 pb-4">
                      {category.bookmarks?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.bookmarks.map((bookmark) => (
                            <div
                              key={bookmark.id}
                              className="p-3 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer h-24 flex flex-col justify-between"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)'
                              }}
                              onClick={() => handleOpenBookmark(bookmark.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <span 
                                    className="text-sm font-medium block truncate" 
                                    style={{ color: 'var(--text-primary)' }}
                                    title={bookmark.name}
                                  >
                                    {truncateText(bookmark.name, 25)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingBookmark({ categoryId: category.id, bookmark })
                                    }}
                                    className="p-1 rounded transition-colors hover:bg-black/10"
                                    style={{ color: 'var(--text-muted)' }}
                                    title="Edit bookmark"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteBookmark(category.id, bookmark.id)
                                    }}
                                    className="p-1 rounded transition-colors hover:bg-black/10"
                                    style={{ color: 'var(--text-muted)' }}
                                    title="Delete bookmark"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p 
                                className="text-xs mt-2 truncate" 
                                style={{ color: 'var(--text-secondary)' }}
                                title={bookmark.description || bookmark.url}
                              >
                                {truncateText(bookmark.description || bookmark.url, 50)}
                              </p>
                            </div>
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
              ))}

              {(!bookmarks.categories || bookmarks.categories.length === 0) && (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    No Categories Yet
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Create your first category to start organizing your bookmarks
                  </p>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create First Category
                  </button>
                </div>
              )}
            </div>

            {/* Add Category Modal */}
            {showAddCategory && (
              <CategoryModal
                onSave={handleAddCategory}
                onCancel={() => setShowAddCategory(false)}
              />
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
              <CategoryModal
                category={editingCategory}
                onSave={(data) => handleUpdateCategory(editingCategory.id, data)}
                onCancel={() => setEditingCategory(null)}
              />
            )}

            {/* Add Bookmark Modal */}
            {showAddBookmark && (
              <BookmarkModal
                categoryId={showAddBookmark}
                onSave={(data) => handleAddBookmark(showAddBookmark, data)}
                onCancel={() => setShowAddBookmark(null)}
              />
            )}

            {/* Edit Bookmark Modal */}
            {editingBookmark && (
              <BookmarkModal
                categoryId={editingBookmark.categoryId}
                bookmark={editingBookmark.bookmark}
                onSave={(data) => handleUpdateBookmark(editingBookmark.categoryId, editingBookmark.bookmark.id, data)}
                onCancel={() => setEditingBookmark(null)}
              />
            )}

            {/* Toast Notification */}
            <Toast 
              message={message} 
              onClose={() => setMessage({ type: '', text: '' })}
              duration={4000}
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer - Action Buttons */}
      {(bookmarks.categories?.length > 0 || (!bookmarks.categories || bookmarks.categories.length === 0)) && (
        <div className="flex-shrink-0 p-6" style={{
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-primary)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center">
              <button
                onClick={() => setShowAddCategory(true)}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-lg"
              >
                <FolderPlus className="w-5 h-5" />
                {bookmarks.categories?.length > 0 ? 'Add Category' : 'Create First Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Category Modal Component - Moved outside the main component
const CategoryModal = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    icon: category?.icon || 'folder',
    color: category?.color || '#3b82f6'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave(formData)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        className="rounded-lg p-6 w-full max-w-md mx-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {category ? 'Edit Category' : 'Add Category'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              placeholder="Category name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Icon
            </label>
            <IconSelector
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
              placeholder="Select an icon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                color: 'var(--text-secondary)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2 px-4 py-2"
            >
              <Save className="w-4 h-4" />
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Bookmark Modal Component - Moved outside the main component
const BookmarkModal = ({ categoryId, bookmark, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: bookmark?.name || '',
    url: bookmark?.url || '',
    icon: bookmark?.icon || 'bookmark',
    description: bookmark?.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.url.trim()) {
      onSave(formData)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        className="rounded-lg p-6 w-full max-w-md mx-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              placeholder="Bookmark name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              placeholder="https://example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Icon
            </label>
            <IconSelector
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
              placeholder="Select an icon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg px-3 py-2 resize-none"
              placeholder="Optional description"
              rows="3"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                color: 'var(--text-secondary)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2 px-4 py-2"
            >
              <Save className="w-4 h-4" />
              {bookmark ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Bookmarks 