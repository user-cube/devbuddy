import React, { useState, useEffect } from 'react'
import { Clock, Link, BarChart3 } from 'lucide-react'
import ShortcutCard from './ShortcutCard'
import StatsCard from './StatsCard'

const Home = ({ currentTime }) => {
  const [shortcuts, setShortcuts] = useState([])
  const [stats, setStats] = useState({
    jiraTasks: 0,
    githubPRs: 0,
    gitlabPRs: 0
  })

  useEffect(() => {
    // Load shortcuts from configuration
    const loadShortcuts = async () => {
      try {
        if (window.electronAPI) {
          const shortcutsData = await window.electronAPI.getShortcuts()
          setShortcuts(shortcutsData || [])
        }
      } catch (error) {
        console.error('Error loading shortcuts:', error)
      }
    }

    loadShortcuts()
  }, [])

  const handleShortcutClick = async (shortcutName) => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openShortcut(shortcutName)
        console.log('Shortcut result:', result)
      } catch (error) {
        console.error('Error opening shortcut:', error)
      }
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Welcome to DevBuddy
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Your development companion
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Time Card */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <Clock className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Current Time</h3>
          </div>
          <div className="text-center">
            <div 
              className="text-3xl font-mono font-bold p-4 rounded-lg"
              style={{
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--accent-primary)'
              }}
            >
              {currentTime || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Shortcuts Card */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <Link className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Shortcuts</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {shortcuts.slice(0, 4).map((shortcut) => (
              <ShortcutCard
                key={shortcut.name}
                shortcut={shortcut}
                onClick={() => handleShortcutClick(shortcut.name)}
              />
            ))}
            {shortcuts.length === 0 && (
              <div className="col-span-2 text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No shortcuts configured
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="card">
          <div 
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <BarChart3 className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Stats</h3>
          </div>
          <StatsCard stats={stats} />
        </div>
      </div>

      {/* Additional Shortcuts */}
      {shortcuts.length > 4 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">All Shortcuts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => (
              <ShortcutCard
                key={shortcut.name}
                shortcut={shortcut}
                onClick={() => handleShortcutClick(shortcut.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home 