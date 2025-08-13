import React from 'react';
import { Settings } from 'lucide-react';

const AppSettings = ({ config, updateConfig, setThemeValue }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <Settings className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>App Settings</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Theme</label>
            <select
              value={config?.app?.theme || 'dark'}
              onChange={(e) => {
                updateConfig('app', 'theme', e.target.value);
                setThemeValue(e.target.value);
              }}
              className="w-full rounded-lg px-3 py-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Default Editor</label>
            <select
              value={config?.app?.defaultEditor || 'vscode'}
              onChange={(e) => updateConfig('app', 'defaultEditor', e.target.value)}
              className="w-full rounded-lg px-3 py-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="vscode">VS Code</option>
              <option value="cursor">Cursor</option>
            </select>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Default editor for opening repositories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Redirector Port</label>
            <input
              type="number"
              min="1024"
              max="65535"
              value={config?.app?.redirectorPort || 10000}
              onChange={(e) => updateConfig('app', 'redirectorPort', parseInt(e.target.value) || 10000)}
              className="w-full rounded-lg px-3 py-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Port for local redirector server (1024-65535)
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto Start</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Start DevBuddy automatically when you log in
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.app?.autoStart || false}
                onChange={async (e) => {
                  updateConfig('app', 'autoStart', e.target.checked);
                  try { await window.electronAPI.configureAutoLaunch(e.target.checked); } catch {
                    // no-op
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Notifications</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Show desktop notifications for updates and events
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.app?.notifications || true}
                onChange={(e) => updateConfig('app', 'notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Background Refresh</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Automatically refresh data in the background
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.app?.backgroundRefresh || true}
                onChange={(e) => updateConfig('app', 'backgroundRefresh', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Minimize to Tray on Close</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Hide the window to system tray instead of quitting when closing
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.app?.minimizeToTray ?? true}
                onChange={(e) => updateConfig('app', 'minimizeToTray', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Start Minimized to Tray</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Launch DevBuddy hidden in the tray on startup
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.app?.startMinimized ?? false}
                onChange={(e) => updateConfig('app', 'startMinimized', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;

