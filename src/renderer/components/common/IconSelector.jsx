import React, { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

const IconSelector = ({ value, onChange, placeholder = "Select an icon" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Ícones úteis para bookmarks/favoritos
  const icons = [
    { name: 'bookmark', icon: 'fas fa-bookmark', label: 'Bookmark' },
    { name: 'folder', icon: 'fas fa-folder', label: 'Folder' },
    { name: 'link', icon: 'fas fa-link', label: 'Link' },
    { name: 'external-link', icon: 'fas fa-external-link-alt', label: 'External Link' },
    { name: 'file', icon: 'fas fa-file', label: 'File' },
    { name: 'file-alt', icon: 'fas fa-file-alt', label: 'Document' },
    { name: 'file-code', icon: 'fas fa-file-code', label: 'Code File' },
    { name: 'file-pdf', icon: 'fas fa-file-pdf', label: 'PDF' },
    { name: 'file-image', icon: 'fas fa-file-image', label: 'Image' },
    { name: 'home', icon: 'fas fa-home', label: 'Home' },
    { name: 'globe', icon: 'fas fa-globe', label: 'Website' },
    { name: 'search', icon: 'fas fa-search', label: 'Search' },
    { name: 'tools', icon: 'fas fa-tools', label: 'Tools' },
    { name: 'wrench', icon: 'fas fa-wrench', label: 'Wrench' },
    { name: 'cog', icon: 'fas fa-cog', label: 'Settings' },
    { name: 'star', icon: 'fas fa-star', label: 'Star' },
    { name: 'heart', icon: 'fas fa-heart', label: 'Heart' },
    { name: 'fire', icon: 'fas fa-fire', label: 'Hot' },
    { name: 'bolt', icon: 'fas fa-bolt', label: 'Fast' },
    { name: 'rocket', icon: 'fas fa-rocket', label: 'Rocket' }
  ]

  const filteredIcons = icons.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedIcon = icons.find(icon => icon.name === value)

  const handleIconSelect = (iconName) => {
    onChange(iconName)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg px-3 py-2 focus:outline-none flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center gap-2">
          {selectedIcon ? (
            <>
              <i className={selectedIcon.icon} style={{ color: 'var(--text-primary)' }}></i>
              <span>{selectedIcon.label}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 rounded-lg border z-50 max-h-64 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          {/* Search */}
          <div className="p-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Icons Grid */}
          <div className="p-2">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className="p-2 rounded-lg transition-colors hover:bg-black/10 flex flex-col items-center gap-1"
                    style={{ color: 'var(--text-primary)' }}
                    title={icon.label}
                  >
                    <i className={`${icon.icon} text-lg`}></i>
                    <span className="text-xs truncate w-full text-center">{icon.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No icons found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false)
            setSearchTerm('')
          }}
        />
      )}
    </div>
  )
}

export default IconSelector 