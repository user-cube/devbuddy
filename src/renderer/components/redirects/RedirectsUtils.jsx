// Helper functions for Redirects component

export const generateNewDomain = () => {
  return `new-domain-${Date.now()}`;
};

export const generateNewPath = () => {
  return `new-${Date.now()}`;
};

export const validateDomain = (domain) => {
  if (!domain || domain.trim() === '') return false;
  // Basic domain validation - can be enhanced
  return /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9]$/.test(domain);
};

export const validatePath = (path) => {
  if (!path || path.trim() === '') return false;
  // Basic path validation - can be enhanced
  return /^[a-zA-Z0-9-_/]+$/.test(path);
};

export const validateUrl = (url) => {
  if (!url || url.trim() === '') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatRedirectUrl = (domain, path, port) => {
  return `http://${domain}:${port}/${path}`;
};

export const getRedirectCount = (redirects) => {
  return Object.values(redirects).reduce((total, paths) => {
    return total + Object.keys(paths).length;
  }, 0);
};

export const getDomainCount = (redirects) => {
  return Object.keys(redirects).length;
};
