import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import Loading from './components/layout/Loading';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './components/home/Home';
import Jira from './components/jira/Jira';
import GitHub from './components/github/GitHub';
import GitLab from './components/gitlab/GitLab';
import Bitbucket from './components/bitbucket/Bitbucket';
import Configuration from './components/configuration/Configuration';
import Bookmarks from './components/bookmarks/Bookmarks';
import Redirects from './components/redirects/Redirects';
import Repositories from './components/repositories/Repositories';
import Tasks from './components/tasks/Tasks';
import Notes from './components/notes/Notes';
import Onboarding from './components/onboarding/Onboarding';
import GuidedSetup from './components/onboarding/GuidedSetup';
import { useOnboarding } from './hooks/useOnboarding';
import { ToastContainer } from './components/layout/Toast';

function App () {
  const [currentTime, setCurrentTime] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const onboardingHook = useOnboarding();
  const onboardingLoading = onboardingHook?.loading || false;
  const isFirstRun = onboardingHook?.isFirstRun || false;
  const hasSeenOnboarding = onboardingHook?.hasSeenOnboarding || false;

  useEffect(() => {
    // Check if app is configured and load config
    const checkConfiguration = async () => {
      try {
        if (window.electronAPI) {
          const configured = await window.electronAPI.isConfigured();
          setIsConfigured(configured);

          // Load configuration for dynamic navigation
          const configData = await window.electronAPI.getConfig();
          setConfig(configData);
        }
      } catch {
        // Error checking configuration
      } finally {
        setLoading(false);
      }
    };

    checkConfiguration();

    // Listen for configuration changes
    const handleConfigChange = async () => {
      try {
        if (window.electronAPI) {
          const configData = await window.electronAPI.getConfig();
          setConfig(configData);

          // Redirect if user is on a disabled integration page
          const currentPath = location.pathname;
          if (currentPath === '/jira' && !configData?.jira?.enabled) {
            navigate('/');
          } else if (currentPath === '/github' && !configData?.github?.enabled) {
            navigate('/');
          } else if (currentPath === '/gitlab' && !configData?.gitlab?.enabled) {
            navigate('/');
          } else if (currentPath === '/bitbucket' && !configData?.bitbucket?.enabled) {
            navigate('/');
          }
        }
      } catch {
        // Error updating config after change
      }
    };

    window.addEventListener('config-changed', handleConfigChange);

    return () => {
      window.removeEventListener('config-changed', handleConfigChange);
    };
  }, [navigate, location.pathname]);

  // Handle redirects after both configuration and onboarding are loaded
  useEffect(() => {
    if (!loading && !onboardingLoading) {
      // Only redirect to config if we're on the home page, not configured, and not showing onboarding or guided setup
      if (
        !isConfigured &&
        location.pathname === '/' &&
        !(isFirstRun && !hasSeenOnboarding) &&
        location.pathname !== '/guided-setup'
      ) {
        navigate('/config');
      }
    }
  }, [loading, onboardingLoading, isConfigured, isFirstRun, hasSeenOnboarding, location.pathname, navigate]);

  useEffect(() => {
    // Listen for app initialization events
    const handleAppInitialized = (_event, _data) => {
      // App initialization completed
      // You can add additional logic here if needed
    };

    if (window.electronAPI) {
      window.electronAPI.onAppInitialized(handleAppInitialized);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAppInitializedListener(handleAppInitialized);
      }
    };
  }, []);

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      if (window.electronAPI) {
        window.electronAPI.getCurrentTime().then(time => {
          setCurrentTime(time);
        }).catch(() => {
          setCurrentTime(new Date().toLocaleString());
        });
      } else {
        setCurrentTime(new Date().toLocaleString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Dynamic keyboard shortcuts based on enabled integrations
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
        e.preventDefault();

        // Build dynamic routes array based on enabled integrations
        const baseRoutes = ['/', '/shortcuts', '/redirects'];
        const integrationRoutes = [];

        if (config?.jira?.enabled) integrationRoutes.push('/jira');
        if (config?.github?.enabled) integrationRoutes.push('/github');
        if (config?.gitlab?.enabled) integrationRoutes.push('/gitlab');
        if (config?.bitbucket?.enabled) integrationRoutes.push('/bitbucket');

        const routes = [...baseRoutes, ...integrationRoutes, '/config'];
        const index = parseInt(e.key) - 1;

        if (index < routes.length) {
          navigate(routes[index]);
        }
      }

      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, config]);

  // Redirect to onboarding if it's the first run and user hasn't seen it
  useEffect(() => {
    if (!loading && !onboardingLoading && isFirstRun && !hasSeenOnboarding && location.pathname !== '/onboarding' && location.pathname !== '/guided-setup') {
      navigate('/onboarding');
    }
  }, [loading, onboardingLoading, isFirstRun, hasSeenOnboarding, location.pathname, navigate, isConfigured]);

  if (loading || onboardingLoading) {
    return (
      <ThemeProvider>
        <Loading fullScreen message="Loading DevBuddy..." />
      </ThemeProvider>
    );
  }

  // Show onboarding as a full-screen experience
  if (location.pathname === '/onboarding') {
    return (
      <ThemeProvider>
        <Onboarding />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <NavigationProvider>
        <div className="flex h-screen app-with-titlebar" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {/* Custom titlebar overlay */}
          <div className="app-titlebar"><span className="title">DevBuddy</span></div>
          <Sidebar currentPath={location.pathname} isConfigured={isConfigured} />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home currentTime={currentTime} />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/redirects" element={<Redirects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/notes" element={<Notes />} />
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
              <Route path="/bitbucket" element={
                <ProtectedRoute integration="bitbucket">
                  <Bitbucket />
                </ProtectedRoute>
              } />
              <Route path="/repositories" element={
                <ProtectedRoute integration="repositories">
                  <Repositories />
                </ProtectedRoute>
              } />
              <Route path="/config" element={<Configuration />} />
              <Route path="/guided-setup" element={<GuidedSetup />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;
