import React, { useState, useEffect } from 'react';

import { AlertCircle, Settings } from 'lucide-react';

const ProtectedRoute = ({ integration, children }) => {
  const [config, setConfig] = useState(null);
  const [repositoriesConfig, setRepositoriesConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        if (integration === 'repositories') {
          const [repositoriesConfig] = await Promise.all([
            window.electronAPI.getRepositoriesConfig()
          ]);
          setConfig(null);
          setRepositoriesConfig(repositoriesConfig);
        } else {
          const [mainConfig] = await Promise.all([
            window.electronAPI.getConfig()
          ]);
          setConfig(mainConfig);
          setRepositoriesConfig(null);
        }
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, [integration]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if the integration is enabled
  let isEnabled = false;

  if (integration === 'repositories') {
    isEnabled = repositoriesConfig?.enabled || false;
  } else {
    isEnabled = config?.[integration]?.enabled || false;
  }

  if (!isEnabled) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--warning)' }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {integration.charAt(0).toUpperCase() + integration.slice(1)} Integration Disabled
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            The {integration} integration is not enabled in your configuration.
            Please enable it in the Configuration page to access this feature.
          </p>
          <button
            onClick={() => window.location.hash = '#/config'}
            className="btn-primary flex items-center gap-2 px-6 py-3 mx-auto"
          >
            <Settings className="w-5 h-5" />
            Go to Configuration
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
