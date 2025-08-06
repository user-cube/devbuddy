import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { NavigationProvider } from './contexts/NavigationContext'
import Sidebar from './components/layout/Sidebar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Home from './components/home/Home'
import Jira from './components/jira/Jira'
import GitHub from './components/github/GitHub'
import GitLab from './components/gitlab/GitLab'
import Configuration from './components/configuration/Configuration'
import Bookmarks from './components/bookmarks/Bookmarks'
import Redirects from './components/redirects/Redirects'
import Repositories from './components/repositories/Repositories'

function App() {
  const [currentTime, setCurrentTime] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if app is configured and load config
    const checkConfiguration = async () => {
      try {
        if (window.electronAPI) {
          const configured = await window.electronAPI.isConfigured()
          setIsConfigured(configured)
          
          // Load configuration for dynamic navigation
          const configData = await window.electronAPI.getConfig()
          setConfig(configData)
          
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

    // Listen for configuration changes
    const handleConfigChange = async () => {
      try {
        if (window.electronAPI) {
          const configData = await window.electronAPI.getConfig()
          setConfig(configData)
          
          // Redirect if user is on a disabled integration page
          const currentPath = location.pathname
          if (currentPath === '/jira' && !configData?.jira?.enabled) {
            navigate('/')
          } else if (currentPath === '/github' && !configData?.github?.enabled) {
            navigate('/')
          } else if (currentPath === '/gitlab' && !configData?.gitlab?.enabled) {
            navigate('/')
          }
        }
      } catch (error) {
        console.error('Error updating config after change:', error)
      }
    }

    window.addEventListener('config-changed', handleConfigChange)

    return () => {
      window.removeEventListener('config-changed', handleConfigChange)
    }
  }, [navigate, location.pathname])

  useEffect(() => {
    // Listen for app initialization events
    const handleAppInitialized = (event, data) => {
      console.log('App initialization completed:', data)
      // You can add additional logic here if needed
    }

    if (window.electronAPI) {
      window.electronAPI.onAppInitialized(handleAppInitialized)
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAppInitializedListener(handleAppInitialized)
      }
    }
  }, [])

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

  // Dynamic keyboard shortcuts based on enabled integrations
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
        e.preventDefault()
        
        // Build dynamic routes array based on enabled integrations
        const baseRoutes = ['/', '/shortcuts', '/redirects']
        const integrationRoutes = []
        
        if (config?.jira?.enabled) integrationRoutes.push('/jira')
        if (config?.github?.enabled) integrationRoutes.push('/github')
        if (config?.gitlab?.enabled) integrationRoutes.push('/gitlab')
        
        const routes = [...baseRoutes, ...integrationRoutes, '/config']
        const index = parseInt(e.key) - 1
        
        if (index < routes.length) {
          navigate(routes[index])
        }
      }
      
      if (e.key === 'Escape') {
        navigate('/')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate, config])

  if (loading) {
    return (
      <ThemeProvider>
        <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--accent-primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading DevBuddy...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <NavigationProvider>
        <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Sidebar currentPath={location.pathname} isConfigured={isConfigured} />
          
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home currentTime={currentTime} />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/redirects" element={<Redirects />} />
              <Route path="/jira" element={
                <ProtectedRoute integration="jira">
                  <Jira />
                </ProtectedRoute>
              } />
              <Route path="/github" element={
                <ProtectedRoute integration="github">
                  <GitHub />
                </ProtectedRoute>
              } />
              <Route path="/gitlab" element={
                <ProtectedRoute integration="gitlab">
                  <GitLab />
                </ProtectedRoute>
              } />
              <Route path="/repositories" element={
                <ProtectedRoute integration="repositories">
                  <Repositories />
                </ProtectedRoute>
              } />
              <Route path="/config" element={<Configuration />} />
            </Routes>
          </main>
        </div>
      </NavigationProvider>
    </ThemeProvider>
  )
}

export default App 