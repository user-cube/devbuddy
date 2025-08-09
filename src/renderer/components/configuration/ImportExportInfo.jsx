import React from 'react';
import { Download } from 'lucide-react';

const ImportExportInfo = () => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Download className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Import & Export Configuration
        </h2>
      </div>
      <div className="space-y-3">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Export your configuration to backup or share with your team. Import configuration files to quickly set up DevBuddy on a new machine.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Export includes:</strong>
            <ul className="mt-1 space-y-1">
              <li>• All integration settings (Jira, GitHub, GitLab)</li>
              <li>• Local shortcuts configuration</li>
              <li>• Redirect rules</li>
              <li>• App preferences</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Import features:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Automatic backup of current config</li>
              <li>• Version compatibility check</li>
              <li>• Validation of file format</li>
              <li>• Real-time updates after import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportInfo;

