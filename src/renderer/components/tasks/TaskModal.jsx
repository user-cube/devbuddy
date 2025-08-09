import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Hash } from 'lucide-react';
import { Toast } from '../../hooks/useToast';

const TaskModal = ({ task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    loadFormData();
    loadOptions();
  }, [task]);

  const loadFormData = () => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'general',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: '',
        tags: []
      });
    }
  };

  const loadOptions = async () => {
    try {
      const [categoriesData, prioritiesData] = await Promise.all([
        window.electronAPI.getTaskCategoryDetails(),
        window.electronAPI.getTaskPriorities()
      ]);
      setCategories(categoriesData);
      setPriorities(prioritiesData);
    } catch {
      // no-op
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Toast.error('Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null
      };

      if (isEditing) {
        await onSave(task.id, taskData);
      } else {
        await onSave(taskData);
      }
    } catch {
      // no-op
      Toast.error('Error saving task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            {isEditing ? 'Edit Task' : 'New Task'}
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--accent-primary)'
              }}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'var(--accent-primary)'
              }}
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--accent-primary)'
                }}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--accent-primary)'
                }}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--accent-primary)'
                }}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Tags
            </label>
            <div className="space-y-2">
              {/* Add Tag Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                      '--tw-ring-color': 'var(--accent-primary)'
                    }}
                    placeholder="Add a tag"
                  />
                  <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white'
                  }}
                >
                  Add
                </button>
              </div>

              {/* Tags List */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white'
                      }}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
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
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
