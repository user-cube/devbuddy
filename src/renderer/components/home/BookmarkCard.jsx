import React from 'react'

const BookmarkCard = ({ bookmark, onClick }) => {
  const getIconClass = (iconName) => {
    // Map icon names to Font Awesome classes (matching the IconSelector)
    const iconMap = {
      bookmark: 'fas fa-bookmark',
      folder: 'fas fa-folder',
      link: 'fas fa-link',
      'external-link': 'fas fa-external-link-alt',
      file: 'fas fa-file',
      'file-alt': 'fas fa-file-alt',
      'file-code': 'fas fa-file-code',
      'file-pdf': 'fas fa-file-pdf',
      'file-image': 'fas fa-file-image',
      home: 'fas fa-home',
      globe: 'fas fa-globe',
      search: 'fas fa-search',
      tools: 'fas fa-tools',
      wrench: 'fas fa-wrench',
      cog: 'fas fa-cog',
      star: 'fas fa-star',
      heart: 'fas fa-heart',
      fire: 'fas fa-fire',
      bolt: 'fas fa-bolt',
      rocket: 'fas fa-rocket'
    }
    return iconMap[iconName] || 'fas fa-bookmark'
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    
    // For URLs, try to keep the domain part
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
        // If URL parsing fails, just truncate normally
        return text.substring(0, maxLength - 3) + '...'
      }
    }
    
    return text.substring(0, maxLength - 3) + '...'
  }

  const iconClass = getIconClass(bookmark.icon)

  return (
    <button
      onClick={onClick}
      className="group rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg relative h-32 flex flex-col justify-between"
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
      
      <div className="flex flex-col items-center gap-2 text-center flex-1 justify-center">
        <i 
          className={`${iconClass} text-xl transition-colors flex-shrink-0`}
          style={{ color: 'var(--accent-primary)' }}
        />
        <div className="w-full min-w-0">
          <span 
            className="text-sm font-medium transition-colors block truncate"
            style={{ color: 'var(--text-primary)' }}
            title={bookmark.name}
          >
            {truncateText(bookmark.name, 30)}
          </span>
          {(bookmark.description || bookmark.url) && (
            <span 
              className="text-xs transition-colors block truncate mt-1"
              style={{ color: 'var(--text-muted)' }}
              title={bookmark.description || bookmark.url}
            >
              {truncateText(bookmark.description || bookmark.url, 40)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export default BookmarkCard 