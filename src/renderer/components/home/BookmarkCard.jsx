import React from 'react'

const BookmarkCard = ({ bookmark, onClick }) => {
  const getBookmarkIcon = (bookmark) => {
    if (bookmark.filePath) {
      const fileExtension = bookmark.filePath.split('.').pop()?.toLowerCase()
      const fileIconMap = {
        pdf: 'fas fa-file-pdf',
        doc: 'fas fa-file-word',
        docx: 'fas fa-file-word',
        xls: 'fas fa-file-excel',
        xlsx: 'fas fa-file-excel',
        ppt: 'fas fa-file-powerpoint',
        pptx: 'fas fa-file-powerpoint',
        txt: 'fas fa-file-alt',
        md: 'fas fa-file-alt',
        json: 'fas fa-file-code',
        js: 'fas fa-file-code',
        ts: 'fas fa-file-code',
        jsx: 'fas fa-file-code',
        tsx: 'fas fa-file-code',
        py: 'fas fa-file-code',
        java: 'fas fa-file-code',
        cpp: 'fas fa-file-code',
        c: 'fas fa-file-code',
        h: 'fas fa-file-code',
        css: 'fas fa-file-code',
        html: 'fas fa-file-code',
        xml: 'fas fa-file-code',
        yml: 'fas fa-file-code',
        yaml: 'fas fa-file-code',
        png: 'fas fa-file-image',
        jpg: 'fas fa-file-image',
        jpeg: 'fas fa-file-image',
        gif: 'fas fa-file-image',
        svg: 'fas fa-file-image',
        mp4: 'fas fa-file-video',
        avi: 'fas fa-file-video',
        mov: 'fas fa-file-video',
        mp3: 'fas fa-file-audio',
        wav: 'fas fa-file-audio',
        zip: 'fas fa-file-archive',
        rar: 'fas fa-file-archive',
        tar: 'fas fa-file-archive',
        gz: 'fas fa-file-archive'
      }
      return fileIconMap[fileExtension] || 'fas fa-file'
    }
    return 'fas fa-globe'
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    
    if (text.startsWith('http')) {
      try {
        const url = new URL(text)
        const domain = url.hostname
        const path = url.pathname
        
        if (domain.length + path.length <= maxLength) {
          return `${domain}${path}`
        } else if (domain.length <= maxLength - 3) {
          return `${domain}...`
        } else {
          return `${domain.substring(0, maxLength - 3)}...`
        }
      } catch {
        return text.substring(0, maxLength - 3) + '...'
      }
    }
    
    if (text.includes('/') || text.includes('\\')) {
      const fileName = text.split(/[/\\]/).pop()
      if (fileName && fileName.length <= maxLength) {
        return fileName
      } else if (fileName && fileName.length > maxLength) {
        return fileName.substring(0, maxLength - 3) + '...'
      }
    }
    
    return text.substring(0, maxLength - 3) + '...'
  }

  return (
    <button
      onClick={onClick}
      className="group relative w-full h-32 rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col"
      style={{
        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
        border: '1px solid var(--border-primary)'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
        e.target.style.borderColor = 'var(--accent-primary)'
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))'
        e.target.style.borderColor = 'var(--border-primary)'
      }}
    >
      {/* Category Badge */}
      {bookmark.category && (
        <div 
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: bookmark.categoryColor ? `${bookmark.categoryColor}20` : 'rgba(107, 114, 128, 0.2)',
            color: bookmark.categoryColor || 'var(--text-muted)'
          }}
        >
          {bookmark.category}
        </div>
      )}
      
      {/* Content */}
      <div className="flex items-start gap-3 h-full">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <i 
            className={`${getBookmarkIcon(bookmark)} text-lg`}
            style={{ 
              color: bookmark.filePath ? 'var(--success)' : 'var(--accent-primary)'
            }}
          />
        </div>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0 text-left">
          <div 
            className="text-sm font-medium mb-1 line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
            title={bookmark.name}
          >
            {bookmark.name}
          </div>
          
          {(bookmark.description || bookmark.url || bookmark.filePath) && (
            <div 
              className="text-xs line-clamp-2"
              style={{ color: 'var(--text-muted)' }}
              title={bookmark.description || bookmark.url || bookmark.filePath}
            >
              {truncateText(bookmark.description || bookmark.url || bookmark.filePath, 45)}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default BookmarkCard 