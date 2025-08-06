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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
          Welcome to DevBuddy
        </h1>
        <p className="text-dark-300 text-lg">
          Your development companion
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Time Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-600">
            <Clock className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold">Current Time</h3>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-primary-400 bg-dark-800/50 p-4 rounded-lg border border-primary-500/20">
              {currentTime || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Shortcuts Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-600">
            <Link className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold">Quick Shortcuts</h3>
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
              <div className="col-span-2 text-center text-dark-400 py-4">
                No shortcuts configured
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-600">
            <BarChart3 className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold">Today's Stats</h3>
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