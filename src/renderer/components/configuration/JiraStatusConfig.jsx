import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Save,

  RefreshCw,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import ToastComponent from '../layout/Toast';

const JiraStatusConfig = ({ config, updateConfig, onBack }) => {
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const statuses = await window.electronAPI.getJiraAvailableStatuses();
        setAvailableStatuses(statuses);
      }
    } catch {
      // no-op
      setMessage({ type: 'error', text: 'Error loading statuses from Jira' });
    } finally {
      setLoading(false);
    }
  };

  const saveStatusConfig = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (window.electronAPI) {
        await window.electronAPI.saveConfig(config);
        await window.electronAPI.clearJiraCache();
        setMessage({
          type: 'success',
          text: 'Status configuration saved! Jira cache cleared - new filters will be applied on next data refresh.'
        });

        // Dispatch event to notify other components about config changes
        window.dispatchEvent(new CustomEvent('config-changed'));
      }
    } catch {
      // no-op
      setMessage({ type: 'error', text: 'Error saving configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateStatusConfig = (key, value) => {
    updateConfig('jira', key, value);
  };

  const toggleExcludedStatus = (statusName) => {
    const current = config?.jira?.excludedStatuses || [];
    const updated = current.includes(statusName)
      ? current.filter(s => s !== statusName)
      : [...current, statusName];
    updateStatusConfig('excludedStatuses', updated);
  };

  const toggleIncludedStatus = (statusName) => {
    const current = config?.jira?.includedStatuses || [];
    const updated = current.includes(statusName)
      ? current.filter(s => s !== statusName)
      : [...current, statusName];
    updateStatusConfig('includedStatuses', updated);
  };

  const clearIncludedStatuses = () => {
    updateStatusConfig('includedStatuses', []);
  };

  const clearExcludedStatuses = () => {
    updateStatusConfig('excludedStatuses', []);
  };

  const filteredStatuses = availableStatuses.filter(status =>
    status.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isStatusExcluded = (statusName) => {
    return config?.jira?.excludedStatuses?.includes(statusName) || false;
  };

  const isStatusIncluded = (statusName) => {
    return config?.jira?.includedStatuses?.includes(statusName) || false;
  };

  const getStatusDisplayStatus = (statusName) => {
    const excluded = isStatusExcluded(statusName);
    const included = isStatusIncluded(statusName);
    const hasIncludedFilter = config?.jira?.includedStatuses?.length > 0;

    if (excluded) return 'excluded';
    if (hasIncludedFilter && !included) return 'hidden';
    return 'visible';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
            Loading Jira statuses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={onBack}
                className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.2)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  color: 'var(--text-secondary)'
                }}
              >
                ←
              </button>
              <GitBranch className="w-8 h-8" style={{ color: '#3b82f6' }} />
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Jira Status Configuration
              </h1>
            </div>

            {/* Configuration Summary */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Filter Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <EyeOff className="w-4 h-4" style={{ color: 'var(--error)' }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Excluded Statuses
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {config?.jira?.excludedStatuses?.length || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Hidden from dashboard
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Included Statuses
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {config?.jira?.includedStatuses?.length || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {config?.jira?.includedStatuses?.length > 0 ? 'Whitelist mode' : 'All non-excluded'}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Total Available
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {availableStatuses.length}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Statuses from Jira
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearExcludedStatuses}
                  className="px-3 py-1 text-sm rounded-lg font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--error)'
                  }}
                >
              Clear Excluded
                </button>
                <button
                  onClick={clearIncludedStatuses}
                  className="px-3 py-1 text-sm rounded-lg font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--success)'
                  }}
                >
              Clear Included
                </button>
                <button
                  onClick={loadStatuses}
                  className="px-3 py-1 text-sm rounded-lg font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
              Refresh
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search statuses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg px-4 py-3 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Statuses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStatuses.map((status) => {
                const displayStatus = getStatusDisplayStatus(status.name);

                return (
                  <div
                    key={status.id}
                    className="p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105"
                    style={{
                      backgroundColor: displayStatus === 'excluded'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : displayStatus === 'hidden'
                          ? 'rgba(156, 163, 175, 0.1)'
                          : 'rgba(16, 185, 129, 0.1)',
                      borderColor: displayStatus === 'excluded'
                        ? 'rgba(239, 68, 68, 0.5)'
                        : displayStatus === 'hidden'
                          ? 'rgba(156, 163, 175, 0.5)'
                          : 'rgba(16, 185, 129, 0.5)'
                    }}
                    onClick={() => toggleExcludedStatus(status.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {status.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {displayStatus === 'excluded' && (
                          <EyeOff className="w-4 h-4" style={{ color: 'var(--error)' }} />
                        )}
                        {displayStatus === 'hidden' && (
                          <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        )}
                        {displayStatus === 'visible' && (
                          <Eye className="w-4 h-4" style={{ color: 'var(--success)' }} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: displayStatus === 'excluded'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : displayStatus === 'hidden'
                              ? 'rgba(156, 163, 175, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color: displayStatus === 'excluded'
                            ? 'var(--error)'
                            : displayStatus === 'hidden'
                              ? 'var(--text-muted)'
                              : 'var(--success)'
                        }}
                      >
                        {displayStatus === 'excluded' ? 'Excluded' :
                          displayStatus === 'hidden' ? 'Hidden' : 'Visible'}
                      </span>

                      {config?.jira?.includedStatuses?.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIncludedStatus(status.name);
                          }}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: isStatusIncluded(status.name)
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(156, 163, 175, 0.2)',
                            color: isStatusIncluded(status.name)
                              ? 'var(--accent-primary)'
                              : 'var(--text-muted)'
                          }}
                        >
                          {isStatusIncluded(status.name) ? 'Included' : 'Include'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStatuses.length === 0 && (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-muted)' }}>
                  {searchTerm ? 'No statuses found matching your search.' : 'No statuses available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer - Action Buttons */}
      <div className="flex-shrink-0 p-6" style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-primary)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                color: 'var(--text-secondary)'
              }}
            >
              Back to Configuration
            </button>
            <button
              onClick={saveStatusConfig}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastComponent
        message={message}
        onClose={() => setMessage({ type: '', text: '' })}
        duration={4000}
      />
    </div>
  );
};

export default JiraStatusConfig;
