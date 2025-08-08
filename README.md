# DevBuddy

A modern desktop application to streamline your development workflow. Built with Electron, React, and Tailwind CSS, DevBuddy provides quick access to your development tools, bookmarks, project information, and local repositories with intelligent caching and background data management.

## Features

- **Local Bookmarks**: Quick access to your development environments (dev/local, staging, production)
- **Local Redirects**: Custom domain redirects (e.g., `localhost/jira` or `devbuddy.local/jira` → `jira.atlassian.net`)
- **Local Repository Management**: Scan and manage your local Git repositories with detailed information
- **Editor Integration**: Open repositories in VS Code or Cursor with configurable default editor
- **Jira Integration**: View and manage your active tasks with custom status filtering
- **GitHub Integration**: Monitor your pull requests and reviews
- **GitLab Integration**: Track your merge requests
- **Intelligent Caching**: Smart cache management with TTL and warm cache for faster loading
- **Background Refresh**: Automatic data updates even when the app is minimized
- **Custom Status Filtering**: Configure which Jira statuses to show or hide
- **Beautiful UI**: Modern, responsive design with dark/light theme using Tailwind CSS
- **Keyboard Shortcuts**: Quick navigation with Ctrl/Cmd + number keys
- **Background Services**: Automatic data fetching and updates
- **Configuration Management**: Easy setup through a beautiful configuration interface
- **YAML Configuration**: Human-readable configuration stored in `~/.devbuddy/`
- **Sticky UI Elements**: Always-accessible save buttons and navigation
- **Toast Notifications**: Modern notification system with auto-dismiss
- **Dynamic Navigation**: Sidebar and bookmarks update automatically based on enabled integrations
- **Enhanced Dashboard**: Rich homepage with integration status, activity summary, and recent items
- **Real-time Updates**: Configuration changes apply immediately across the application
- **Configuration Import/Export**: Backup and share configurations with automatic backup protection

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd devbuddy
```

2. Install dependencies:

```bash
npm install
```

3. Run the application:

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

## First Run Setup

On first run, DevBuddy will automatically redirect you to the configuration page where you can:

1. **Configure Bookmarks**: Add your local development URLs
2. **Set up Local Redirects**: Configure custom domain redirects (e.g., `localhost/jira` or `devbuddy.local/jira`)
3. **Set up Jira**: Add your Jira credentials, project keys, and configure status filtering
4. **Configure GitHub**: Add your GitHub token and organizations
5. **Set up GitLab**: Add your GitLab credentials
6. **App Settings**: Configure theme, notifications, background refresh, and update intervals

### Local Redirects Setup

1. **The redirector server starts automatically** when DevBuddy launches
2. **Configure redirects** in DevBuddy (e.g., `localhost/jira` → `https://jira.atlassian.net`)
3. **Test**: Visit `http://localhost:10000/jira` in your browser

**Optional - Custom domain setup:**

- **Configure your /etc/hosts**:
  ```bash
  sudo ./scripts/setup-hosts.sh
  ```
  Or manually add: `127.0.0.1 devbuddy.local`
- **Test**: Visit `http://devbuddy.local:10000/jira` in your browser

### Local Repository Management

DevBuddy can scan and manage your local Git repositories:

1. **Configure Repository Paths**: Add directories to scan for Git repositories
2. **Repository Information**: View repository details including:
   - Repository name and path
   - Primary programming language
   - Last modification date
   - Git status and branch information
   - Commit history and recent activity
3. **Quick Actions**:
   - Open repository in file explorer
   - Open repository in configured editor (VS Code or Cursor)
4. **Editor Configuration**: Choose between VS Code and Cursor as default editor

**Repository Setup:**

1. Go to **Configuration** → **Local Repositories**
2. Add directories to scan (e.g., `~/projects`, `~/workspace`)
3. Configure default editor in **App Settings**
4. View and manage repositories in the **Repositories** page

**Supported Editors:**

- **VS Code**: Uses `code` command with fallback to system default
- **Cursor**: Uses `cursor` command with fallback to VS Code
- **Cross-platform**: Works on macOS, Windows, and Linux

## Key Features

### 🚀 **Smart Caching System**

- **Warm Cache**: Initial data loads are cached for 30 minutes for faster startup
- **TTL Management**: Configurable cache expiration per service
- **Cache Statistics**: Monitor cache performance and usage
- **Manual Cache Control**: Clear cache per service or globally

### 🔄 **Background Refresh**

- **Automatic Updates**: Data refreshes automatically based on configured intervals
- **Minimized Operation**: Continues working even when the app is minimized
- **Smart Timing**: Uses the minimum refresh interval from all enabled services
- **Manual Trigger**: Force refresh data at any time

### 🎯 **Jira Status Filtering**

- **Custom Status Configuration**: Dedicated page for managing Jira status filters
- **Exclude Statuses**: Hide completed, closed, or irrelevant statuses
- **Include Statuses**: Whitelist mode to show only specific statuses
- **Visual Status Management**: Intuitive grid interface with color coding
- **Search & Filter**: Find statuses quickly with search functionality
- **Real-time Updates**: Changes apply immediately with cache refresh

### 🏠 **Enhanced Dashboard**

- **Integration Status Overview**: Visual cards showing enabled/disabled integrations with data counts
- **Activity Summary**: Today's focus, items in review, and last update information
- **Recent Items**: Latest Jira issues, GitHub PRs, and GitLab MRs with detailed information
- **Smart Navigation**: Direct access to integration pages from status cards
- **Background Refresh Status**: Visual indicators for automatic data updates

### 🎨 **Enhanced UI/UX**

- **Sticky Footer**: Save buttons always visible without scrolling
- **Dark/Light Theme**: Full theme support with CSS variables
- **Toast Notifications**: Modern notification system with auto-dismiss and manual close
- **Responsive Design**: Works on different screen sizes
- **Loading States**: Smooth loading indicators and transitions
- **Error Handling**: Clear error messages and recovery options
- **Dynamic Navigation**: Sidebar and keyboard shortcuts update automatically
- **Integration Status Cards**: Visual indicators for enabled/disabled integrations

### 🔄 **Real-time Updates**

- **Dynamic Navigation**: Sidebar and keyboard shortcuts update when integrations are enabled/disabled
- **Configuration Sync**: Changes apply immediately across all components
- **Protected Routes**: Automatic redirection when accessing disabled integration pages
- **Status Indicators**: Visual feedback for unsaved changes and integration status

### 📁 **Configuration Import/Export**

- **Export Configuration**: Save all settings to JSON file with timestamp
- **Import Configuration**: Load settings from file with automatic backup
- **Backup Protection**: Automatic backup before each import
- **Version Compatibility**: Support for future configuration format updates
- **Validation**: Robust error checking and format validation

### 📂 **Local Repository Management**

- **Directory Scanning**: Automatically scan configured directories for Git repositories
- **Repository Information**: Display repository name, path, language, and last modification date
- **Editor Integration**: Open repositories in VS Code or Cursor with configurable default
- **File Explorer Integration**: Quick access to repository folders in system file manager
- **Cross-platform Support**: Works seamlessly on macOS, Windows, and Linux
- **Smart Fallbacks**: Automatic fallback to alternative editors if primary editor is unavailable
- **Repository Statistics**: Track repository count, languages used, and modification patterns
- **Git History Visualization**: View commit history with interactive Git graph
- **Repository Search**: Search repositories by name, path, branch, or remote URL
- **Status Monitoring**: Real-time repository status (up-to-date, has changes, behind remote)

### 🏗️ **Modular Component Architecture**

- **GitLab Integration**: Modular components for merge request management with filtering and statistics
- **GitHub Integration**: Refactored components for pull request tracking and review management
- **Jira Integration**: Componentized issue management with custom status filtering and statistics
- **Home Dashboard**: Modular dashboard with integration status, activity feeds, and quick actions
- **Redirects Management**: Componentized local redirect configuration with server status monitoring
- **Repository Management**: Modular repository scanning, details, and Git history visualization

## Development

### Project Structure

```
devbuddy/
├── src/
│   ├── main.js                                   # Main Electron process with background refresh
│   ├── preload.js                                # Preload script for secure IPC
│   ├── background.js                             # Background tasks and services
│   ├── renderer/                                 # React application
│   │   ├── main.jsx                              # React entry point
│   │   ├── App.jsx                               # Main App component with navigation context
│   │   ├── index.html                            # HTML template
│   │   ├── index.css                             # Tailwind CSS imports
│   │   ├── contexts/                             # React contexts
│   │   │   ├── ThemeContext.jsx                  # Theme management
│   │   │   └── NavigationContext.jsx             # Navigation state management
│   │   └── components/                           # React components (organized by feature)
│   │       ├── home/                             # Home page components (refactored)
│   │       │   ├── Home.jsx                      # Main orchestrator component (375 lines)
│   │       │   ├── HomeHeader.jsx                # Header with time and refresh controls
│   │       │   ├── HomeStats.jsx                 # Statistics cards
│   │       │   ├── HomeIntegrationStatus.jsx     # Integration status overview
│   │       │   ├── HomeBookmarks.jsx             # Bookmarks section
│   │       │   ├── HomeRecentActivity.jsx        # Recent activity feed
│   │       │   ├── HomeQuickActions.jsx          # Quick action buttons
│   │       │   ├── HomeLoading.jsx               # Loading state
│   │       │   ├── HomeError.jsx                 # Error state
│   │       │   ├── HomeUtils.jsx                 # Utility functions
│   │       │   └── index.js                      # Centralized exports
│   │       ├── layout/                           # Layout components
│   │       │   ├── Sidebar.jsx                   # Dynamic navigation with integration status
│   │       │   ├── ThemeToggle.jsx
│   │       │   ├── Toast.jsx                     # Toast notification system
│   │       │   └── ProtectedRoute.jsx            # Route protection for disabled integrations
│   │       ├── configuration/                    # Configuration pages
│   │       │   ├── Configuration.jsx             # Main configuration with import/export and toast
│   │       │   └── JiraStatusConfig.jsx          # Jira status filtering with dark mode support
│   │       ├── jira/                             # Jira page components (refactored)
│   │       │   ├── Jira.jsx                      # Main orchestrator component (149 lines)
│   │       │   ├── JiraHeader.jsx                # Header with title and description
│   │       │   ├── JiraStats.jsx                 # Statistics cards
│   │       │   ├── JiraFilters.jsx               # Search and filter controls
│   │       │   ├── JiraIssueCard.jsx             # Individual issue card
│   │       │   ├── JiraLoading.jsx               # Loading state
│   │       │   ├── JiraError.jsx                 # Error state
│   │       │   ├── JiraEmpty.jsx                 # Empty state
│   │       │   ├── JiraUtils.jsx                 # Utility functions
│   │       │   └── index.js                      # Centralized exports
│   │       ├── github/                           # GitHub page components (refactored)
│   │       │   ├── GitHub.jsx                    # Main orchestrator component (145 lines)
│   │       │   ├── GitHubHeader.jsx              # Header with title and description
│   │       │   ├── GitHubStats.jsx               # Statistics cards
│   │       │   ├── GitHubFilters.jsx             # Search and filter controls
│   │       │   ├── GitHubPRCard.jsx              # Individual PR card
│   │       │   ├── GitHubLoading.jsx             # Loading state
│   │       │   ├── GitHubError.jsx               # Error state
│   │       │   ├── GitHubEmpty.jsx               # Empty state
│   │       │   ├── GitHubUtils.js                # Utility functions
│   │       │   └── index.js                      # Centralized exports
│   │       ├── gitlab/                           # GitLab page components (refactored)
│   │       │   ├── GitLab.jsx                    # Main orchestrator component (145 lines)
│   │       │   ├── GitLabHeader.jsx              # Header with title and description
│   │       │   ├── GitLabStats.jsx               # Statistics cards
│   │       │   ├── GitLabFilters.jsx             # Search and filter controls
│   │       │   ├── GitLabMRCard.jsx              # Individual MR card
│   │       │   ├── GitLabLoading.jsx             # Loading state
│   │       │   ├── GitLabError.jsx               # Error state
│   │       │   ├── GitLabEmpty.jsx               # Empty state
│   │       │   ├── GitLabUtils.js                # Utility functions
│   │       │   └── index.js                      # Centralized exports
│   │       ├── redirects/                        # Redirects components (refactored)
│   │       │   ├── Redirects.jsx                 # Main orchestrator component (435 lines)
│   │       │   ├── RedirectsHeader.jsx           # Header with title and description
│   │       │   ├── RedirectsMessage.jsx          # Success/error message display
│   │       │   ├── RedirectsServerStatus.jsx     # Server status and controls
│   │       │   ├── RedirectsDomainCard.jsx       # Domain card with redirects
│   │       │   ├── RedirectsPathRow.jsx          # Individual redirect path row
│   │       │   ├── RedirectsEmpty.jsx            # Empty state
│   │       │   ├── RedirectsLoading.jsx          # Loading state
│   │       │   ├── RedirectsUtils.jsx            # Utility functions
│   │       │   └── index.js                      # Centralized exports
│   │       └── repositories/                     # Repository management components (refactored)
│   │           ├── Repositories.jsx              # Main orchestrator component (354 lines)
│   │           ├── RepositoriesHeader.jsx        # Header with title and controls
│   │           ├── RepositoriesDirectories.jsx   # List of configured directories
│   │           ├── RepositoriesSearch.jsx        # Search bar with keyboard shortcuts
│   │           ├── RepositoriesFolders.jsx       # Grid of repository folders
│   │           ├── RepositoriesDetails.jsx       # Detailed repository information
│   │           ├── RepositoriesLoading.jsx       # Loading state
│   │           ├── RepositoriesError.jsx         # Error state
│   │           ├── RepositoriesDisabled.jsx      # Disabled state
│   │           ├── GitGraph.jsx                  # Git commit history visualization
│   │           ├── RepositoriesUtils.jsx         # Utility functions
│   │           └── index.js                      # Centralized exports
│   ├── services/                                 # API services with caching
│   │   ├── config.js                             # Configuration management
│   │   ├── cache.js                              # Cache service with TTL
│   │   ├── jira.js                               # Jira service with status filtering
│   │   ├── github.js                             # GitHub service
│   │   ├── gitlab.js                             # GitLab service
│   │   ├── repositories.js                       # Local repository management
│   │   └── redirector.js                         # Local redirect service
│   └── assets/                                   # App assets
├── scripts/                                      # Build and utility scripts
│   └── generate-icons-python.py                  # Icon generation for all platforms
├── assets/                                       # Root assets directory
├── package.json                                  # Project configuration
├── vite.config.js                                # Vite configuration
├── tailwind.config.js                            # Tailwind CSS configuration
├── postcss.config.cjs                            # PostCSS configuration
└── README.md                                     # This file
```

### Available Scripts

- `npm start`: Run the app in production mode
- `npm run dev`: Run the app in development mode with hot reload
- `npm run dev:renderer`: Run only the React dev server
- `npm run build`: Build the app for distribution
- `npm run build:renderer`: Build only the React app
- `npm run dist`: Create distributable packages
- `npm run preview`: Preview the built React app
- `python scripts/generate-icons-python.py`: Generate app icons for all platforms

### Configuration Management

DevBuddy supports importing and exporting configurations for backup and sharing:

**Export Configuration:**

- Exports all settings to a JSON file
- Includes: integrations, shortcuts, redirects, app preferences
- Default save location: Desktop with timestamp
- File format: `devbuddy-config-YYYY-MM-DD.json`

**Import Configuration:**

- Imports settings from JSON file
- Automatic backup of current configuration
- Validation of file format and structure
- Real-time updates after import
- Backup location: `~/.devbuddy/backups/`

**Backup Protection:**

- Automatic backup before each import
- Unique backup files with timestamps
- Safe rollback capability
- Version compatibility checking

**Export File Format:**

```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "config": {
    "jira": {
      /* Jira integration settings */
    },
    "github": {
      /* GitHub integration settings */
    },
    "gitlab": {
      /* GitLab integration settings */
    },
    "app": {
      /* Application preferences */
    }
  },
  "shortcuts": [
    /* Local shortcuts configuration */
  ],
  "redirects": {
    /* Local redirect rules */
  }
}
```

### Keyboard Shortcuts

Keyboard shortcuts are dynamic and update automatically based on enabled integrations:

**Base Navigation:**

- `Ctrl/Cmd + 1`: Navigate to Home
- `Ctrl/Cmd + 2`: Navigate to Bookmarks
- `Ctrl/Cmd + 3`: Navigate to Redirects

**Integration Navigation (dynamic):**

- `Ctrl/Cmd + 4`: Navigate to Jira (if enabled)
- `Ctrl/Cmd + 5`: Navigate to GitHub (if enabled)
- `Ctrl/Cmd + 6`: Navigate to GitLab (if enabled)
- `Ctrl/Cmd + 7`: Navigate to Repositories

**Configuration:**

- `Ctrl/Cmd + 8`: Navigate to Configuration
- `Escape`: Return to Home

**Note:** Integration shortcuts only appear when the respective integration is enabled in settings.

## Configuration

### Configuration File Location

Configuration files are stored in `~/.devbuddy/` and are automatically created on first run:

- `config.yaml` - Main configuration (Jira, GitHub, GitLab, App settings)
- `bookmarks.yaml` - Local bookmarks configuration
- `redirects.yaml` - Local redirects configuration
- `backups/` - Automatic backup directory for import operations

### Configuration Structure

```yaml
bookmarks:
  - name: "dev/local"
    url: "http://localhost:3000"
    icon: "rocket"
    description: "Local development environment"

repositories:
  enabled: true
  paths: ["~/projects", "~/workspace"]
  scanInterval: 300

jira:
  enabled: false
  baseUrl: ""
  apiToken: ""
  username: ""
  projectKeys: []
  excludedStatuses: ["Done", "Closed", "Resolved", "Cancelled"]
  includedStatuses: []
  statusCategories:
    todo: ["To Do", "Open"]
    inProgress: ["In Progress", "Development"]
    review: ["Review", "Testing"]
    blocked: ["Blocked", "On Hold"]

github:
  enabled: false
  apiToken: ""
  username: ""
  organizations: []

gitlab:
  enabled: false
  baseUrl: "https://gitlab.com"
  apiToken: ""
  username: ""

app:
  theme: "dark"
  autoStart: false
  notifications: true
  backgroundRefresh: true
  updateInterval: 300
  redirectorPort: 10000
  defaultEditor: "vscode" # "vscode" or "cursor"
```

### Jira Status Configuration

DevBuddy provides advanced status filtering for Jira with a dedicated configuration interface:

- **Excluded Statuses**: Issues with these statuses are hidden from the dashboard
- **Included Statuses**: When specified, only issues with these statuses are shown (whitelist mode)
- **Visual Status Management**: Intuitive grid interface with color coding and search
- **Real-time Updates**: Changes apply immediately with automatic cache refresh
- **Dark Mode Support**: Fully compatible with dark/light themes

**Access Status Configuration:**

1. **From Jira page**: Click "Status Filters" button in the header
2. **From Configuration**: Click "Configure Statuses" in Jira section
3. **Direct navigation**: Go to `/config?showJiraStatus=true`

**Features:**

- **Search & Filter**: Find statuses quickly with search functionality
- **Visual Indicators**: Color-coded status cards (excluded/hidden/visible)
- **Bulk Actions**: Clear all excluded or included statuses
- **Cache Management**: Automatic Jira cache refresh after saving
- **Toast Notifications**: Clear feedback on save operations

### Available Icons for Bookmarks

- `rocket`: For local development
- `server`: For staging environments
- `globe`: For production environments
- `jira`: For Jira links
- `github`: For GitHub links
- `gitlab`: For GitLab links

### Local Redirects Configuration

The redirects system allows you to create custom local URLs that redirect to external services:

```yaml
localhost:
  jira: "https://jira.atlassian.net"
  github: "https://github.com"
  gitlab: "https://gitlab.com"
  staging: "https://staging.yourapp.com"
  prod: "https://yourapp.com"

devbuddy.local:
  jira: "https://jira.atlassian.net"
  github: "https://github.com"
  gitlab: "https://gitlab.com"
  staging: "https://staging.yourapp.com"
  prod: "https://yourapp.com"
```

With this configuration:

- `http://localhost:10000/jira` → `https://jira.atlassian.net` (works immediately)
- `http://localhost:10000/github` → `https://github.com` (works immediately)
- `http://devbuddy.local:10000/jira` → `https://jira.atlassian.net` (requires /etc/hosts setup)
- `http://devbuddy.local:10000/github` → `https://github.com` (requires /etc/hosts setup)

**Requirements:**

- Redirector server starts automatically when DevBuddy launches
- Server runs on configurable port (default: 10000, no sudo required)
- For `localhost` URLs: No additional setup required
- For `devbuddy.local` URLs: `/etc/hosts` must include `127.0.0.1 devbuddy.local`

### Repository Configuration

Configure local repository scanning and management:

```yaml
repositories:
  enabled: true
  paths: ["~/projects", "~/workspace", "/path/to/other/repos"]
  scanInterval: 300 # Scan interval in seconds
```

**Configuration Options:**

- **enabled**: Enable/disable repository scanning
- **paths**: Array of directories to scan for Git repositories
- **scanInterval**: How often to rescan directories (in seconds)

**Supported Path Formats:**

- **Home directory**: `~/projects`, `~/workspace`
- **Absolute paths**: `/Users/username/projects`, `C:\Users\username\projects`
- **Relative paths**: `./repos`, `../workspace`

**Editor Configuration:**

```yaml
app:
  defaultEditor: "vscode" # "vscode" or "cursor"
```

**Editor Fallback Chain:**

- **macOS**: Primary editor → Secondary editor → TextEdit
- **Windows**: Primary editor → Secondary editor → Notepad
- **Linux**: Primary editor → Secondary editor → nano

## API Integration Setup

### Jira Setup

1. Go to your Jira instance
2. Create an API token in your profile settings
3. Note your Jira base URL (e.g., `https://company.atlassian.net`)
4. Add your project keys (e.g., `PROJ, DEV, BUG`)
5. Configure status filtering to show only relevant issues

### GitHub Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with `repo` and `read:org` scopes
3. Add your username and organizations

### GitLab Setup

1. Go to GitLab > User Settings > Access Tokens
2. Create a new token with `read_api` scope
3. Add your GitLab instance URL (default: `https://gitlab.com`)

## Technology Stack

- **Electron**: Desktop application framework
- **React**: UI library with hooks and context
- **Tailwind CSS**: Utility-first CSS framework with dark theme support
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library
- **React Router**: Client-side routing
- **js-yaml**: YAML configuration parsing
- **CairoSVG & Pillow**: Icon generation for multiple platforms

## Building for Distribution

To create distributable packages:

```bash
npm run dist
```

This will create platform-specific packages in the `dist/` directory.

### Icon Generation

Generate app icons for all platforms:

```bash
python scripts/generate-icons-python.py
```

This creates icons for:

- **macOS**: `.icns` files with @2x support
- **Windows**: `.ico` files
- **Linux**: PNG icons in various sizes
- **Electron**: Generic PNG icons

## Roadmap

### ✅ Completed Features

#### Core Application

- [x] Basic Electron app structure
- [x] React + Tailwind CSS UI
- [x] Sidebar navigation
- [x] Background service architecture
- [x] YAML-based configuration system
- [x] Configuration management interface
- [x] Setup wizard for first-time users
- [x] Intelligent caching system with TTL
- [x] Background refresh for all services
- [x] Sticky UI elements for better UX
- [x] Dark/light theme support
- [x] Icon generation for all platforms
- [x] Toast notification system
- [x] Dynamic navigation and keyboard shortcuts
- [x] Real-time configuration updates
- [x] Protected routes for disabled integrations
- [x] Dark mode compatibility for all components
- [x] Configuration import/export with backup protection

#### Component Architecture

- [x] Organized component structure by feature
- [x] **GitLab component refactoring** (565 → 145 lines, 74% reduction)
- [x] **Home component refactoring** (982 → 375 lines, 62% reduction)
- [x] **Jira component refactoring** (604 → 149 lines, 75% reduction)
- [x] **Redirects component refactoring** (843 → 435 lines, 48% reduction)
- [x] **Repositories component refactoring** (1070 → 354 lines, 67% reduction)
- [x] Modular component architecture with consistent patterns
- [x] Centralized exports and utility functions
- [x] Component documentation and README files

#### Integrations

- [x] Jira API integration with status filtering
- [x] GitHub API integration
- [x] GitLab API integration
- [x] Local shortcut configuration
- [x] Local redirect system
- [x] Local repository management and scanning
- [x] Editor integration (VS Code and Cursor)
- [x] Repository information display (language, last modified, etc.)
- [x] Quick actions for repositories (open in file explorer, open in editor)
- [x] Configurable default editor selection

#### Enhanced Features

- [x] Home page with time display and bookmarks
- [x] Custom Jira status filtering
- [x] Enhanced dashboard with integration status
- [x] Git history visualization with interactive graphs
- [x] Repository search and filtering
- [x] Status monitoring for repositories

### 🚧 Planned Features

#### System Integration

- [ ] System tray integration
- [ ] Desktop notifications
- [ ] Advanced theme customization
- [ ] Keyboard shortcuts customization

#### Repository Enhancements

- [ ] Repository statistics and analytics
- [ ] Git status integration (uncommitted changes, branches)
- [ ] Repository comparison and diff viewing
- [ ] Branch management and switching

#### Performance & UX

- [ ] Virtual scrolling for large lists
- [ ] Advanced search with filters
- [ ] Bulk operations for repositories
- [ ] Repository tagging and categorization
