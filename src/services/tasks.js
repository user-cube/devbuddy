const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class TasksService {
  constructor () {
    this.tasksDir = path.join(process.env.APPDATA || process.env.HOME, '.devbuddy', 'tasks');
    this.categoriesDir = path.join(this.tasksDir, 'categories');
    this.indexFile = path.join(this.tasksDir, 'index.yml');
    this.ensureDirectoryExists();
    console.log('TasksService initialized with directory:', this.tasksDir);
  }

  ensureDirectoryExists () {
    if (!fs.existsSync(this.tasksDir)) {
      fs.mkdirSync(this.tasksDir, { recursive: true });
    }
    if (!fs.existsSync(this.categoriesDir)) {
      fs.mkdirSync(this.categoriesDir, { recursive: true });
    }
  }

  loadTasks () {
    // Load all tasks from all categories
    const categories = this.loadCategories();
    let allTasks = [];

    categories.forEach(category => {
      const categoryTasks = this.loadTasksFromCategory(category.id);
      allTasks = allTasks.concat(categoryTasks);
    });

    return allTasks;
  }

  saveTasks (tasks) {
    // Group tasks by category and save each category separately
    const categories = this.loadCategories();
    const tasksByCategory = {};

    // Initialize empty arrays for each category
    categories.forEach(category => {
      tasksByCategory[category.id] = [];
    });

    // Group tasks by category
    tasks.forEach(task => {
      const categoryId = task.category || 'general';
      if (tasksByCategory[categoryId]) {
        tasksByCategory[categoryId].push(task);
      } else {
        // If category doesn't exist, put in general
        tasksByCategory['general'].push(task);
      }
    });

    // Save each category
    Object.keys(tasksByCategory).forEach(categoryId => {
      this.saveTasksToCategory(categoryId, tasksByCategory[categoryId]);
    });

    return true;
  }

  getDefaultTasks () {
    return [
      {
        id: this.generateId(),
        title: 'Welcome to DevBuddy!',
        description: 'This is your first task. You can edit, complete, or delete it.',
        completed: false,
        priority: 'high',
        category: 'general',
        dueDate: null,
        reminders: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['welcome']
      }
    ];
  }

  generateId () {
    // More robust ID generation
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const id = `${timestamp}-${random}`;
    return id;
  }

  getAllTasks () {
    return this.loadTasks();
  }

  getTaskById (id) {
    const tasks = this.loadTasks();
    return tasks.find(task => task.id === id);
  }

  createTask (taskData) {
    const categoryId = taskData.category || 'general';
    const tasks = this.loadTasksFromCategory(categoryId);

    const newTask = {
      id: this.generateId(),
      title: taskData.title || '',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'medium',
      category: categoryId,
      dueDate: taskData.dueDate || null,
      reminders: Array.isArray(taskData.reminders) ? taskData.reminders : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: taskData.tags || []
    };

    tasks.push(newTask);
    this.saveTasksToCategory(categoryId, tasks);
    return newTask;
  }

  updateTask (id, updates) {
    const allTasks = this.loadTasks();
    const existingTask = allTasks.find(t => t.id === id);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    const currentCategoryId = existingTask.category || 'general';
    const targetCategoryRequested = updates && updates.category ? updates.category : currentCategoryId;

    // If category does not change, update in-place within the same category file
    if (targetCategoryRequested === currentCategoryId) {
      const tasksInCategory = this.loadTasksFromCategory(currentCategoryId);
      const taskIndex = tasksInCategory.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found in category');
      }
      tasksInCategory[taskIndex] = {
        ...tasksInCategory[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveTasksToCategory(currentCategoryId, tasksInCategory);
      return tasksInCategory[taskIndex];
    }

    // Category changed: move task between category files
    const categories = this.loadCategories();
    const isValidTarget = categories.some(cat => cat.id === targetCategoryRequested);
    const targetCategoryId = isValidTarget ? targetCategoryRequested : 'general';

    // Remove from old category
    const oldList = this.loadTasksFromCategory(currentCategoryId).filter(t => t.id !== id);
    this.saveTasksToCategory(currentCategoryId, oldList);

    // Add to new category
    const newList = this.loadTasksFromCategory(targetCategoryId);
    const updatedTask = {
      ...existingTask,
      ...updates,
      category: targetCategoryId,
      updatedAt: new Date().toISOString()
    };
    newList.push(updatedTask);
    this.saveTasksToCategory(targetCategoryId, newList);
    return updatedTask;
  }

  deleteTask (id) {
    const allTasks = this.loadTasks();
    const task = allTasks.find(t => t.id === id);

    if (!task) {
      throw new Error('Task not found');
    }

    const categoryId = task.category;
    const tasks = this.loadTasksFromCategory(categoryId);
    const filteredTasks = tasks.filter(t => t.id !== id);

    this.saveTasksToCategory(categoryId, filteredTasks);
    return true;
  }

  toggleTaskComplete (id) {
    const task = this.getTaskById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    return this.updateTask(id, { completed: !task.completed });
  }

  getTasksByCategory (categoryId) {
    return this.loadTasksFromCategory(categoryId);
  }

  getTasksByPriority (priority) {
    const tasks = this.loadTasks();
    return tasks.filter(task => task.priority === priority);
  }

  getCompletedTasks () {
    const tasks = this.loadTasks();
    return tasks.filter(task => task.completed);
  }

  getPendingTasks () {
    const tasks = this.loadTasks();
    return tasks.filter(task => !task.completed);
  }

  getOverdueTasks () {
    const tasks = this.loadTasks();
    const now = new Date();
    return tasks.filter(task =>
      !task.completed &&
      task.dueDate &&
      new Date(task.dueDate) < now
    );
  }

  getTasksDueToday () {
    const tasks = this.loadTasks();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return tasks.filter(task =>
      !task.completed &&
      task.dueDate &&
      task.dueDate.startsWith(todayStr)
    );
  }

  getCategories () {
    const categories = this.loadCategories();
    return categories.map(cat => cat.id);
  }

  getCategoryDetails () {
    return this.loadCategories();
  }

  getPriorities () {
    return ['low', 'medium', 'high', 'urgent'];
  }

  // Category management methods
  loadCategories () {
    try {
      if (!fs.existsSync(this.indexFile)) {
        const defaultCategories = this.getDefaultCategories();
        this.saveCategories(defaultCategories);
        return defaultCategories;
      }

      const fileContent = fs.readFileSync(this.indexFile, 'utf8');
      const categories = yaml.load(fileContent) || this.getDefaultCategories();
      return categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return this.getDefaultCategories();
    }
  }

  saveCategories (categories) {
    try {
      const yamlContent = yaml.dump(categories);
      fs.writeFileSync(this.indexFile, yamlContent, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  }

  getDefaultCategories () {
    return [
      {
        id: 'general',
        name: 'General',
        description: 'General and miscellaneous tasks',
        color: '#3B82F6',
        icon: '📋',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getCategoryFilePath (categoryId) {
    return path.join(this.categoriesDir, `${categoryId}.yml`);
  }

  loadTasksFromCategory (categoryId) {
    try {
      const categoryFile = this.getCategoryFilePath(categoryId);
      if (!fs.existsSync(categoryFile)) {
        return [];
      }

      const fileContent = fs.readFileSync(categoryFile, 'utf8');
      const tasks = yaml.load(fileContent) || [];

      return tasks.map(task => ({
        id: task.id || this.generateId(),
        title: task.title || '',
        description: task.description || '',
        completed: task.completed || false,
        priority: task.priority || 'medium',
        category: categoryId,
        dueDate: task.dueDate || null,
        reminders: Array.isArray(task.reminders) ? task.reminders : [],
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
        tags: task.tags || []
      }));
    } catch (error) {
      console.error(`Error loading tasks from category ${categoryId}:`, error);
      return [];
    }
  }

  saveTasksToCategory (categoryId, tasks) {
    try {
      const categoryFile = this.getCategoryFilePath(categoryId);
      const yamlContent = yaml.dump(tasks);
      fs.writeFileSync(categoryFile, yamlContent, 'utf8');
      return true;
    } catch (error) {
      console.error(`Error saving tasks to category ${categoryId}:`, error);
      return false;
    }
  }

  createCategory (categoryData) {
    const categories = this.loadCategories();

    // Check if a category with the same name already exists
    const existingCategory = categories.find(cat =>
      cat.name.toLowerCase() === categoryData.name.toLowerCase()
    );

    if (existingCategory) {
      throw new Error(`A category with the name "${categoryData.name}" already exists`);
    }

    const newCategory = {
      id: categoryData.id || this.generateCategoryId(categoryData.name),
      name: categoryData.name,
      description: categoryData.description || '',
      color: categoryData.color || '#6B7280',
      icon: categoryData.icon || '📁',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    categories.push(newCategory);
    this.saveCategories(categories);

    // Create empty tasks file for the new category
    this.saveTasksToCategory(newCategory.id, []);

    return newCategory;
  }

  updateCategory (categoryId, updates) {
    const categories = this.loadCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);

    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    // If name is being updated, check if it conflicts with existing categories
    if (updates.name && updates.name !== categories[categoryIndex].name) {
      const existingCategory = categories.find(cat =>
        cat.id !== categoryId &&
        cat.name.toLowerCase() === updates.name.toLowerCase()
      );

      if (existingCategory) {
        throw new Error(`A category with the name "${updates.name}" already exists`);
      }
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveCategories(categories);
    return categories[categoryIndex];
  }

  deleteCategory (categoryId) {
    if (categoryId === 'general') {
      throw new Error('Cannot delete the default "General" category');
    }

    const categories = this.loadCategories();
    const filteredCategories = categories.filter(cat => cat.id !== categoryId);

    if (filteredCategories.length === categories.length) {
      throw new Error('Category not found');
    }

    this.saveCategories(filteredCategories);

    // Delete the category's tasks file
    const categoryFile = this.getCategoryFilePath(categoryId);
    if (fs.existsSync(categoryFile)) {
      fs.unlinkSync(categoryFile);
    }

    return true;
  }

  generateCategoryId (name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  getStats () {
    const tasks = this.loadTasks();
    const categories = this.loadCategories();
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const overdue = this.getOverdueTasks().length;
    const dueToday = this.getTasksDueToday().length;

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      dueToday,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      totalCategories: categories.length
    };
  }
}

module.exports = new TasksService();
