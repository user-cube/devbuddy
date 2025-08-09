import React, { useState } from 'react';
import { Save } from 'lucide-react';
import IconSelector from '../common/IconSelector';
import { Toast } from '../../hooks/useToast';

const BookmarkModal = ({ _categoryId, bookmark, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: bookmark?.name || '',
    url: bookmark?.url || '',
    filePath: bookmark?.filePath || '',
    icon: bookmark?.icon || 'bookmark',
    description: bookmark?.description || ''
  });
  const [bookmarkType, setBookmarkType] = useState(bookmark?.filePath ? 'file' : 'url');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (bookmarkType === 'url' && formData.url.trim()) {
        onSave({ ...formData, filePath: '' });
      } else if (bookmarkType === 'file' && formData.filePath.trim()) {
        onSave({ ...formData, url: '' });
      } else {
        // Show error message
        Toast.error(bookmarkType === 'url' ? 'Please enter a valid URL' : 'Please select a file');
      }
    } else {
      Toast.error('Please enter a name for the bookmark');
    }
  };

  const handleSelectFile = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.selectFile();
        if (result.success) {
          setFormData({
            ...formData,
            filePath: result.filePath,
            url: '', // Clear URL when file is selected
            name: formData.name || result.fileName
          });
        }
      }
    } catch {
      // no-op
    }
  };

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
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBookmarkType('url')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  bookmarkType === 'url'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                🌐 URL
              </button>
              <button
                type="button"
                onClick={() => setBookmarkType('file')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  bookmarkType === 'file'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                📁 File
              </button>
            </div>
            <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)'
            }}>
              {bookmarkType === 'url'
                ? '🌐 URLs will open in your default browser'
                : '📁 Files will open with their default system application'
              }
            </p>
          </div>

          {bookmarkType === 'url' ? (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value, filePath: '' })}
                className="w-full rounded-lg px-3 py-2"
                placeholder="https://example.com"
                required={bookmarkType === 'url'}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                File
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.filePath}
                  onChange={(e) => setFormData({ ...formData, filePath: e.target.value, url: '' })}
                  className="flex-1 rounded-lg px-3 py-2"
                  placeholder="Click Browse to select a file..."
                  readOnly
                  required={bookmarkType === 'file'}
                />
                <button
                  type="button"
                  onClick={handleSelectFile}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  📁 Browse
                </button>
              </div>
            </div>
          )}
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
  );
};

export default BookmarkModal;
