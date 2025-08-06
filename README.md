# DevBuddy

A modern desktop application to streamline your development workflow. Built with Electron, React, and Tailwind CSS, DevBuddy provides quick access to your development tools, shortcuts, and project information.

## Features

- **Local Shortcuts**: Quick access to your development environments (dev/local, staging, production)
- **Local Redirects**: Custom domain redirects (e.g., `localhost/jira` or `devbuddy.local/jira` → `jira.atlassian.net`)
- **Jira Integration**: View and manage your active tasks (coming soon)
- **GitHub Integration**: Monitor your pull requests and reviews (coming soon)
- **GitLab Integration**: Track your merge requests (coming soon)
- **Beautiful UI**: Modern, responsive design with dark theme using Tailwind CSS
- **Keyboard Shortcuts**: Quick navigation with Ctrl/Cmd + number keys
- **Background Services**: Automatic data fetching and updates
- **Configuration Management**: Easy setup through a beautiful configuration interface
- **YAML Configuration**: Human-readable configuration stored in `~/.devbuddy/`

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
3. **Set up Jira**: Add your Jira credentials and project keys
4. **Configure GitHub**: Add your GitHub token and organizations
5. **Set up GitLab**: Add your GitLab credentials
6. **App Settings**: Configure theme, notifications, and update intervals

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

## Development

### Project Structure
```
devbuddy/
├── src/
│   ├── main.js                         # Main Electron process
│   ├── preload.js                      # Preload script for secure IPC
│   ├── background.js                   # Background tasks and services
│   ├── renderer/                       # React application
│   │   ├── main.jsx                    # React entry point
│   │   ├── App.jsx                     # Main App component
│   │   ├── index.html                  # HTML template
│   │   ├── index.css                   # Tailwind CSS imports
│   │   └── components/                 # React components (organized by feature)
│   │       ├── home/                   # Home page components
│   │       │   ├── Home.jsx
│   │       │   ├── ShortcutCard.jsx
│   │       │   └── StatsCard.jsx
│   │       ├── layout/                 # Layout components
│   │       │   └── Sidebar.jsx
│   │       ├── configuration/          # Configuration page
│   │       │   └── Configuration.jsx
│   │       ├── jira/                   # Jira page components
│   │       │   └── Jira.jsx
│   │       ├── github/                 # GitHub page components
│   │       │   └── GitHub.jsx
│   │       └── gitlab/                 # GitLab page components
│   │           └── GitLab.jsx
│   ├── services/                       # API services
│   │   ├── config.js                   # Configuration management
│   │   ├── jira.js
│   │   ├── github.js
│   │   └── gitlab.js
│   └── assets/                         # App assets
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
  updateInterval: 300
  redirectorPort: 10000
```

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
- **React**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library
- **React Router**: Client-side routing
- **js-yaml**: YAML configuration parsing

## Building for Distribution

To create distributable packages:

```bash
npm run dist
```

This will create platform-specific packages in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [x] Basic Electron app structure
- [x] React + Tailwind CSS UI
- [x] Sidebar navigation
- [x] Home page with time display and shortcuts
- [x] Placeholder pages for Jira, GitHub, and GitLab
- [x] Local shortcut configuration
- [x] Background service architecture
- [x] YAML-based configuration system
- [x] Configuration management interface
- [x] Setup wizard for first-time users
- [x] Organized component structure by feature
- [ ] Jira API integration
- [ ] GitHub API integration
- [ ] GitLab API integration
- [ ] System tray integration
- [ ] Notifications
- [ ] Data persistence
- [ ] Auto-updates
- [ ] Configuration import/export
- [ ] Theme customization
