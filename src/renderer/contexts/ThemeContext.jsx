import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Load theme from config on mount
    const loadTheme = async () => {
      try {
        if (window.electronAPI) {
          const config = await window.electronAPI.getConfig();
          setTheme(config?.app?.theme || 'dark');
        }
      } catch {
        // no-op
      }
    };

    loadTheme();
  }, []);

  const applyThemeToDom = (value) => {
    try {
      document.documentElement.setAttribute('data-theme', value);
      // Also toggle Tailwind dark class for components that rely on it
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // no-op
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    // Save theme to config
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getConfig();
        const updatedConfig = {
          ...config,
          app: {
            ...config.app,
            theme: newTheme
          }
        };
        await window.electronAPI.saveConfig(updatedConfig);
      }
    } catch {
      // no-op
    }

    applyThemeToDom(newTheme);
  };

  const setThemeValue = async (newTheme) => {
    setTheme(newTheme);

    // Save theme to config
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getConfig();
        const updatedConfig = {
          ...config,
          app: {
            ...config.app,
            theme: newTheme
          }
        };
        await window.electronAPI.saveConfig(updatedConfig);
      }
    } catch {
      // no-op
    }

    applyThemeToDom(newTheme);
  };

  // Apply theme to document when theme changes
  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    setThemeValue,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
