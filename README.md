# DevBuddy

A modern desktop application to streamline your development workflow. Built with Electron, React, and Tailwind CSS, DevBuddy provides quick access to your development tools, shortcuts, and project information with intelligent caching and background data management.

## Features

- **Local Shortcuts**: Quick access to your development environments (dev/local, staging, production)
- **Local Redirects**: Custom domain redirects (e.g., `localhost/jira` or `devbuddy.local/jira` → `jira.atlassian.net`)
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

1. **Configure Shortcuts**: Add your local development URLs
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

### 🎨 **Enhanced UI/UX**
- **Sticky Footer**: Save buttons always visible without scrolling
- **Dark/Light Theme**: Full theme support with CSS variables
- **Responsive Design**: Works on different screen sizes
- **Loading States**: Smooth loading indicators and transitions
- **Error Handling**: Clear error messages and recovery options

## Development

### Project Structure
```
devbuddy/
├── src/
│   ├── main.js                         # Main Electron process with background refresh
│   ├── preload.js                      # Preload script for secure IPC
│   ├── background.js                   # Background tasks and services
│   ├── renderer/                       # React application
│   │   ├── main.jsx                    # React entry point
│   │   ├── App.jsx                     # Main App component with navigation context
│   │   ├── index.html                  # HTML template
│   │   ├── index.css                   # Tailwind CSS imports
│   │   ├── contexts/                   # React contexts
│   │   │   ├── ThemeContext.jsx        # Theme management
│   │   │   └── NavigationContext.jsx   # Navigation state management
│   │   └── components/                 # React components (organized by feature)
│   │       ├── home/                   # Home page components
│   │       │   ├── Home.jsx            # Dashboard with background refresh
│   │       │   ├── ShortcutCard.jsx
│   │       │   └── StatsCard.jsx
│   │       ├── layout/                 # Layout components
│   │       │   ├── Sidebar.jsx
│   │       │   └── ThemeToggle.jsx
│   │       ├── configuration/          # Configuration pages
│   │       │   ├── Configuration.jsx   # Main configuration with sticky footer
│   │       │   └── JiraStatusConfig.jsx # Jira status filtering interface
│   │       ├── jira/                   # Jira page components
│   │       │   └── Jira.jsx            # Jira issues with status filter button
│   │       ├── github/                 # GitHub page components
│   │       │   └── GitHub.jsx
│   │       └── gitlab/                 # GitLab page components
│   │           └── GitLab.jsx
│   ├── services/                       # API services with caching
│   │   ├── config.js                   # Configuration management
│   │   ├── cache.js                    # Cache service with TTL
│   │   ├── jira.js                     # Jira service with status filtering
│   │   ├── github.js                   # GitHub service
│   │   ├── gitlab.js                   # GitLab service
│   │   └── redirector.js               # Local redirect service
│   └── assets/                         # App assets
├── scripts/                            # Build and utility scripts
│   └── generate-icons-python.py        # Icon generation for all platforms
├── assets/                             # Root assets directory
├── package.json                        # Project configuration
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.cjs                  # PostCSS configuration
└── README.md                           # This file
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

### Keyboard Shortcuts

- `Ctrl/Cmd + 1`: Navigate to Home
- `Ctrl/Cmd + 2`: Navigate to Shortcuts
- `Ctrl/Cmd + 3`: Navigate to Redirects
- `Ctrl/Cmd + 4`: Navigate to Jira
- `Ctrl/Cmd + 5`: Navigate to GitHub
- `Ctrl/Cmd + 6`: Navigate to GitLab
- `Ctrl/Cmd + 7`: Navigate to Configuration
- `Escape`: Return to Home

## Configuration

### Configuration File Location

Configuration files are stored in `~/.devbuddy/` and are automatically created on first run:

- `config.yaml` - Main configuration (Jira, GitHub, GitLab, App settings)
- `shortcuts.yaml` - Local shortcuts configuration
- `redirects.yaml` - Local redirects configuration

### Configuration Structure

```yaml
shortcuts:
  - name: "dev/local"
    url: "http://localhost:3000"
    icon: "rocket"
    description: "Local development environment"

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
```

### Jira Status Configuration

DevBuddy provides advanced status filtering for Jira:

- **Excluded Statuses**: Issues with these statuses are hidden from the dashboard
- **Included Statuses**: When specified, only issues with these statuses are shown (whitelist mode)
- **Status Categories**: Group statuses for better organization (future feature)

**Access Status Configuration:**
1. **From Jira page**: Click "Status Filters" button
2. **From Configuration**: Click "Configure Statuses" in Jira section
3. **Direct navigation**: Go to `/config?showJiraStatus=true`

### Available Icons for Shortcuts

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

- [x] Basic Electron app structure
- [x] React + Tailwind CSS UI
- [x] Sidebar navigation
- [x] Home page with time display and shortcuts
- [x] Jira API integration with status filtering
- [x] GitHub API integration
- [x] GitLab API integration
- [x] Local shortcut configuration
- [x] Background service architecture
- [x] YAML-based configuration system
- [x] Configuration management interface
- [x] Setup wizard for first-time users
- [x] Organized component structure by feature
- [x] Intelligent caching system with TTL
- [x] Background refresh for all services
- [x] Custom Jira status filtering
- [x] Sticky UI elements for better UX
- [x] Dark/light theme support
- [x] Icon generation for all platforms
- [x] Local redirect system
- [ ] System tray integration
- [ ] Desktop notifications
- [ ] Auto-updates
- [ ] Configuration import/export
- [ ] Advanced theme customization
- [ ] Data export/backup
- [ ] Keyboard shortcuts customization
- [ ] Plugin system for custom integrations
