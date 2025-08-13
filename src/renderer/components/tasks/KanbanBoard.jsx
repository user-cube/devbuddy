import React, { useMemo } from 'react';
import TaskCard from './TaskCard';

const KanbanBoard = ({
  tasks,
  categories,
  groupBy = 'category', // 'category' | 'priority'
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateTask
}) => {
  const priorityColumns = [
    { id: 'urgent', name: 'Urgent', color: '#EF4444' },
    { id: 'high', name: 'High', color: '#F97316' },
    { id: 'medium', name: 'Medium', color: '#F59E0B' },
    { id: 'low', name: 'Low', color: '#10B981' }
  ];

  const columns = useMemo(() => {
    if (groupBy === 'priority') {
      return priorityColumns.map(col => ({
        id: col.id,
        name: col.name,
        color: col.color,
        icon: null
      }));
    }

    // groupBy category
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon
    }));
  }, [groupBy, categories]);

  const tasksByColumn = useMemo(() => {
    const map = new Map();
    columns.forEach(col => map.set(col.id, []));

    tasks.forEach(task => {
      const key = groupBy === 'priority' ? task.priority : task.category;
      if (map.has(key)) {
        map.get(key).push(task);
      } else if (columns.length > 0) {
        // Fallback: put in first column if key not found
        map.get(columns[0].id).push(task);
      }
    });

    // Sort inside each column: pending first, then due date asc, then created desc
    columns.forEach(col => {
      const list = map.get(col.id) || [];
      list.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) {
          const diff = new Date(a.dueDate) - new Date(b.dueDate);
          if (diff !== 0) return diff;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    return map;
  }, [tasks, columns, groupBy]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex-1 min-w-[260px] max-w-[420px] bg-opacity-40 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          {/* Column Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              {column.icon && <span className="text-lg" aria-hidden>{column.icon}</span>}
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{column.name}</span>
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: column.color, color: 'white' }}
            >
              {(tasksByColumn.get(column.id) || []).length}
            </span>
          </div>

          {/* Column Body */}
          <div
            className="p-3 space-y-3"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData('text/plain');
              if (!taskId) return;
              const task = tasks.find(t => t.id === taskId);
              if (!task) return;

              const targetKey = column.id;
              if (groupBy === 'priority') {
                if (task.priority !== targetKey) {
                  onUpdateTask && onUpdateTask(task.id, { priority: targetKey });
                }
              } else {
                if (task.category !== targetKey) {
                  onUpdateTask && onUpdateTask(task.id, { category: targetKey });
                }
              }
            }}
          >
            {(tasksByColumn.get(column.id) || []).length === 0 ? (
              <div
                className="text-sm px-3 py-8 text-center rounded border"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border-primary)' }}
              >
                No tasks
              </div>
            ) : (
              (tasksByColumn.get(column.id) || []).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;

