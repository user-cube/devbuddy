import React, { useState, useEffect } from 'react'
import { Bookmark, FolderPlus, Search, X } from 'lucide-react'
import Toast from '../layout/Toast'
import BookmarkSearch from './BookmarkSearch'
import CategoryCard from './CategoryCard'
import CategoryModal from './CategoryModal'
import BookmarkModal from './BookmarkModal'
import { filterBookmarks } from './BookmarkUtils'

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState({ categories: [] })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingBookmark, setEditingBookmark] = useState(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddBookmark, setShowAddBookmark] = useState(null) // categoryId
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = React.useRef(null)

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      setLoading(true)
      if (window.electronAPI) {
        const data = await window.electronAPI.getBookmarks()
        setBookmarks(data)
        // Start with all categories collapsed
        setExpandedCategories(new Set())
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

  const filteredBookmarks = filterBookmarks(bookmarks.categories || [], searchQuery)

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const categoriesWithResults = filteredBookmarks.map(cat => cat.id)
      setExpandedCategories(new Set(categoriesWithResults))
    } else {
      // Keep categories collapsed when search is cleared
      setExpandedCategories(new Set())
    }
  }, [searchQuery, filteredBookmarks])

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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

            {/* Search Bar */}
            <BookmarkSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchInputRef={searchInputRef}
              filteredBookmarks={filteredBookmarks}
            />

            {/* Categories */}
            <div className="space-y-6">
              {filteredBookmarks.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategories.has(category.id)}
                  searchQuery={searchQuery}
                  onToggle={toggleCategory}
                  onAddBookmark={setShowAddBookmark}
                  onEditCategory={setEditingCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onOpenBookmark={handleOpenBookmark}
                  onEditBookmark={setEditingBookmark}
                  onDeleteBookmark={handleDeleteBookmark}
                />
              ))}

              {searchQuery && filteredBookmarks.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    No Results Found
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    No bookmarks match your search for "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <X className="w-4 h-4" />
                    Clear Search
                  </button>
                </div>
              )}

              {(!bookmarks.categories || bookmarks.categories.length === 0) && !searchQuery && (
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
            <div className="flex justify-end">
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

export default Bookmarks 