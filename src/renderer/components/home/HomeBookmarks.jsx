import React from 'react';
import { Bookmark, Plus } from 'lucide-react';
import BookmarkCard from '../bookmarks/BookmarkCard';

const HomeBookmarks = ({ shortcuts, onBookmarkClick, compact = false, variant = 'grid' }) => {
  return (
    <div className={variant === 'row' ? '' : 'lg:col-span-2'}>
      <div className="card h-full">
        <div className={`${compact ? 'mb-4' : 'mb-6'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold`} style={{ color: 'var(--text-primary)' }}>Bookmarks</h2>
            {shortcuts.length > 0 && (
              <span className="text-sm px-2 py-1 rounded-full" style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)'
              }}>
                {shortcuts.length} {shortcuts.length === 1 ? 'bookmark' : 'bookmarks'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.hash = '#/bookmarks'}
              className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--accent-primary)'
              }}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add
            </button>
            <button
              onClick={() => window.location.hash = '#/bookmarks'}
              className="px-3 py-1.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                border: '1px solid rgba(107, 114, 128, 0.2)',
                color: 'var(--text-secondary)'
              }}
            >
              Manage
            </button>
          </div>
        </div>

        {shortcuts.length > 0 ? (
          variant === 'row' ? (
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-full">
                {shortcuts.slice(0, 12).map((bookmark) => (
                  <div key={bookmark.id} className="w-72 flex-shrink-0">
                    <BookmarkCard
                      bookmark={bookmark}
                      onOpen={() => onBookmarkClick(bookmark.id)}
                      onEdit={() => window.location.hash = '#/bookmarks'}
                      onDelete={() => window.location.hash = '#/bookmarks'}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`${compact ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'} auto-rows-fr`}>
              {shortcuts.slice(0, compact ? 4 : 8).map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onOpen={() => onBookmarkClick(bookmark.id)}
                  onEdit={() => window.location.hash = '#/bookmarks'}
                  onDelete={() => window.location.hash = '#/bookmarks'}
                />
              ))}
            </div>
          )
        ) : (
          <div className={`text-center ${compact ? 'py-8' : 'py-12'}`}>
            <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold mb-2`} style={{ color: 'var(--text-primary)' }}>
              No Bookmarks Yet
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Create your first bookmark to get quick access to your favorite resources
            </p>
            <button
              onClick={() => window.location.hash = '#/bookmarks'}
              className={`${compact ? 'px-5 py-2.5' : 'px-6 py-3'} rounded-lg font-medium transition-all duration-300 hover:scale-105`}
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create First Bookmark
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBookmarks;
