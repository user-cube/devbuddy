import React, { useState, useEffect } from 'react';
import { Toast } from '../../hooks/useToast';
import ToastComponent from '../layout/Toast';
import RepositoriesHeader from './RepositoriesHeader';
import RepositoriesDirectories from './RepositoriesDirectories';
import RepositoriesSearch from './RepositoriesSearch';
import RepositoriesFolders from './RepositoriesFolders';
import RepositoriesDetails from './RepositoriesDetails';
import RepositoriesLoading from './RepositoriesLoading';
import RepositoriesError from './RepositoriesError';
import RepositoriesDisabled from './RepositoriesDisabled';
import { filterRepositories } from './RepositoriesUtils';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [filteredRepositories, setFilteredRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [config, setConfig] = useState(null);

  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [directoryFolders, setDirectoryFolders] = useState({});
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderRepositoryInfo, setFolderRepositoryInfo] = useState({});
  const [repositoryCommits, setRepositoryCommits] = useState({});
  const [appConfig, setAppConfig] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cacheStatus, setCacheStatus] = useState(null);
  const [isRefreshingRepositories, setIsRefreshingRepositories] = useState(false);
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    // Listen for config changes
    const handleConfigChange = () => {
      loadConfig();
    };

    window.addEventListener('config-changed', handleConfigChange);
    return () => window.removeEventListener('config-changed', handleConfigChange);
  }, []);

  useEffect(() => {
    if (config?.enabled) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [config]);

  // Filter repositories based on search query
  useEffect(() => {
    setFilteredRepositories(filterRepositories(repositories, searchQuery));
  }, [repositories, searchQuery]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getRepositoriesConfig();
      setConfig(config);

      // Load app config to get default editor
      const appConfigData = await window.electronAPI.getConfig();
      setAppConfig(appConfigData?.app);

      // Load cache status
      const cacheStatusData = await window.electronAPI.getRepositoriesCacheStatus();
      setCacheStatus(cacheStatusData);
    } catch {
      // no-op
      setError('Failed to load configuration');
      setLoading(false);
    }
  };

  const loadFoldersForDirectory = async (directory) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we already have folders for this directory
      if (directoryFolders[directory.path]) {
        setRepositories(directoryFolders[directory.path]);
        setSelectedDirectory(directory);
        setLoading(false);
        return;
      }

      const folders = await window.electronAPI.getFoldersInDirectory(directory.path);

      // Cache the folders for this directory
      setDirectoryFolders(prev => ({
        ...prev,
        [directory.path]: folders
      }));

      setRepositories(folders);
      setFilteredRepositories(folders);
      setSelectedDirectory(directory);
    } catch {
      // no-op
      setError('Failed to load folders for this directory');
    } finally {
      setLoading(false);
    }
  };

  const loadRepositoryInfo = async (folderPath, tag, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we already have repository info for this folder (unless forcing refresh)
      if (folderRepositoryInfo[folderPath] && !forceRefresh) {
        setSelectedFolder(folderRepositoryInfo[folderPath]);
        setLoading(false);
        return;
      }

      const repoInfo = await window.electronAPI.getRepositoryInfo(folderPath, tag);

      // Cache the repository info for this folder
      setFolderRepositoryInfo(prev => ({
        ...prev,
        [folderPath]: repoInfo
      }));

      setSelectedFolder(repoInfo);

      // Load commits for this repository
      await loadRepositoryCommits(folderPath, forceRefresh);
    } catch {
      // no-op
      setError('Failed to load repository information');
    } finally {
      setLoading(false);
    }
  };

  const loadRepositoryCommits = async (folderPath, forceRefresh = false) => {
    try {
      // Check if we already have commits for this folder (unless forcing refresh)
      if (repositoryCommits[folderPath] && !forceRefresh) {
        return;
      }

      const commits = await window.electronAPI.getRepositoryCommits(folderPath);

      // Cache the commits for this folder
      setRepositoryCommits(prev => ({
        ...prev,
        [folderPath]: commits
      }));
    } catch {
      // no-op
      // Don't show error for commits, just log it
    }
  };

  const handleOpenRepository = async (repoPath) => {
    try {
      const result = await window.electronAPI.openRepository(repoPath);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      // no-op
      setMessage({ type: 'error', text: 'Failed to open repository' });
    }
  };

  const handleOpenInEditor = async (repoPath) => {
    try {
      const result = await window.electronAPI.openRepositoryInEditor(repoPath);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      // no-op
      setMessage({ type: 'error', text: 'Failed to open editor' });
    }
  };

  const goBackToDirectories = () => {
    setSelectedDirectory(null);
    setRepositories([]);

    setSelectedFolder(null);
  };

  const goBackToFolders = () => {
    setSelectedFolder(null);
  };

  const rescanAndReloadCurrent = async () => {
    try {
      setIsRefreshingRepositories(true);
      const result = await window.electronAPI.refreshRepositoriesCacheInBackground();
      if (!result?.success) {
        setMessage({ type: 'error', text: `Failed to refresh repositories: ${result?.error || 'Unknown error'}` });
        return;
      }
      const cacheStatusData = await window.electronAPI.getRepositoriesCacheStatus();
      setCacheStatus(cacheStatusData);
      if (selectedDirectory) {
        await loadFoldersForDirectory(selectedDirectory);
      } else {
        await loadConfig();
      }
      setMessage({ type: 'success', text: `Repositories scan completed. Found ${result.count} repositories.` });
    } catch {
      // no-op
      setMessage({ type: 'error', text: 'Failed to refresh repositories' });
    } finally {
      setIsRefreshingRepositories(false);
    }
  };

  if (loading) {
    return <RepositoriesLoading selectedFolder={selectedFolder} selectedDirectory={selectedDirectory} />;
  }

  if (error) {
    return (
      <RepositoriesError
        error={error}
        selectedFolder={selectedFolder}
        selectedDirectory={selectedDirectory}
        onRetry={() => selectedFolder ? loadRepositoryInfo(selectedFolder.path, selectedDirectory.tag) :
          selectedDirectory ? loadFoldersForDirectory(selectedDirectory) : loadConfig()}
      />
    );
  }

  if (!config?.enabled) {
    return <RepositoriesDisabled onSettingsClick={() => window.location.hash = '#/config'} />;
  }

  // Show directories list
  if (!selectedDirectory) {
    return (
      <div className="min-h-screen p-6">
        <RepositoriesHeader
          title="Repositories"
          subtitle={config?.directories?.length > 0
            ? `${config.directories.length} directory${config.directories.length > 1 ? 'ies' : 'y'} configured`
            : 'No directories configured'
          }
          cacheStatus={cacheStatus}
          onRefresh={rescanAndReloadCurrent}
          onRefreshConfig={loadConfig}
          onSettings={() => window.location.hash = '#/config'}
          loading={loading}
          isRefreshingRepositories={isRefreshingRepositories}
          onBack={null}
        />

        <RepositoriesDirectories
          directories={config?.directories}
          onDirectoryClick={loadFoldersForDirectory}
          onSettingsClick={() => window.location.hash = '#/config'}
        />

        {/* Toast Messages */}
        {message.text && (
          <ToastComponent
            message={{ type: message.type, text: message.text }}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}
      </div>
    );
  }

  // Show folders list for selected directory
  if (!selectedFolder) {
    return (
      <div className="min-h-screen p-6">
        <RepositoriesHeader
          title={`${selectedDirectory.tag || 'Untagged'} Repositories`}
          subtitle={selectedDirectory.path}
          cacheStatus={cacheStatus}
          onRefresh={rescanAndReloadCurrent}
          onRefreshConfig={loadConfig}
          onSettings={() => window.location.hash = '#/config'}
          loading={loading}
          isRefreshingRepositories={isRefreshingRepositories}
          onBack={goBackToDirectories}
        />

        <RepositoriesSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredCount={filteredRepositories.length}
          totalCount={repositories.length}
          searchInputRef={searchInputRef}
        />

        <RepositoriesFolders
          repositories={repositories}
          filteredRepositories={filteredRepositories}
          searchQuery={searchQuery}
          onFolderClick={(folder) => loadRepositoryInfo(folder.path, selectedDirectory.tag)}
          onRefresh={() => loadFoldersForDirectory(selectedDirectory)}
          loading={loading}
        />

        {/* Toast Messages */}
        {message.text && (
          <ToastComponent
            message={{ type: message.type, text: message.text }}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}
      </div>
    );
  }

  // Show repository details for selected folder
  return (
    <RepositoriesDetails
      selectedFolder={selectedFolder}
      selectedDirectory={selectedDirectory}
      appConfig={appConfig}
      repositoryCommits={repositoryCommits}
      onBack={goBackToFolders}
      onRefresh={() => loadRepositoryInfo(selectedFolder.path, selectedDirectory.tag, true)}
      onSettings={() => window.location.hash = '#/config'}
      onOpenRepository={handleOpenRepository}
      onOpenInEditor={handleOpenInEditor}
      onRefreshCommits={() => loadRepositoryCommits(selectedFolder.path, true)}
      loading={loading}
    />
  );
};

export default Repositories;
