import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Flag, Calendar, Tag, Edit, Trash2, MoreHorizontal, Folder } from 'lucide-react';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState(null);

  useEffect(() => {
    if (task.category && task.category !== 'general') {
      loadCategoryDetails();
    }
  }, [task.category]);

  const loadCategoryDetails = async () => {
    try {
      const categories = await window.electronAPI.getTaskCategoryDetails();
      const category = categories.find(cat => cat.id === task.category);
      if (category) {
        setCategoryDetails(category);
      }
    } catch (error) {
      console.error('Error loading category details:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Medium';
    }
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const isDueToday = () => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate.startsWith(today);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
    setShowMenu(false);
  };

  return (
    <div 
      className={`p-4 rounded-lg border transition-all duration-200 ${
        task.completed 
          ? 'opacity-60' 
          : 'hover:shadow-md'
      }`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className="flex-shrink-0 mt-1 p-1 rounded-full transition-colors hover:bg-opacity-20"
          style={{ color: task.completed ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 
            className={`font-medium mb-1 ${
              task.completed ? 'line-through' : ''
            }`}
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p 
              className={`text-sm mb-2 ${
                task.completed ? 'line-through' : ''
              }`}
              style={{ color: 'var(--text-muted)' }}
            >
              {task.description}
            </p>
          )}

          {/* Category Badge - More Prominent */}
          {task.category && task.category !== 'general' && categoryDetails && (
            <div className="flex items-center gap-1 mb-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: categoryDetails.color,
                  color: 'white',
                  opacity: task.completed ? 0.6 : 1
                }}
              >
                <span className="text-sm">{categoryDetails.icon}</span>
                {categoryDetails.name}
              </span>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    opacity: 0.8
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs">
            {/* Priority */}
            <div className="flex items-center gap-1">
              <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
              <span style={{ color: 'var(--text-muted)' }}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${
                isOverdue() ? 'text-red-500' : isDueToday() ? 'text-orange-500' : ''
              }`}>
                <Calendar className="w-3 h-3" />
                <span className={isOverdue() ? 'font-medium' : ''}>
                  {isOverdue() ? 'Overdue' : formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full transition-colors hover:bg-opacity-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <div 
                className="absolute right-0 top-8 z-20 min-w-32 rounded-lg border shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <button
                  onClick={() => {
                    onEdit(task);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-opacity-20"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-opacity-20"
                  style={{ color: 'var(--error)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
