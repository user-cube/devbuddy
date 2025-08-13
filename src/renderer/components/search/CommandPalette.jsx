import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CommandPalette ({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [scope, setScope] = useState('all');

  const SCOPES = [
    { id: 'all', label: 'All' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'notes', label: 'Notes' },
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'redirects', label: 'Redirects' },
    { id: 'repositories', label: 'Repositories' },
    { id: 'github', label: 'GitHub' },
    { id: 'gitlab', label: 'GitLab' },
    { id: 'bitbucket', label: 'Bitbucket' },
    { id: 'jira', label: 'Jira' }
  ];

  const [data, setData] = useState({
    githubPRs: [],
    gitlabMRs: [],
    bitbucketPRs: [],
    jiraIssues: [],
    bookmarks: [],
    redirects: {},
    repositories: [],
    tasks: [],
    notes: []
  });

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
      setSelectionIndex(0);
    } else {
      setQuery('');
    }
  }, [open]);

  // Load static-ish sources once when opened (cached by main services)
  useEffect(() => {
    let cancelled = false;
    async function loadInitial () {
      if (!open) return;
      setIsLoading(true);
      try {
        const promises = [];
        if (window.electronAPI?.getGithubPRs) promises.push(window.electronAPI.getGithubPRs().catch(() => [])); else promises.push(Promise.resolve([]));
        if (window.electronAPI?.getGitlabMRs) promises.push(window.electronAPI.getGitlabMRs().catch(() => [])); else promises.push(Promise.resolve([]));
        if (window.electronAPI?.getBitbucketPRs) promises.push(window.electronAPI.getBitbucketPRs().catch(() => [])); else promises.push(Promise.resolve([]));
        if (window.electronAPI?.getJiraIssues) promises.push(window.electronAPI.getJiraIssues().catch(() => [])); else promises.push(Promise.resolve([]));
        if (window.electronAPI?.getAllBookmarks) promises.push(window.electronAPI.getAllBookmarks().catch(() => [])); else promises.push(Promise.resolve([]));
        if (window.electronAPI?.getRedirects) promises.push(window.electronAPI.getRedirects().catch(() => ({}))); else promises.push(Promise.resolve({}));
        if (window.electronAPI?.getRepositories) promises.push(window.electronAPI.getRepositories().catch(() => [])); else promises.push(Promise.resolve([]));
        if (window.electronAPI?.getTasks) promises.push(window.electronAPI.getTasks().catch(() => [])); else promises.push(Promise.resolve([]));

        const [githubPRs, gitlabMRs, bitbucketPRs, jiraIssues, bookmarks, redirects, repositories, tasks] = await Promise.all(promises);

        if (!cancelled) {
          setData(prev => ({
            ...prev,
            githubPRs: Array.isArray(githubPRs) ? githubPRs : [],
            gitlabMRs: Array.isArray(gitlabMRs) ? gitlabMRs : [],
            bitbucketPRs: Array.isArray(bitbucketPRs) ? bitbucketPRs : [],
            jiraIssues: Array.isArray(jiraIssues) ? jiraIssues : [],
            bookmarks: Array.isArray(bookmarks) ? bookmarks : [],
            redirects: redirects || {},
            repositories: Array.isArray(repositories) ? repositories : [],
            tasks: Array.isArray(tasks) ? tasks : []
          }));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadInitial();
    return () => { cancelled = true; };
  }, [open]);

  // Live search notes via IPC for better performance
  useEffect(() => {
    let cancelled = false;
    async function searchNotes () {
      if (!open) return;
      if (!query) {
        setData(prev => ({ ...prev, notes: [] }));
        return;
      }
      try {
        if (window.electronAPI?.searchNotes) {
          const notes = await window.electronAPI.searchNotes(query).catch(() => []);
          if (!cancelled) setData(prev => ({ ...prev, notes: Array.isArray(notes) ? notes : [] }));
        }
      } catch {
        // no-op
      }
    }
    const t = setTimeout(searchNotes, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, open]);

  const results = useMemo(() => {
    const q = (query || '').toLowerCase();
    const items = [];

    const pushItem = (item) => items.push(item);

    // Bookmarks
    if (scope === 'all' || scope === 'bookmarks') data.bookmarks.forEach(b => {
      const hay = `${b.name} ${b.description || ''} ${b.url || ''}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({
          id: `bookmark:${b.id}`,
          label: b.name,
          sub: b.url || b.description || '',
          kind: 'Bookmark',
          action: () => window.electronAPI?.openBookmark && window.electronAPI.openBookmark(b.id)
        });
      }
    });

    // GitHub PRs
    if (scope === 'all' || scope === 'github') data.githubPRs.forEach(pr => {
      const title = pr.title || pr?.pull_request?.title || pr?.repository_url || 'Pull Request';
      const sub = pr.html_url || pr?.pull_request?.html_url || '';
      const hay = `${title} ${sub}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({ id: `github:${pr.id || sub}`, label: title, sub, kind: 'GitHub PR', action: () => sub && window.electronAPI?.openExternal && window.electronAPI.openExternal(sub) });
      }
    });

    // GitLab MRs
    if (scope === 'all' || scope === 'gitlab') data.gitlabMRs.forEach(mr => {
      const title = mr.title || 'Merge Request';
      const sub = mr.web_url || '';
      const hay = `${title} ${sub}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({ id: `gitlab:${mr.id}`, label: title, sub, kind: 'GitLab MR', action: () => sub && window.electronAPI?.openExternal && window.electronAPI.openExternal(sub) });
      }
    });

    // Bitbucket PRs (already formatted by service)
    if (scope === 'all' || scope === 'bitbucket') data.bitbucketPRs.forEach(pr => {
      const title = pr.title || 'Pull Request';
      const sub = pr.url || '';
      const hay = `${title} ${sub}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({ id: `bitbucket:${pr.id}`, label: title, sub, kind: 'Bitbucket PR', action: () => sub && window.electronAPI?.openExternal && window.electronAPI.openExternal(sub) });
      }
    });

    // Jira issues
    if (scope === 'all' || scope === 'jira') data.jiraIssues.forEach(issue => {
      const key = issue.key || '';
      const summary = issue.fields?.summary || '';
      const hay = `${key} ${summary}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({ id: `jira:${key}`, label: `${key} ${summary}`, sub: 'Jira Issue', kind: 'Jira', action: () => navigate('/jira') });
      }
    });

    // Tasks
    if (scope === 'all' || scope === 'tasks') data.tasks.forEach(t => {
      const hay = `${t.title || ''} ${t.description || ''}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({ id: `task:${t.id}`, label: t.title || 'Task', sub: t.category || '', kind: 'Task', action: () => navigate('/tasks') });
      }
    });

    // Notes (search results)
    if (scope === 'all' || scope === 'notes') data.notes.forEach(n => {
      const title = n.title || 'Note';
      pushItem({ id: `note:${n.id}`, label: title, sub: 'Note', kind: 'Note', action: () => navigate('/notes') });
    });

    // Redirects (by path)
    if (scope === 'all' || scope === 'redirects') Object.entries(data.redirects || {}).forEach(([domain, paths]) => {
      Object.keys(paths || {}).forEach(p => {
        const label = `${domain}/${p}`;
        if (!q || label.toLowerCase().includes(q)) {
          pushItem({ id: `redirect:${domain}/${p}`, label, sub: 'Redirect', kind: 'Redirect', action: () => navigate('/redirects') });
        }
      });
    });

    // Repositories
    if (scope === 'all' || scope === 'repositories') data.repositories.forEach(r => {
      const label = r.name || r.path || 'Repository';
      const hay = `${label} ${r.path || ''} ${r.currentBranch || ''}`.toLowerCase();
      if (!q || hay.includes(q)) {
        pushItem({
          id: `repo:${r.path}`,
          label,
          sub: r.branch ? `Branch: ${r.branch}` : (r.path || ''),
          kind: 'Repository',
          action: () => navigate(`/repositories?repoPath=${encodeURIComponent(r.path || '')}${r.tag ? `&repoTag=${encodeURIComponent(r.tag)}` : ''}`)
        });
      }
    });

    return items.slice(0, 100);
  }, [data, query, navigate, scope]);

  // Ensure the highlighted item stays in view when navigating with arrows
  useEffect(() => {
    if (!open) return;
    const el = itemRefs.current[selectionIndex];
    if (el && typeof el.scrollIntoView === 'function') {
      try {
        el.scrollIntoView({ block: 'nearest' });
      } catch {
        // no-op
      }
    }
  }, [selectionIndex, open, results.length]);

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectionIndex(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectionIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[selectionIndex];
      if (item && item.action) item.action();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 modal-overlay" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 rounded-xl shadow-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Search ${scope === 'all' ? 'anything' : scope}... (Cmd/Ctrl+K)`}
            className="w-full bg-transparent outline-none text-base"
            style={{ color: 'var(--text-primary)' }}
            autoFocus
          />
        </div>
        <div className="px-3 py-2 border-b flex flex-wrap gap-2" style={{ borderColor: 'var(--border-primary)' }}>
          {SCOPES.map(s => (
            <button
              key={s.id}
              onClick={() => { setScope(s.id); setSelectionIndex(0); }}
              className={`px-2.5 py-1.5 rounded-md text-sm border ${scope === s.id ? 'bg-blue-500/10' : ''}`}
              style={{ borderColor: 'var(--border-primary)', color: scope === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="max-h-96 overflow-y-auto" ref={listRef}>
          {isLoading && results.length === 0 ? (
            <div className="px-4 py-6 text-center" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center" style={{ color: 'var(--text-secondary)' }}>No results. Try another query.</div>
          ) : (
            <ul>
              {results.map((r, idx) => (
                <li
                  key={r.id}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  onMouseEnter={() => setSelectionIndex(idx)}
                  onClick={() => { r.action && r.action(); onClose(); }}
                  className={`px-4 py-2 cursor-pointer ${idx === selectionIndex ? 'bg-blue-500/10' : ''}`}
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className="flex items-center justify-between">
                    <span>{r.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.kind}</span>
                  </div>
                  {r.sub ? <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.sub}</div> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-4 py-2 text-xs flex items-center justify-between border-t" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
          <span>Enter to open • Esc to close • ↑/↓ to navigate</span>
          <span>Global: Cmd/Ctrl+Shift+K</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

