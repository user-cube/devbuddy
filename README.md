# DevBuddy 🚀

> **A modern desktop application to streamline your development workflow**

[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue.svg)](https://github.com/user-cube/devbuddy)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-blue.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)

DevBuddy is a powerful desktop application built with Electron and React that helps developers manage their development workflow efficiently. It provides quick access to development tools, bookmarks, project information, and local repositories with intelligent caching and background data management.

## ✨ Features

### 🔗 **Local Redirects**

Create custom domain redirects for quick access to external services:

- `localhost/jira` → `jira.atlassian.net`
- `localhost/github` → `github.com`
- Custom domain support with `/etc/hosts` configuration

### 📚 **Local Bookmarks**

Organize and access your development environments:

- Quick access to dev, staging, and production environments
- Custom icons and descriptions
- Keyboard shortcuts for instant navigation

### 📁 **Repository Management**

Scan and manage local Git repositories:

- Automatic directory scanning
- Repository information and statistics
- Git history visualization
- Editor integration (VS Code, Cursor)
- Search and filtering capabilities

### 🎯 **Jira Integration**

Manage your tasks efficiently:

- View and filter issues by status
- Custom status filtering configuration
- Real-time issue updates
- Quick access to Jira boards

### 🐙 **GitHub Integration**

Monitor your development workflow:

- Pull request tracking
- Review management
- Repository statistics
- Organization support

### 🦊 **GitLab Integration**

Track merge requests and projects:

- Merge request management
- Project overview
- User activity tracking
- Custom instance support

### ⚡ **Smart Caching**

Intelligent data management:

- TTL-based caching system
- Background refresh capabilities
- Warm cache for faster startup
- Cache statistics and monitoring

### 🎨 **Modern UI**

Beautiful and responsive design:

- Dark/light theme support
- Responsive layout
- Toast notifications
- Keyboard shortcuts

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Installation

```bash
# Clone the repository
git clone https://github.com/user-cube/devbuddy
cd devbuddy

# Install dependencies
npm install

# Development mode
npm run dev

# Production mode
npm start
```

### First Run

On first run, DevBuddy will automatically redirect you to the configuration page where you can:

1. **Configure Bookmarks** - Add your local development URLs
2. **Set up Local Redirects** - Configure custom domain redirects
3. **Configure Integrations** - Set up Jira, GitHub, and GitLab
4. **App Settings** - Configure theme, notifications, and preferences

### Key Benefits

- **Maintainability**: Each component has a single responsibility
- **Reusability**: Components can be reused across different parts
- **Testability**: Smaller components are easier to unit test
- **Performance**: Components can be optimized individually
- **Collaboration**: Multiple developers can work simultaneously

## 🛠️ Technology Stack

- **Electron** - Desktop application framework
- **React** - UI library with hooks and context
- **Tailwind CSS** - Utility-first CSS framework with dark theme support
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **js-yaml** - YAML configuration parsing

## 📖 Documentation

For comprehensive documentation, setup guides, and development information, visit:

**[📚 DevBuddy Wiki](https://github.com/user-cube/devbuddy.wiki)**

### Quick Documentation Index

- **[01. Installation Guide](https://github.com/user-cube/devbuddy.wiki/Installation.md)** - Complete setup instructions
- **[02. First Run Setup](https://github.com/user-cube/devbuddy.wiki/First-Run-Setup.md)** - Initial configuration
- **[10. Project Organization](https://github.com/user-cube/devbuddy.wiki/Project-Organization.md)** - Project structure
- **[12. Component Architecture](https://github.com/user-cube/devbuddy.wiki/Component-Architecture.md)** - Technical architecture

## 🎯 Use Cases

### For Developers

- **Quick Environment Access** - Instant access to dev, staging, and production
- **Repository Management** - Scan and manage local Git repositories
- **Task Management** - Track Jira issues and GitHub/GitLab PRs
- **Workflow Optimization** - Custom redirects and bookmarks

### For Teams

- **Consistent Setup** - Share configuration across team members
- **Standardized Workflow** - Common redirects and bookmarks
- **Integration Management** - Centralized API configuration
- **Knowledge Sharing** - Export/import configurations

### For DevOps

- **Environment Management** - Quick access to different environments
- **Repository Overview** - Monitor local development repositories
- **Integration Monitoring** - Track API status and connectivity
- **Configuration Management** - Version-controlled settings

## 🔧 Development

### Available Scripts

```bash
npm start              # Run the app in production mode
npm run dev            # Run the app in development mode with hot reload
npm run build          # Build the app for distribution
npm run dist           # Create distributable packages
npm run preview        # Preview the built React app
```

### Building for Distribution

```bash
# Create distributable packages
npm run dist

# Generate app icons for all platforms
python scripts/generate-icons-python.py
```

### Project Structure

```
devbuddy/
├── src/                           # Source code
│   ├── main.js                    # Main Electron process
│   ├── preload.js                 # Preload script for secure IPC
│   ├── background.js              # Background tasks and services
│   └── renderer/                  # React application
│       ├── components/            # React components (organized by feature)
│       ├── services/              # API services with caching
│       └── contexts/              # React contexts
├── scripts/                       # Build and utility scripts
└── assets/                        # App assets and icons
```
