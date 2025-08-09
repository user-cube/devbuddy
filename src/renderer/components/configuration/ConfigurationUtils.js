// Utility functions for configuration

export const validateUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePort = (port) => {
  const portNum = parseInt(port);
  return portNum >= 1024 && portNum <= 65535;
};

export const validateScanDepth = (depth) => {
  const depthNum = parseInt(depth);
  return depthNum >= 1 && depthNum <= 10;
};

export const formatDirectoryPath = (path) => {
  // Remove trailing slash and normalize
  return path.replace(/\/$/, '');
};

export const getConfigSectionIcon = (section) => {
  const iconMap = {
    jira: '#3b82f6',
    github: '#10b981',
    gitlab: '#f97316',
    repositories: 'var(--accent-primary)',
    app: 'var(--accent-primary)'
  };
  return iconMap[section] || 'var(--accent-primary)';
};

export const getConfigSectionName = (section) => {
  const nameMap = {
    jira: 'Jira',
    github: 'GitHub',
    gitlab: 'GitLab',
    repositories: 'Local Repositories',
    app: 'App Settings'
  };
  return nameMap[section] || section;
};

export const createDirectoryEntry = (path) => {
  return {
    id: Date.now().toString(),
    path: formatDirectoryPath(path),
    tag: '',
    enabled: true
  };
};

export const updateConfigSection = (config, section, key, value) => {
  return {
    ...config,
    [section]: {
      ...config[section],
      [key]: value
    }
  };
};

export const updateRepositoriesConfig = (reposConfig, key, value) => {
  return {
    ...reposConfig,
    [key]: value
  };
};

export const updateDirectory = (directories, directoryId, field, value) => {
  return directories.map(dir =>
    dir.id === directoryId ? { ...dir, [field]: value } : dir
  );
};

export const removeDirectory = (directories, directoryId) => {
  return directories.filter(dir => dir.id !== directoryId);
};

