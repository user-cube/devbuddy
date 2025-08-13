import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const NotesEditor = ({
  editorTitle,
  setEditorTitle,
  editorContent,
  setEditorContent,
  editorRef,
  onPaste,
  onInsertImage,
  onInsertVideo,
  TagsSection,
  SafeImage,
  SafeVideo
}) => {
  return (
    <div className="flex-1 grid grid-cols-2 gap-0">
      <div className="p-4 border-r space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
        <input value={editorTitle} onChange={(e) => setEditorTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded-lg border focus:outline-none" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
        <div className="flex items-center gap-2">
          <button onClick={onInsertImage} className="px-3 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
            Insert Image
          </button>
          <button onClick={onInsertVideo} className="px-3 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
            Insert Video
          </button>
        </div>
        <textarea
          ref={editorRef}
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          onPaste={onPaste}
          rows={18}
          className="w-full px-3 py-2 rounded-lg border focus:outline-none resize-none"
          placeholder="Write Markdown here..."
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        />

        {TagsSection}
      </div>

      <div className="p-4 prose prose-invert max-w-none">
        <h2 style={{ color: 'var(--text-primary)' }}>{editorTitle || 'Untitled'}</h2>
        <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: (props) => <SafeImage {...props} />,
              video: (props) => <SafeVideo {...props} />
            }}
          >
            {editorContent || '*Nothing to preview*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default NotesEditor;


