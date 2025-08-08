import React from 'react'
import { 
  Filter, 
  RefreshCw, 
  Download, 
  Upload, 
  Save 
} from 'lucide-react'

const ConfigurationActions = ({ 
  saving, 
  onClearCache, 
  onTriggerBackgroundRefresh, 
  onExportConfig, 
  onImportConfig, 
  onSaveConfig 
}) => {
  return (
    <div className="border-t p-6" style={{ borderColor: 'var(--border-primary)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClearCache}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1px solid rgba(107, 114, 128, 0.2)',
              color: 'var(--text-secondary)'
            }}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Clear Cache
          </button>
          
          <button
            onClick={onTriggerBackgroundRefresh}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: 'var(--accent-primary)'
            }}
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh Data
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onExportConfig}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--success)'
            }}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
          
          <button
            onClick={onImportConfig}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: 'var(--warning)'
            }}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Import
          </button>
          
          <button
            onClick={onSaveConfig}
            disabled={saving}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfigurationActions

