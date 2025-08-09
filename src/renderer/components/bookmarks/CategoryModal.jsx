import React, { useState } from 'react';
import { Save } from 'lucide-react';
import IconSelector from '../common/IconSelector';

const CategoryModal = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    icon: category?.icon || 'folder',
    color: category?.color || '#3b82f6'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
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
  );
};

export default CategoryModal;
