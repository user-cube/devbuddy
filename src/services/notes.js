const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

class NotesService {
  constructor () {
    this.baseDir = path.join(os.homedir(), '.devbuddy', 'notes');
    this.indexFile = path.join(this.baseDir, 'index.yml');
    this.ensureBaseDir();
  }

  ensureBaseDir () {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  ensureNotebookDir (notebookId) {
    const notebookDir = path.join(this.baseDir, notebookId);
    if (!fs.existsSync(notebookDir)) {
      fs.mkdirSync(notebookDir, { recursive: true });
    }
    return notebookDir;
  }

  getAssetsDir (notebookId) {
    const dir = path.join(this.ensureNotebookDir(notebookId), 'assets');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  generateId () {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }

  getDefaultNotebooks () {
    return [
      {
        id: 'general',
        name: 'General',
        description: 'Default notebook',
        color: '#3B82F6',
        icon: '📒',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  loadNotebooks () {
    try {
      if (!fs.existsSync(this.indexFile)) {
        const defaults = this.getDefaultNotebooks();
        this.saveNotebooks(defaults);
        // Ensure default dir exists
        this.ensureNotebookDir('general');
        return defaults;
      }
      const data = fs.readFileSync(this.indexFile, 'utf8');
      const notebooks = yaml.load(data) || this.getDefaultNotebooks();
      return notebooks;
    } catch (error) {
      console.error('Error loading notebooks:', error);
      return this.getDefaultNotebooks();
    }
  }

  saveNotebooks (notebooks) {
    try {
      const content = yaml.dump(notebooks, { indent: 2, lineWidth: 120, noRefs: true });
      fs.writeFileSync(this.indexFile, content, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving notebooks:', error);
      return false;
    }
  }

  getNotebooks () {
    return this.loadNotebooks();
  }

  createNotebook (data) {
    const notebooks = this.loadNotebooks();
    // Prevent duplicate names
    if (data.name && notebooks.some(nb => nb.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error(`A notebook named "${data.name}" already exists`);
    }
    const notebook = {
      id: data.id || this.generateId(),
      name: data.name || 'Untitled',
      description: data.description || '',
      color: data.color || '#6B7280',
      icon: data.icon || '📒',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notebooks.push(notebook);
    this.saveNotebooks(notebooks);
    this.ensureNotebookDir(notebook.id);
    return notebook;
  }

  updateNotebook (id, updates) {
    const notebooks = this.loadNotebooks();
    const index = notebooks.findIndex(nb => nb.id === id);
    if (index === -1) {
      throw new Error('Notebook not found');
    }
    if (updates.name && updates.name !== notebooks[index].name) {
      const exists = notebooks.some(nb => nb.id !== id && nb.name.toLowerCase() === updates.name.toLowerCase());
      if (exists) {
        throw new Error(`A notebook named "${updates.name}" already exists`);
      }
    }
    notebooks[index] = { ...notebooks[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveNotebooks(notebooks);
    return notebooks[index];
  }

  deleteNotebook (id) {
    if (id === 'general') {
      throw new Error('Cannot delete the default "General" notebook');
    }
    const notebooks = this.loadNotebooks();
    const filtered = notebooks.filter(nb => nb.id !== id);
    if (filtered.length === notebooks.length) {
      throw new Error('Notebook not found');
    }
    this.saveNotebooks(filtered);
    // Remove directory and notes
    const notebookDir = path.join(this.baseDir, id);
    if (fs.existsSync(notebookDir)) {
      fs.readdirSync(notebookDir).forEach(f => {
        fs.unlinkSync(path.join(notebookDir, f));
      });
      fs.rmdirSync(notebookDir);
    }
    return true;
  }

  // Notes
  getNotes (notebookId) {
    try {
      const dir = this.ensureNotebookDir(notebookId);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml'));
      const notes = files.map(file => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const data = yaml.load(raw) || {};
        return {
          id: data.id || path.basename(file, '.yml'),
          title: data.title || 'Untitled',
          content: data.content || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      });
      // Sort recent first
      return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  getNote (notebookId, noteId) {
    const dir = this.ensureNotebookDir(notebookId);
    const filePath = path.join(dir, `${noteId}.yml`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(raw) || {};
    return {
      id: data.id || noteId,
      title: data.title || 'Untitled',
      content: data.content || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
  }

  saveAsset (notebookId, buffer, ext) {
    try {
      const assetsDir = this.getAssetsDir(notebookId);
      const safeExt = (ext || 'png').replace(/[^a-z0-9]/gi, '').toLowerCase();
      const fileName = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
      const filePath = path.join(assetsDir, fileName);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (error) {
      console.error('Error saving note asset:', error);
      throw error;
    }
  }

  normalizeAssetPath (notebookId, maybeUrl) {
    if (!maybeUrl) return '';
    let p = maybeUrl;
    if (p.startsWith('file://')) p = p.replace('file://', '');
    try { p = decodeURI(p); } catch {
      // no-op
    }
    // Ensure it belongs to this notebook's assets
    const assetsDir = this.getAssetsDir(notebookId);
    if (p.startsWith(assetsDir)) return p;
    return '';
  }

  extractAssetPathsFromContent (notebookId, content) {
    try {
      if (!content) return [];
      const results = new Set();
      const mdLinkRegex = /!\[[^\]]*\]\(([^)]+)\)/g; // captures inside ()
      const htmlSrcRegex = /<(?:img|video)[^>]*src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = mdLinkRegex.exec(content)) !== null) {
        const raw = match[1].trim();
        const withoutAngles = raw.startsWith('<') && raw.endsWith('>') ? raw.slice(1, -1) : raw;
        const normalized = this.normalizeAssetPath(notebookId, withoutAngles);
        if (normalized) results.add(normalized);
      }
      while ((match = htmlSrcRegex.exec(content)) !== null) {
        const raw = match[1].trim();
        const normalized = this.normalizeAssetPath(notebookId, raw);
        if (normalized) results.add(normalized);
      }
      return Array.from(results);
    } catch {
      return [];
    }
  }

  isAssetReferencedElsewhere (notebookId, assetPath, excludeNoteId) {
    try {
      const notes = this.getNotes(notebookId);
      for (const note of notes) {
        if (excludeNoteId && note.id === excludeNoteId) continue;
        const paths = this.extractAssetPathsFromContent(notebookId, note.content || '');
        if (paths.includes(assetPath)) return true;
      }
    } catch {
      // no-op
    }
    return false;
  }

  createNote (notebookId, noteData) {
    const dir = this.ensureNotebookDir(notebookId);
    const note = {
      id: this.generateId(),
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const filePath = path.join(dir, `${note.id}.yml`);
    const content = yaml.dump(note, { indent: 2, lineWidth: 120, noRefs: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return note;
  }

  updateNote (notebookId, noteId, updates) {
    const dir = this.ensureNotebookDir(notebookId);
    const filePath = path.join(dir, `${noteId}.yml`);
    if (!fs.existsSync(filePath)) {
      throw new Error('Note not found');
    }
    const current = this.getNote(notebookId, noteId);
    const prevAssets = this.extractAssetPathsFromContent(notebookId, current.content || '');
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    const newAssets = this.extractAssetPathsFromContent(notebookId, updated.content || '');
    // Write note first
    const yamlContent = yaml.dump(updated, { indent: 2, lineWidth: 120, noRefs: true });
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    // Cleanup assets that are no longer referenced anywhere
    const toDelete = prevAssets.filter(p => !newAssets.includes(p));
    toDelete.forEach(p => {
      try {
        if (!this.isAssetReferencedElsewhere(notebookId, p, noteId) && fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      } catch {
        // no-op
      }
    });
    return updated;
  }

  deleteNote (notebookId, noteId) {
    const dir = this.ensureNotebookDir(notebookId);
    const filePath = path.join(dir, `${noteId}.yml`);
    if (!fs.existsSync(filePath)) {
      throw new Error('Note not found');
    }
    // Delete unused assets referenced by this note
    try {
      const note = this.getNote(notebookId, noteId);
      const assets = this.extractAssetPathsFromContent(notebookId, note.content || '');
      assets.forEach(p => {
        try {
          if (!this.isAssetReferencedElsewhere(notebookId, p, noteId) && fs.existsSync(p)) {
            fs.unlinkSync(p);
          }
        } catch {
          // no-op
        }
      });
    } catch {
      // no-op
    }
    fs.unlinkSync(filePath);
    return true;
  }

  searchNotes (query) {
    const notebooks = this.loadNotebooks();
    const results = [];
    const searchLower = (query || '').toLowerCase();
    notebooks.forEach(nb => {
      const notes = this.getNotes(nb.id);
      notes.forEach(note => {
        if (
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          (note.tags || []).some(t => t.toLowerCase().includes(searchLower))
        ) {
          results.push({ ...note, notebookId: nb.id, notebookName: nb.name });
        }
      });
    });
    return results;
  }
}

module.exports = new NotesService();

