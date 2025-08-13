import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Lightweight, inline fuzzy search dropdown used by the titlebar input
const TitleSearch = ({ query, onClose }) => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [data, setData] = useState({
    githubPRs: [], gitlabMRs: [], bitbucketPRs: [], jiraIssues: [],
    bookmarks: [], redirects: {}, repositories: [], tasks: [], notes: []
  });

  // Preload data the first time a non-empty query appears
  useEffect(() => {
    let cancelled = false;
    if (!query || loaded) return;
    (async () => {
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
          setData({
            githubPRs: Array.isArray(githubPRs) ? githubPRs : [],
            gitlabMRs: Array.isArray(gitlabMRs) ? gitlabMRs : [],
            bitbucketPRs: Array.isArray(bitbucketPRs) ? bitbucketPRs : [],
            jiraIssues: Array.isArray(jiraIssues) ? jiraIssues : [],
            bookmarks: Array.isArray(bookmarks) ? bookmarks : [],
            redirects: redirects || {},
            repositories: Array.isArray(repositories) ? repositories : [],
            tasks: Array.isArray(tasks) ? tasks : [],
            notes: []
          });
          setLoaded(true);
        }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [query, loaded]);

  // Live search notes only when user types
  useEffect(() => {
    let cancelled = false;
    if (!query) { setData(prev => ({ ...prev, notes: [] })); return; }
    const t = setTimeout(async () => {
      try {
        if (window.electronAPI?.searchNotes) {
          const notes = await window.electronAPI.searchNotes(query).catch(() => []);
          if (!cancelled) setData(prev => ({ ...prev, notes: Array.isArray(notes) ? notes : [] }));
        }
      } catch {
        // no-op
      }
    }, 150);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const results = useMemo(() => {
    const q = (query || '').toLowerCase();
    if (!q) return [];

    const matches = (text) => (text || '').toLowerCase().includes(q);

    // Bookmarks
    const bookmarkItems = (data.bookmarks || [])
      .map(b => ({
        id: `bookmark:${b.id}`,
        label: b.name,
        sub: b.url || b.description || '',
        url: b.url || '',
        kind: 'Bookmark',
        action: () => window.electronAPI?.openBookmark && window.electronAPI.openBookmark(b.id)
      }))
      .filter(i => matches(`${i.label} ${i.sub}`));

    // GitHub PRs
    const githubItems = (data.githubPRs || [])
      .map(pr => {
        const label = pr.title || pr?.pull_request?.title || 'Pull Request';
        const url = pr.html_url || pr?.pull_request?.html_url || '';
        return { id: `github:${pr.id || url}`, label, sub: url, url, kind: 'GitHub PR', action: () => url && window.electronAPI?.openExternal && window.electronAPI.openExternal(url) };
      })
      .filter(i => matches(`${i.label} ${i.sub}`));

    // GitLab MRs
    const gitlabItems = (data.gitlabMRs || [])
      .map(mr => ({ id: `gitlab:${mr.id}`, label: mr.title || 'Merge Request', sub: mr.web_url || '', url: mr.web_url || '', kind: 'GitLab MR', action: () => (mr.web_url || '') && window.electronAPI?.openExternal && window.electronAPI.openExternal(mr.web_url) }))
      .filter(i => matches(`${i.label} ${i.sub}`));

    // Bitbucket PRs
    const bitbucketItems = (data.bitbucketPRs || [])
      .map(pr => ({ id: `bitbucket:${pr.id}`, label: pr.title || 'Pull Request', sub: pr.url || '', url: pr.url || '', kind: 'Bitbucket PR', action: () => (pr.url || '') && window.electronAPI?.openExternal && window.electronAPI.openExternal(pr.url) }))
      .filter(i => matches(`${i.label} ${i.sub}`));

    // Jira
    const jiraItems = (data.jiraIssues || [])
      .map(issue => ({ id: `jira:${issue.key || ''}`, label: `${issue.key || ''} ${issue.fields?.summary || ''}`.trim(), sub: 'Jira Issue', kind: 'Jira', action: () => navigate('/jira') }))
      .filter(i => matches(i.label));

    // Tasks
    const taskItems = (data.tasks || [])
      .map(t => ({ id: `task:${t.id}`, label: t.title || 'Task', sub: t.category || '', kind: 'Task', action: () => navigate('/tasks') }))
      .filter(i => matches(`${i.label} ${i.sub}`));

    // Notes (already searched by IPC; include directly and still match title for safety)
    const noteItems = (data.notes || [])
      .map(n => ({ id: `note:${n.id}`, label: n.title || 'Note', sub: 'Note', kind: 'Note', action: () => navigate('/notes') }))
      .filter(i => matches(i.label));

    // Redirects
    const redirectItems = Object.entries(data.redirects || {})
      .flatMap(([domain, paths]) => Object.keys(paths || {}).map(p => {
        const label = `${domain}/${p}`;
        return { id: `redirect:${label}`, label, sub: 'Redirect', kind: 'Redirect', action: () => navigate('/redirects') };
      }))
      .filter(i => matches(i.label));

    // Repositories
    const repoItems = (data.repositories || [])
      .map(r => ({
        id: `repo:${r.path}`,
        label: r.name || r.path || 'Repository',
        sub: r.branch ? `Branch: ${r.branch}` : (r.path || ''),
        kind: 'Repository',
        action: () => navigate(`/repositories?repoPath=${encodeURIComponent(r.path || '')}${r.tag ? `&repoTag=${encodeURIComponent(r.tag)}` : ''}`)
      }))
      .filter(i => matches(`${i.label} ${i.sub}`));

    return [
      ...bookmarkItems,
      ...githubItems,
      ...gitlabItems,
      ...bitbucketItems,
      ...jiraItems,
      ...taskItems,
      ...noteItems,
      ...redirectItems,
      ...repoItems
    ].slice(0, 8);
  }, [data, query, navigate]);

  // Keyboard navigation local to the dropdown
  useEffect(() => {
    if (!query) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectionIndex(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectionIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { const item = results[selectionIndex]; if (!item) return; if ((e.metaKey || e.ctrlKey) && item.url) { try { window.electronAPI?.openExternal && window.electronAPI.openExternal(item.url); } catch {} onClose(); } else if (item.action) { item.action(); onClose(); } }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [query, results, selectionIndex, onClose]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  if (!query) return null;

  const highlight = (text, q) => {
    if (!q) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (<>{before}<span className="top-search-mark">{match}</span>{after}</>);
  };

  return (
    <div className="fixed left-0 right-0 z-50" style={{ top: 44 }}>
      <div ref={panelRef} className="mx-auto top-search-dropdown overflow-hidden">
        {isLoading && results.length === 0 ? (
          <div className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
        ) : results.length === 0 ? (
          <div className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>No results</div>
        ) : (
          <ul>
            {results.map((r, idx) => (
              <li
                key={r.id}
                onMouseEnter={() => setSelectionIndex(idx)}
                onClick={() => { r.action && r.action(); onClose(); }}
                className={`px-4 py-2 cursor-pointer top-search-item ${idx === selectionIndex ? 'active' : ''}`}
                style={{ color: 'var(--text-primary)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] rounded" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: 'var(--accent-primary)' }}>{(r.kind || '?').slice(0,1)}</span>
                    <span>{highlight(r.label, query)}</span>
                  </div>
                  <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    {r.url ? <span title="Open in browser (Cmd/Ctrl+Enter)">⌘↩</span> : null}
                    {r.kind}
                  </span>
                </div>
                {r.sub ? <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{highlight(r.sub, query)}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TitleSearch;

