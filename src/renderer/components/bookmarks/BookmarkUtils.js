// Utility functions for bookmarks

export const getBookmarkIcon = (bookmark) => {
  if (bookmark.filePath) {
    // Get file extension and return appropriate icon
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
  
  // For URLs, use globe icon
  return 'fas fa-globe'
}

export const truncateText = (text, maxLength = 60) => {
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

export const filterBookmarks = (categories, query) => {
  if (!query.trim()) return categories

  const searchTerm = query.toLowerCase()
  
  return categories.map(category => {
    const filteredBookmarks = category.bookmarks?.filter(bookmark => {
      const name = bookmark.name?.toLowerCase() || ''
      const description = bookmark.description?.toLowerCase() || ''
      const url = bookmark.url?.toLowerCase() || ''
      const filePath = bookmark.filePath?.toLowerCase() || ''
      
      return name.includes(searchTerm) || 
             description.includes(searchTerm) || 
             url.includes(searchTerm) || 
             filePath.includes(searchTerm)
    }) || []

    return {
      ...category,
      bookmarks: filteredBookmarks
    }
  }).filter(category => category.bookmarks.length > 0)
}

// Helper function to create highlighted text elements
export const createHighlightedText = (text, searchTerm) => {
  if (!searchTerm.trim() || !text) return text
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return {
        type: 'highlight',
        text: part,
        key: index
      }
    }
    return {
      type: 'normal',
      text: part,
      key: index
    }
  })
}
