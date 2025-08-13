import React from 'react';
import { FolderPlus, Search, Tag, Plus } from 'lucide-react';

const NotesSidebar = ({
  notebooks,
  activeNotebookId,
  setActiveNotebookId,
  search,
  setSearch,
  selectedTags,
  toggleTag,
  clearTags,
  availableTags,
  tagFilterMode,
  setTagFilterMode,
  filteredNotes,
  onNewNote,
  onOpenCreateNotebook,
  onSelectNote
}) => {
  return (
    <div className="w-96 border-r flex flex-col" style={{ borderColor: 'var(--border-primary)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Notebook</label>
          <div className="flex items-center gap-2">
            <select
              value={activeNotebookId}
              onChange={(e) => setActiveNotebookId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              {notebooks.map(nb => (
                <option key={nb.id} value={nb.id}>
                  {nb.icon} {nb.name}
                </option>
              ))}
            </select>
            <button onClick={onOpenCreateNotebook} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="relative">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes" className="w-full px-3 py-2 rounded-lg border focus:outline-none" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tags</span>
          <div className="flex items-center gap-2">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Mode</div>
            <div className="flex rounded-md overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                onClick={() => setTagFilterMode('OR')}
                className={`px-2 py-1 text-xs ${tagFilterMode === 'OR' ? 'font-semibold' : ''}`}
                style={{
                  backgroundColor: tagFilterMode === 'OR' ? 'var(--accent-primary)' : 'transparent',
                  color: tagFilterMode === 'OR' ? 'white' : 'var(--text-primary)'
                }}
              >
                OR
              </button>
              <button
                onClick={() => setTagFilterMode('AND')}
                className={`px-2 py-1 text-xs ${tagFilterMode === 'AND' ? 'font-semibold' : ''}`}
                style={{
                  backgroundColor: tagFilterMode === 'AND' ? 'var(--accent-primary)' : 'transparent',
                  color: tagFilterMode === 'AND' ? 'white' : 'var(--text-primary)'
                }}
              >
                AND
              </button>
            </div>
            {selectedTags.length > 0 && (
              <button onClick={clearTags} className="text-xs underline" style={{ color: 'var(--text-muted)' }}>Clear</button>
            )}
          </div>
        </div>
        {availableTags.length === 0 ? (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No tags</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTags.map(t => {
              const active = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${active ? 'bg-opacity-100' : ''}`}
                  style={{
                    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
                    color: active ? 'white' : 'var(--text-primary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <Tag className="w-3 h-3 inline mr-1" /> {t}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filteredNotes.length} note{filteredNotes.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={onNewNote} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
          <Plus className="w-4 h-4 inline mr-1" /> New note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center p-6" style={{ color: 'var(--text-muted)' }}>
            No notes found
          </div>
        ) : (
          <div className="space-y-1">
            {filteredNotes.map(note => (
              <div key={note.id} className="px-3 py-2 rounded-md hover:bg-opacity-10 cursor-pointer" onClick={() => onSelectNote(note)} style={{ color: 'var(--text-primary)' }}>
                <div className="font-medium truncate">{note.title || 'Untitled'}</div>
                <div className="text-xs opacity-70 truncate" style={{ color: 'var(--text-muted)' }}>{new Date(note.updatedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSidebar;

