const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

class BookmarksService {
  constructor () {
    this.configDir = path.join(os.homedir(), '.devbuddy');
    this.bookmarksPath = path.join(this.configDir, 'bookmarks.yaml');
    this.defaultBookmarks = this.getDefaultBookmarks();
  }

  getDefaultBookmarks () {
    return {
      categories: [
        {
          id: 'development',
          name: 'Development',
          icon: 'code',
          color: '#3b82f6',
          bookmarks: [
            {
              id: 'dev-local',
              name: 'Local Dev',
              url: 'http://localhost:3000',
              icon: 'rocket',
              description: 'Local development environment'
            },
            {
              id: 'dev-docs',
              name: 'Documentation',
              url: 'http://localhost:3000/docs',
              icon: 'book',
              description: 'Local documentation'
            }
          ]
        },
        {
          id: 'environments',
          name: 'Environments',
          icon: 'server',
          color: '#10b981',
          bookmarks: [
            {
              id: 'staging',
              name: 'Staging',
              url: 'https://staging.yourapp.com',
              icon: 'server',
              description: 'Staging environment'
            },
            {
              id: 'production',
              name: 'Production',
              url: 'https://yourapp.com',
              icon: 'globe',
              description: 'Production environment'
            }
          ]
        },
        {
          id: 'tools',
          name: 'Tools',
          icon: 'wrench',
          color: '#f59e0b',
          bookmarks: [
            {
              id: 'jira',
              name: 'Jira',
              url: 'https://jira.atlassian.net',
              icon: 'git-branch',
              description: 'Project management'
            },
            {
              id: 'github',
              name: 'GitHub',
              url: 'https://github.com',
              icon: 'git-pull-request',
              description: 'Code repository'
            }
          ]
        }
      ]
    };
  }

  ensureConfigDir () {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  loadBookmarks () {
    try {
      this.ensureConfigDir();

      if (!fs.existsSync(this.bookmarksPath)) {
        // Create default bookmarks if it doesn't exist
        this.saveBookmarks(this.defaultBookmarks);
        return this.defaultBookmarks;
      }

      const bookmarksData = fs.readFileSync(this.bookmarksPath, 'utf8');
      const bookmarks = yaml.load(bookmarksData);

      // Handle migration from old shortcuts format
      if (Array.isArray(bookmarks)) {
        // Convert old array format to new categorized format
        const migratedBookmarks = {
          categories: [
            {
              id: 'general',
              name: 'General',
              icon: 'bookmark',
              color: '#6b7280',
              bookmarks: bookmarks
            }
          ]
        };
        this.saveBookmarks(migratedBookmarks);
        return migratedBookmarks;
      }

      return bookmarks || this.defaultBookmarks;
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return this.defaultBookmarks;
    }
  }

  saveBookmarks (bookmarks) {
    try {
      this.ensureConfigDir();
      const yamlData = yaml.dump(bookmarks, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });
      fs.writeFileSync(this.bookmarksPath, yamlData, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      return false;
    }
  }

  getBookmarks () {
    return this.loadBookmarks();
  }

  updateBookmarks (bookmarks) {
    return this.saveBookmarks(bookmarks);
  }

  // Helper methods for categorized bookmarks
  getAllBookmarks () {
    const bookmarksData = this.loadBookmarks();
    const allBookmarks = [];

    if (bookmarksData.categories) {
      bookmarksData.categories.forEach(category => {
        if (category.bookmarks) {
          category.bookmarks.forEach(bookmark => {
            allBookmarks.push({
              ...bookmark,
              category: category.name,
              categoryId: category.id,
              categoryColor: category.color
            });
          });
        }
      });
    }

    return allBookmarks;
  }

  addCategory (category) {
    const bookmarksData = this.loadBookmarks();
    if (!bookmarksData.categories) {
      bookmarksData.categories = [];
    }

    // Generate unique ID if not provided
    if (!category.id) {
      category.id = `category-${Date.now()}`;
    }

    bookmarksData.categories.push(category);
    return this.saveBookmarks(bookmarksData);
  }

  updateCategory (categoryId, updatedCategory) {
    const bookmarksData = this.loadBookmarks();
    if (bookmarksData.categories) {
      const index = bookmarksData.categories.findIndex(cat => cat.id === categoryId);
      if (index !== -1) {
        bookmarksData.categories[index] = { ...bookmarksData.categories[index], ...updatedCategory };
        return this.saveBookmarks(bookmarksData);
      }
    }
    return false;
  }

  deleteCategory (categoryId) {
    const bookmarksData = this.loadBookmarks();
    if (bookmarksData.categories) {
      bookmarksData.categories = bookmarksData.categories.filter(cat => cat.id !== categoryId);
      return this.saveBookmarks(bookmarksData);
    }
    return false;
  }

  addBookmark (categoryId, bookmark) {
    const bookmarksData = this.loadBookmarks();
    if (bookmarksData.categories) {
      const category = bookmarksData.categories.find(cat => cat.id === categoryId);
      if (category) {
        if (!category.bookmarks) {
          category.bookmarks = [];
        }

        // Generate unique ID if not provided
        if (!bookmark.id) {
          bookmark.id = `bookmark-${Date.now()}`;
        }

        category.bookmarks.push(bookmark);
        return this.saveBookmarks(bookmarksData);
      }
    }
    return false;
  }

  updateBookmark (categoryId, bookmarkId, updatedBookmark) {
    const bookmarksData = this.loadBookmarks();
    if (bookmarksData.categories) {
      const category = bookmarksData.categories.find(cat => cat.id === categoryId);
      if (category && category.bookmarks) {
        const index = category.bookmarks.findIndex(bookmark => bookmark.id === bookmarkId);
        if (index !== -1) {
          category.bookmarks[index] = { ...category.bookmarks[index], ...updatedBookmark };
          return this.saveBookmarks(bookmarksData);
        }
      }
    }
    return false;
  }

  deleteBookmark (categoryId, bookmarkId) {
    const bookmarksData = this.loadBookmarks();
    if (bookmarksData.categories) {
      const category = bookmarksData.categories.find(cat => cat.id === categoryId);
      if (category && category.bookmarks) {
        category.bookmarks = category.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
        return this.saveBookmarks(bookmarksData);
      }
    }
    return false;
  }

  getBookmarkById (bookmarkId) {
    const allBookmarks = this.getAllBookmarks();
    return allBookmarks.find(bookmark => bookmark.id === bookmarkId);
  }

  // Migration helper from old shortcuts
  migrateFromShortcuts (shortcutsData) {
    if (Array.isArray(shortcutsData)) {
      const migratedBookmarks = {
        categories: [
          {
            id: 'migrated',
            name: 'Migrated Shortcuts',
            icon: 'bookmark',
            color: '#6b7280',
            bookmarks: shortcutsData.map((shortcut, index) => ({
              id: `migrated-${index}`,
              name: shortcut.name,
              url: shortcut.url,
              icon: shortcut.icon,
              description: shortcut.description
            }))
          }
        ]
      };
      this.saveBookmarks(migratedBookmarks);
      return migratedBookmarks;
    }
    return null;
  }
}

module.exports = BookmarksService;
