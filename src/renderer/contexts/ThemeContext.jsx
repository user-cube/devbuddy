import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Load theme from config on mount
    const loadTheme = async () => {
      try {
        if (window.electronAPI) {
          const config = await window.electronAPI.getConfig()
          setTheme(config?.app?.theme || 'dark')
        }
      } catch (error) {
        console.error('Error loading theme:', error)
      }
    }

    loadTheme()
  }, [])

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    // Save theme to config
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getConfig()
        const updatedConfig = {
          ...config,
          app: {
            ...config.app,
            theme: newTheme
          }
        }
        await window.electronAPI.saveConfig(updatedConfig)
      }
    } catch (error) {
      console.error('Error saving theme:', error)
    }

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const setThemeValue = async (newTheme) => {
    setTheme(newTheme)

    // Save theme to config
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getConfig()
        const updatedConfig = {
          ...config,
          app: {
            ...config.app,
            theme: newTheme
          }
        }
        await window.electronAPI.saveConfig(updatedConfig)
      }
    } catch (error) {
      console.error('Error saving theme:', error)
    }

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Apply theme to document when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const value = {
    theme,
    toggleTheme,
    setThemeValue,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 