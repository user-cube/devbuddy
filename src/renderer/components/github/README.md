# GitHub Components

This directory contains the modular components for the GitHub functionality in DevBuddy.

## Structure

### Main Component
- **`GitHub.jsx`** - Main component that orchestrates all GitHub functionality

### Sub-components
- **`GitHubHeader.jsx`** - Page header with title and description
- **`GitHubStats.jsx`** - Statistics cards showing PR counts by status
- **`GitHubFilters.jsx`** - Search bar and filter controls
- **`GitHubPRList.jsx`** - Container for the list of pull requests
- **`GitHubPRCard.jsx`** - Individual pull request card component
- **`GitHubLoading.jsx`** - Loading state component
- **`GitHubError.jsx`** - Error state component

### Utilities
- **`GitHubUtils.js`** - Utility functions for formatting, filtering, and calculations
- **`index.js`** - Barrel export file for easy imports

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused or modified independently
3. **Maintainability**: Smaller files are easier to understand and maintain
4. **Testability**: Individual components can be tested in isolation
5. **Performance**: Components can be optimized individually

## Usage

```jsx
import { GitHub } from './components/github'

// Or import individual components
import { GitHubStats, GitHubFilters } from './components/github'
```

## Component Responsibilities

- **GitHub**: State management, API calls, and component orchestration
- **GitHubHeader**: Static header display
- **GitHubStats**: Display calculated statistics
- **GitHubFilters**: Handle user input for search and filtering
- **GitHubPRList**: Manage the list of pull requests
- **GitHubPRCard**: Display individual pull request data
- **GitHubLoading**: Show loading state
- **GitHubError**: Display error messages with retry functionality
- **GitHubUtils**: Pure functions for data manipulation and formatting
