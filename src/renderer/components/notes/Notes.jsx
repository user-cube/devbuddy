import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, Tag, BookOpen } from 'lucide-react';
import Loading from '../layout/Loading';
import { Toast } from '../../hooks/useToast';
import { NotesHeader, NotesSidebar, NotesEditor } from './index.js';

// Cache to avoid repeated IPC conversions and re-fetching
const mediaUrlCache = new Map();

const Notes = () => {
  const [loading, setLoading] = useState(true);
  const [notebooks, setNotebooks] = useState([]);
  const LAST_NOTEBOOK_KEY = 'devbuddy:notes:last-notebook';
  const getLastNotebookId = () => {
    try { return localStorage.getItem(LAST_NOTEBOOK_KEY); } catch { return null; }
  };
  const [activeNotebookId, setActiveNotebookId] = useState(() => getLastNotebookId() || 'general');
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef(null);
  const [editorTags, setEditorTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [notebookForm, setNotebookForm] = useState({ name: '', description: '', color: '#6B7280', icon: '📒' });
  const [tagFilterMode, setTagFilterMode] = useState('OR'); // OR | AND

  // Persist/retrieve last opened note per notebook in localStorage
  const LAST_NOTE_KEY_PREFIX = 'devbuddy:notes:last-opened';
  const getLastOpenedNoteId = (notebookId) => {
    try {
      return localStorage.getItem(`${LAST_NOTE_KEY_PREFIX}:${notebookId}`);
    } catch {
      return null;
    }
  };
  const setLastOpenedNoteId = (notebookId, noteId) => {
    try {
      localStorage.setItem(`${LAST_NOTE_KEY_PREFIX}:${notebookId}`, noteId);
    } catch {
      // no-op
    }
  };

  const SafeImage = (props) => {
    const { src: originalSrc, ...rest } = props;
    const [src, setSrc] = useState(() => mediaUrlCache.get(originalSrc) || '');
    useEffect(() => {
      let isMounted = true;
      const fix = async () => {
        try {
          if (!originalSrc) return;
          // Use cache first
          if (mediaUrlCache.has(originalSrc)) {
            if (isMounted) setSrc(mediaUrlCache.get(originalSrc));
            return;
          }
          let out = originalSrc;
          if (originalSrc.startsWith('file://') || originalSrc.startsWith('/')) {
            const dataUrl = await window.electronAPI.fileToDataUrl(originalSrc);
            if (dataUrl) out = dataUrl;
          }
          mediaUrlCache.set(originalSrc, out);
          if (isMounted) setSrc(out);
        } catch {
          // no-op
        }
      };
      fix();
      return () => { isMounted = false; };
    }, [originalSrc]);
    return <img {...rest} src={src} alt={rest.alt || ''} style={{ maxWidth: '100%', borderRadius: '0.5rem', ...(rest.style || {}) }} />;
  };

  const SafeVideo = (props) => {
    const { src: originalSrc, ...rest } = props;
    const [src, setSrc] = useState(() => mediaUrlCache.get(originalSrc) || '');
    useEffect(() => {
      let isMounted = true;
      const fix = async () => {
        try {
          if (!originalSrc) return;
          if (mediaUrlCache.has(originalSrc)) {
            if (isMounted) setSrc(mediaUrlCache.get(originalSrc));
            return;
          }
          let out = originalSrc;
          if (originalSrc.startsWith('file://') || originalSrc.startsWith('/')) {
            const dataUrl = await window.electronAPI.fileToDataUrl(originalSrc);
            if (dataUrl) out = dataUrl;
          }
          mediaUrlCache.set(originalSrc, out);
          if (isMounted) setSrc(out);
        } catch {
          // no-op
        }
      };
      fix();
      return () => { isMounted = false; };
    }, [originalSrc]);
    return <video {...rest} src={src} controls style={{ maxWidth: '100%', borderRadius: '0.5rem', ...(rest.style || {}) }} />;
  };

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    if (activeNotebookId) {
      loadNotes(activeNotebookId);
    }
    // Reset tag filters when notebook changes
    setSelectedTags([]);
  }, [activeNotebookId]);

  // Persist active notebook selection
  useEffect(() => {
    try { localStorage.setItem(LAST_NOTEBOOK_KEY, activeNotebookId); } catch {}
  }, [activeNotebookId]);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getNotebooks();
      setNotebooks(data);
      if (Array.isArray(data) && data.length > 0) {
        const saved = getLastNotebookId();
        const hasSaved = saved && data.some(n => n.id === saved);
        const hasActive = data.some(n => n.id === activeNotebookId);
        if (hasSaved && activeNotebookId !== saved) {
          setActiveNotebookId(saved);
        } else if (!hasActive) {
          setActiveNotebookId(data[0].id);
        }
      }
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (notebookId) => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getNotes(notebookId);
      setNotes(data);
      // Auto-open last used note (or most recently updated)
      if (Array.isArray(data) && data.length > 0) {
        const lastId = getLastOpenedNoteId(notebookId);
        const last = data.find(n => n.id === lastId);
        const fallback = [...data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        const toOpen = last || fallback;
        if (toOpen) {
          if (!editingNote || editingNote.id !== toOpen.id) {
            startEdit(toOpen);
          }
        }
      }
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  // Safety: if notes change and nothing is open, try open last/fallback
  useEffect(() => {
    if (!editingNote && Array.isArray(notes) && notes.length > 0) {
      const lastId = getLastOpenedNoteId(activeNotebookId);
      const last = notes.find(n => n.id === lastId);
      const fallback = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
      const toOpen = last || fallback;
      if (toOpen) {
        startEdit(toOpen);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, activeNotebookId]);

  const filteredNotes = useMemo(() => {
    const q = (search || '').toLowerCase();
    let base = notes;
    if (q) {
      base = base.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) {
      base = base.filter(n => (
        tagFilterMode === 'OR'
          ? selectedTags.some(tag => (n.tags || []).includes(tag))
          : selectedTags.every(tag => (n.tags || []).includes(tag))
      ));
    }
    return base;
  }, [notes, search, selectedTags, tagFilterMode]);

  const availableTags = useMemo(() => {
    const set = new Set();
    notes.forEach(n => (n.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const toggleTag = (t) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };
  const clearTags = () => setSelectedTags([]);

  const startNewNote = async () => {
    const created = await window.electronAPI.createNote(activeNotebookId, { title: 'Untitled', content: '' });
    setNotes(prev => [created, ...prev]);
    startEdit(created);
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorTags(note.tags || []);
    setLastOpenedNoteId(activeNotebookId, note.id);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditorTitle('');
    setEditorContent('');
    setEditorTags([]);
    setNewTag('');
  };

  const saveNote = async () => {
    if (!editingNote) return;
    try {
      const updated = await window.electronAPI.updateNote(activeNotebookId, editingNote.id, {
        title: editorTitle.trim() || 'Untitled',
        content: editorContent,
        tags: editorTags
      });
      setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      setEditingNote(updated);
      setLastOpenedNoteId(activeNotebookId, updated.id);
      Toast.success('Note saved');
    } catch {
      Toast.error('Failed to save note');
    }
  };

  const deleteNote = async (note) => {
    await window.electronAPI.deleteNote(activeNotebookId, note.id);
    setNotes(prev => prev.filter(n => n.id !== note.id));
    if (editingNote && editingNote.id === note.id) cancelEdit();
  };

  const insertAtCursor = (snippet) => {
    // Insert snippet at the current cursor position in the textarea
    if (editorRef.current) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const before = editorContent.slice(0, start);
      const after = editorContent.slice(end);
      const next = `${before}${snippet}${after}`;
      setEditorContent(next);
      // Restore caret after inserted snippet
      setTimeout(() => {
        textarea.focus();
        const caret = start + snippet.length;
        textarea.setSelectionRange(caret, caret);
      }, 0);
    } else {
      setEditorContent(prev => `${prev}${snippet}`);
    }
  };

  // (helpers removed as unused)

  const handleInsertImage = async () => {
    const res = await window.electronAPI.selectFile();
    if (!res || !res.success || !res.filePath) return;
    // Import into notebook assets for stable path in ~/.devbuddy/notes
    const imported = await window.electronAPI.importNoteAsset(activeNotebookId, res.filePath);
    if (imported && imported.success) {
      const alt = res.fileName || 'image';
      insertAtCursor(`\n\n![${alt}](${imported.filePath})\n\n`);
    }
  };

  const handleInsertVideo = async () => {
    const res = await window.electronAPI.selectFile();
    if (!res || !res.success || !res.filePath) return;
    const imported = await window.electronAPI.importNoteAsset(activeNotebookId, res.filePath);
    if (imported && imported.success) {
      insertAtCursor(`\n\n<video src="${imported.filePath}" controls></video>\n\n`);
    }
  };

  const handlePaste = async (e) => {
    if (!editingNote) return;
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    if (!items || items.length === 0) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (!file) continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const mime = file.type || '';
        let ext = 'png';
        if (mime.includes('jpeg')) ext = 'jpg';
        else if (mime.includes('png')) ext = 'png';
        else if (mime.includes('gif')) ext = 'gif';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('mp4')) ext = 'mp4';
        else if (mime.includes('mov')) ext = 'mov';

        const saved = await window.electronAPI.saveNoteAsset(activeNotebookId, buffer, ext);
        if (saved && saved.success && (saved.filePath || saved.url)) {
          const pathOrUrl = saved.filePath || saved.url;
          if (mime.startsWith('video/')) insertAtCursor(`\n\n<video src="${pathOrUrl}" controls></video>\n\n`);
          else insertAtCursor(`\n\n![pasted-image](${pathOrUrl})\n\n`);
          e.preventDefault();
        }
      }
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t) return;
    if (!editorTags.includes(t)) setEditorTags(prev => [...prev, t]);
    setNewTag('');
  };

  const removeTag = (t) => {
    setEditorTags(prev => prev.filter(x => x !== t));
  };

  const openCreateNotebook = () => {
    setNotebookForm({ name: '', description: '', color: '#6B7280', icon: '📒' });
    setShowNotebookModal(true);
  };

  const createNotebook = async () => {
    const created = await window.electronAPI.createNotebook(notebookForm);
    await loadNotebooks();
    setActiveNotebookId(created.id);
    setShowNotebookModal(false);
  };

  if (loading && notebooks.length === 0 && notes.length === 0) {
    return <Loading message="Loading notes..." />;
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left: Notebook selector and Notes list */}
      <NotesSidebar
        notebooks={notebooks}
        activeNotebookId={activeNotebookId}
        setActiveNotebookId={setActiveNotebookId}
        search={search}
        setSearch={setSearch}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        clearTags={clearTags}
        availableTags={availableTags}
        tagFilterMode={tagFilterMode}
        setTagFilterMode={setTagFilterMode}
        filteredNotes={filteredNotes}
        onNewNote={startNewNote}
        onOpenCreateNotebook={openCreateNotebook}
        onSelectNote={startEdit}
      />

      {/* Right: Editor / Preview */}
      <div className="flex-1 flex flex-col">
        <NotesHeader onSave={saveNote} onCancel={cancelEdit} showActions={!!editingNote} />

        {!editingNote ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <BookOpen className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Select or create a note</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Choose a note from the list or create a new one to start editing.</p>
              <button onClick={startNewNote} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <Plus className="w-4 h-4 inline mr-1" /> New note
              </button>
            </div>
          </div>
        ) : (
          <NotesEditor
            editorTitle={editorTitle}
            setEditorTitle={setEditorTitle}
            editorContent={editorContent}
            setEditorContent={setEditorContent}
            editorRef={editorRef}
            onPaste={handlePaste}
            onInsertImage={handleInsertImage}
            onInsertVideo={handleInsertVideo}
            SafeImage={SafeImage}
            SafeVideo={SafeVideo}
            TagsSection={(
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tags</label>
                <div className="flex gap-2">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1 px-3 py-2 rounded-lg border focus:outline-none" placeholder="Add a tag" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                  <button onClick={addTag} disabled={!newTag.trim()} className="px-3 py-2 rounded-lg font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>Add</button>
                </div>
                {editorTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editorTags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                        <Tag className="w-3 h-3" /> {t}
                        <button className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5" onClick={() => removeTag(t)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <button onClick={() => deleteNote(editingNote)} className="px-3 py-2 rounded-lg font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                    Delete note
                  </button>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Create Notebook Modal */}
      {showNotebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowNotebookModal(false)} />
          <div className="relative w-full max-w-md rounded-lg border shadow-xl" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>New Notebook</h2>
              <button onClick={() => setShowNotebookModal(false)} className="p-1 rounded-full" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input value={notebookForm.name} onChange={(e) => setNotebookForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Name" className="w-full px-3 py-2 rounded-lg border focus:outline-none" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              <input value={notebookForm.icon} onChange={(e) => setNotebookForm(prev => ({ ...prev, icon: e.target.value }))} placeholder="Icon (emoji)" className="w-full px-3 py-2 rounded-lg border focus:outline-none" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              <input type="color" value={notebookForm.color} onChange={(e) => setNotebookForm(prev => ({ ...prev, color: e.target.value }))} className="w-full h-10 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }} />
              <textarea value={notebookForm.description} onChange={(e) => setNotebookForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Description" className="w-full px-3 py-2 rounded-lg border focus:outline-none resize-none" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNotebookModal(false)} className="flex-1 px-4 py-2 rounded-lg border font-medium" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>Cancel</button>
                <button onClick={createNotebook} disabled={!notebookForm.name.trim()} className="flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;

