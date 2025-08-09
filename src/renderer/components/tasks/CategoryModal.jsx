import React, { useState, useEffect } from 'react';
import { X, Palette, Hash } from 'lucide-react';

const CategoryModal = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: '📁'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        color: category.color || '#6B7280',
        icon: category.icon || '📁'
      });
    }
  }, [category]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (field === 'name' && error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter a category name');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await onSave(category.id, formData);
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.message || 'Error saving category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const predefinedIcons = [
    '📋', '📁', '📂', '📝', '📌', '🎯', '⚡', '🔥', '💡', '🚀', 
    '🏠', '💼', '🎓', '🏥', '🛒', '🍽️', '🏃', '🎨', '🎮', '📚'
  ];

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-lg border shadow-xl"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-opacity-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: error ? 'var(--error)' : 'var(--border-primary)',
                color: 'var(--text-primary)',
                '--tw-ring-color': error ? 'var(--error)' : 'var(--accent-primary)'
              }}
              placeholder="Enter category name"
              required
            />
            {error && (
              <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--accent-primary)'
              }}
              placeholder="Enter category description (optional)"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Icon
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 text-center text-lg"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    }}
                    placeholder="📁"
                  />
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {predefinedIcons.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleInputChange('icon', icon)}
                    className={`p-2 rounded text-lg transition-colors ${
                      formData.icon === icon ? 'ring-2' : 'hover:bg-opacity-20'
                    }`}
                    style={{
                      backgroundColor: formData.icon === icon ? 'var(--accent-primary)' : 'transparent',
                      color: formData.icon === icon ? 'white' : 'var(--text-primary)',
                      border: formData.icon === icon ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Color
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full h-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    }}
                  />
                  <Palette className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: color,
                      '--tw-ring-color': 'var(--accent-primary)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{formData.icon}</span>
              <span className="font-medium" style={{ color: formData.color }}>
                {formData.name || 'Category Name'}
              </span>
            </div>
            {formData.description && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {formData.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
