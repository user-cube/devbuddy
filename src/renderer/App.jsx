import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Home from './components/home/Home'
import Jira from './components/jira/Jira'
import GitHub from './components/github/GitHub'
import GitLab from './components/gitlab/GitLab'
import Configuration from './components/configuration/Configuration'
import Shortcuts from './components/shortcuts/Shortcuts'
import Redirects from './components/redirects/Redirects'

function App() {
  const [currentTime, setCurrentTime] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if app is configured
    const checkConfiguration = async () => {
      try {
        if (window.electronAPI) {
          const configured = await window.electronAPI.isConfigured()
          setIsConfigured(configured)
          
          // Only redirect to config if we're on the home page and not configured
          if (!configured && location.pathname === '/') {
            navigate('/config')
          }
        }
      } catch (error) {
        console.error('Error checking configuration:', error)
      } finally {
        setLoading(false)
      }
    }

    checkConfiguration()
  }, [navigate, location.pathname])

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      if (window.electronAPI) {
        window.electronAPI.getCurrentTime().then(time => {
          setCurrentTime(time)
        }).catch(() => {
          setCurrentTime(new Date().toLocaleString())
        })
      } else {
        setCurrentTime(new Date().toLocaleString())
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
        e.preventDefault()
        const routes = ['/', '/shortcuts', '/redirects', '/jira', '/github', '/gitlab', '/config']
        const index = parseInt(e.key) - 1
        navigate(routes[index])
      }
      
      if (e.key === 'Escape') {
        navigate('/')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-dark-300">Loading DevBuddy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-dark-900">
      <Sidebar currentPath={location.pathname} isConfigured={isConfigured} />
      
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home currentTime={currentTime} />} />
          <Route path="/shortcuts" element={<Shortcuts />} />
          <Route path="/redirects" element={<Redirects />} />
          <Route path="/jira" element={<Jira />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/gitlab" element={<GitLab />} />
          <Route path="/config" element={<Configuration />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 