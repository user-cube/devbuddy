import {
  Rocket,
  Bookmark,
  GitBranch,
  ExternalLink,
  Settings,
  Users,
  Code,
  FileText
} from 'lucide-react';

// Centralized definition of onboarding steps and their content.
// UI rendering is handled by StepContent component for consistency.
const steps = [
  {
    id: 'welcome',
    title: 'Welcome to DevBuddy! 🚀',
    subtitle: 'Your development workflow assistant',
    description: 'DevBuddy helps you streamline your development workflow with quick access to tools, repositories, and integrations.',
    icon: Rocket,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    features: [
      { icon: Bookmark, text: 'Quick access to development environments' },
      { icon: GitBranch, text: 'Local repository management' },
      { icon: ExternalLink, text: 'Custom domain redirects' },
      { icon: Users, text: 'Jira, GitHub & GitLab integrations' }
    ]
  },
  {
    id: 'bookmarks',
    title: 'Local Bookmarks',
    subtitle: 'Quick access to your environments',
    description: 'Set up bookmarks for quick access to your development, staging, and production environments.',
    icon: Bookmark,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    example: {
      title: 'Example Configuration',
      items: [
        { name: 'dev/local', url: 'http://localhost:3000', icon: 'rocket' },
        { name: 'staging', url: 'https://staging.yourapp.com', icon: 'server' },
        { name: 'production', url: 'https://yourapp.com', icon: 'globe' }
      ]
    }
  },
  {
    id: 'redirects',
    title: 'Local Redirects',
    subtitle: 'Custom domain shortcuts',
    description: 'Create custom shortcuts for external services. Access Jira, GitHub, and other tools with simple URLs.',
    icon: ExternalLink,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    example: {
      title: 'Example URLs',
      items: [
        { url: 'http://localhost:10000/jira', description: '→ Your Jira instance' },
        { url: 'http://localhost:10000/github', description: '→ GitHub repository' },
        { url: 'http://localhost:10000/gitlab', description: '→ GitLab projects' }
      ]
    }
  },
  {
    id: 'repositories',
    title: 'Repository Management',
    subtitle: 'Local Git repository scanning',
    description: 'Scan and manage your local Git repositories. View commits, branches, and open in your preferred editor.',
    icon: GitBranch,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    features: [
      { icon: Code, text: 'Automatic repository scanning' },
      { icon: FileText, text: 'Recent commits overview' },
      { icon: GitBranch, text: 'Branch information' },
      { icon: Settings, text: 'Open in editor or file explorer' }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    subtitle: 'Connect your development tools',
    description: 'Integrate with Jira, GitHub, and GitLab to manage tasks, pull requests, and merge requests.',
    icon: Users,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    integrations: [
      { name: 'Jira', icon: '🎯', description: 'Task management and issue tracking' },
      { name: 'GitHub', icon: '🐙', description: 'Pull request monitoring and reviews' },
      { name: 'GitLab', icon: '🦊', description: 'Merge request tracking and management' },
      { name: 'Bitbucket', icon: '🔵', description: 'Pull request monitoring and reviews' }
    ]
  },
  {
    id: 'setup',
    title: 'Ready to Configure',
    subtitle: "Let's set up your workspace",
    description: "You're all set! Let's configure your integrations and preferences to get you started.",
    icon: Settings,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    nextSteps: [
      'Configure your integrations (Jira, GitHub, GitLab)',
      'Set up local bookmarks for quick access',
      'Configure repository scanning paths',
      'Customize app settings and preferences'
    ]
  }
];

export default steps;

