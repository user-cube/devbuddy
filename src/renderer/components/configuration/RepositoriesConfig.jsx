import React from 'react';
import { Folder } from 'lucide-react';
import { createDirectoryEntry, updateDirectory, removeDirectory } from './ConfigurationUtils';

const RepositoriesConfig = ({ repositoriesConfig, updateRepositoriesConfig }) => {
  const handleSelectPath = async () => {
    try {
      if (window.electronAPI && window.electronAPI.selectDirectory) {
        const result = await window.electronAPI.selectDirectory();
        if (result && result.success && result.folderPath) {
          const newDirectory = createDirectoryEntry(result.folderPath);
          const updatedDirectories = [...(repositoriesConfig?.directories || []), newDirectory];
          updateRepositoriesConfig('directories', updatedDirectories);
        }
      }
    } catch {
      // no-op
    }
  };

  const handleRemoveDirectory = (directoryId) => {
    const updatedDirectories = removeDirectory(repositoriesConfig?.directories || [], directoryId);
    updateRepositoriesConfig('directories', updatedDirectories);
  };

  const handleUpdateDirectory = (directoryId, field, value) => {
    const updatedDirectories = updateDirectory(repositoriesConfig?.directories || [], directoryId, field, value);
    updateRepositoriesConfig('directories', updatedDirectories);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <Folder className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Local Repositories</h2>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={repositoriesConfig?.enabled || false}
            onChange={(e) => updateRepositoriesConfig('enabled', e.target.checked)}
            className="w-4 h-4 rounded"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              accentColor: 'var(--accent-primary)'
            }}
          />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable</span>
        </label>
      </div>

      {repositoriesConfig?.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Scan Depth</label>
              <input
                type="number"
                min="1"
                max="10"
                value={repositoriesConfig?.scanDepth || 3}
                onChange={(e) => updateRepositoriesConfig('scanDepth', parseInt(e.target.value) || 3)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                How deep to scan for repositories (1-10 levels)
              </p>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Add Directory</label>
              <button
                onClick={handleSelectPath}
                className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'var(--accent-primary)'
                }}
              >
                Browse
              </button>
            </div>
          </div>

          {/* Directories List */}
          {repositoriesConfig?.directories && repositoriesConfig.directories.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Directories</h4>
              {repositoriesConfig.directories.map((directory) => (
                <div
                  key={directory.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={directory.enabled}
                        onChange={(e) => handleUpdateDirectory(directory.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {directory.path}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveDirectory(directory.id)}
                      className="text-sm px-2 py-1 rounded transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--error)'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tag (optional)"
                    value={directory.tag || ''}
                    onChange={(e) => handleUpdateDirectory(directory.id, 'tag', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoriesConfig;
