import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, FolderPlus, X } from 'lucide-react';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskStats from './TaskStats';
import CategoryModal from './CategoryModal';
import Loading from '../layout/Loading';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, completed
    priority: 'all',
    category: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadTasks();
    loadStats();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await window.electronAPI.getTasks();
      setTasks(tasksData);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await window.electronAPI.getTaskStats();
      setStats(statsData);
    } catch {
      // no-op
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await window.electronAPI.getTaskCategoryDetails();
      setCategories(categoriesData);
    } catch {
      // no-op
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await window.electronAPI.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      await loadStats();
      setShowTaskModal(false);
    } catch {
      // no-op
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const updatedTask = await window.electronAPI.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      await loadStats();
      setShowTaskModal(false);
      setEditingTask(null);
    } catch {
      // no-op
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      await window.electronAPI.createTaskCategory(categoryData);
      await loadTasks(); // Reload tasks to get updated categories
      setShowCategoryModal(false);
    } catch {
      // no-op
    }
  };

  const handleUpdateCategory = async (id, updates) => {
    try {
      await window.electronAPI.updateTaskCategory(id, updates);
      await loadTasks(); // Reload tasks to get updated categories
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch {
      // no-op
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await window.electronAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      await loadStats();
    } catch {
      // no-op
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const updatedTask = await window.electronAPI.toggleTaskComplete(id);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      await loadStats();
    } catch {
      // no-op
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filters.status === 'pending' && task.completed) return false;
    if (filters.status === 'completed' && !task.completed) return false;

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

    // Category filter
    if (filters.category !== 'all' && task.category !== filters.category) return false;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description.toLowerCase().includes(searchLower);
      const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesTitle && !matchesDescription && !matchesTags) return false;
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by completion status first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date (tasks with due dates first, then by date)
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    // Finally by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) {
    return <Loading message="Loading tasks..." />;
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="p-6 border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Tasks
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage your TODO tasks and stay organized
            </p>

            {/* Category Filter Indicator */}
            {filters.category !== 'all' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Filtered by:
                </span>
                {(() => {
                  const currentCategory = categories.find(cat => cat.id === filters.category);
                  if (currentCategory) {
                    return (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: currentCategory.color,
                          color: 'white'
                        }}
                      >
                        <span className="text-sm">{currentCategory.icon}</span>
                        {currentCategory.name}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                          className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border font-medium transition-colors"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <FolderPlus className="w-4 h-4" />
              New Category
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <TaskStats stats={stats} />
      </div>

      {/* Filters */}
      <div className="px-6 pb-4">
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          tasks={tasks}
        />
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {filters.status === 'completed' ? 'No completed tasks' : 'No tasks found'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {filters.status === 'completed'
                ? 'Complete some tasks to see them here'
                : filters.search || filters.category !== 'all' || filters.priority !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'
              }
            </p>
            {!filters.search && filters.category === 'all' && filters.priority === 'all' && filters.status === 'all' && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white'
                }}
              >
                <Plus className="w-4 h-4" />
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onSave={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={handleCloseModal}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default Tasks;
