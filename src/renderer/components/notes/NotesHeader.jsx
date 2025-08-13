import React from 'react';
import { Save, X } from 'lucide-react';

const NotesHeader = ({ onSave, onCancel, showActions }) => {
  return (
    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Organize notes by notebooks. Edit and preview Markdown.</p>
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <button onClick={onSave} className="px-3 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            <Save className="w-4 h-4 inline mr-1" /> Save
          </button>
          <button onClick={onCancel} className="px-3 py-2 rounded-lg font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
            <X className="w-4 h-4 inline mr-1" /> Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesHeader;

