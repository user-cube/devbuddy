import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Settings,
  Bookmark,
  ExternalLink,
  GitBranch,
  Users,

  Globe,
  Code
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Loading from '../layout/Loading';

const GuidedSetup = () => {
  const navigate = useNavigate();
  const { setThemeValue } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const setupSteps = [
    {
      id: 'bookmarks',
      title: 'Local Bookmarks',
      subtitle: 'Quick access to your environments',
      description: 'Set up bookmarks for quick access to your development, staging, and production environments.',
      icon: Bookmark,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      configKey: 'bookmarks',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable Bookmarks', default: true },
        { key: 'items', type: 'bookmarks', label: 'Bookmark Items', default: [] }
      ]
    },
    {
      id: 'redirects',
      title: 'Local Redirects',
      subtitle: 'Custom domain shortcuts',
      description: 'Create custom shortcuts for external services. Access Jira, GitHub, and other tools with simple URLs.',
      icon: ExternalLink,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      configKey: 'redirects',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable Redirects', default: true },
        { key: 'port', type: 'number', label: 'Redirector Port', default: 10000 },
        { key: 'items', type: 'redirects', label: 'Redirect Items', default: [] }
      ]
    },
    {
      id: 'repositories',
      title: 'Repository Management',
      subtitle: 'Local Git repository scanning',
      description: 'Configure paths to scan for local Git repositories.',
      icon: GitBranch,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      configKey: 'repositories',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable Repository Scanning', default: true },
        { key: 'paths', type: 'paths', label: 'Repository Paths', default: ['~/projects'] },
        { key: 'scanInterval', type: 'number', label: 'Scan Interval (seconds)', default: 300 }
      ]
    },
    {
      id: 'jira',
      title: 'Jira Integration',
      subtitle: 'Task management and issue tracking',
      description: 'Connect to your Jira instance to manage tasks and track issues.',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      configKey: 'jira',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable Jira Integration', default: false },
        { key: 'baseUrl', type: 'text', label: 'Jira Base URL', placeholder: 'https://company.atlassian.net' },
        { key: 'username', type: 'text', label: 'Username', placeholder: 'your-email@company.com' },
        { key: 'apiToken', type: 'password', label: 'API Token', placeholder: 'Your Jira API token' },
        { key: 'projectKeys', type: 'text', label: 'Project Keys', placeholder: 'PROJ,DEV,TEST' }
      ]
    },
    {
      id: 'github',
      title: 'GitHub Integration',
      subtitle: 'Pull request monitoring and reviews',
      description: 'Connect to GitHub to monitor pull requests and reviews.',
      icon: Code,
      color: 'text-gray-800 dark:text-gray-200',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      configKey: 'github',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable GitHub Integration', default: false },
        { key: 'token', type: 'password', label: 'Personal Access Token', placeholder: 'Your GitHub token' },
        { key: 'username', type: 'text', label: 'Username', placeholder: 'your-github-username' },
        { key: 'organizations', type: 'text', label: 'Organizations', placeholder: 'org1,org2' }
      ]
    },
    {
      id: 'gitlab',
      title: 'GitLab Integration',
      subtitle: 'Merge request tracking and management',
      description: 'Connect to GitLab to track merge requests and manage projects.',
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      configKey: 'gitlab',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable GitLab Integration', default: false },
        { key: 'baseUrl', type: 'text', label: 'GitLab URL', placeholder: 'https://gitlab.com' },
        { key: 'token', type: 'password', label: 'Access Token', placeholder: 'Your GitLab token' },
        { key: 'username', type: 'text', label: 'Username', placeholder: 'your-gitlab-username' }
      ]
    },
    {
      id: 'bitbucket',
      title: 'Bitbucket Integration',
      subtitle: 'Pull request monitoring and reviews',
      description: 'Connect to Bitbucket to monitor pull requests and reviews.',
      icon: GitBranch,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      configKey: 'bitbucket',
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Enable Bitbucket Integration', default: false },
        { key: 'baseUrl', type: 'text', label: 'Bitbucket URL', placeholder: 'https://api.bitbucket.org' },
        { key: 'apiToken', type: 'password', label: 'API Token', placeholder: 'Your Atlassian API token' },
        { key: 'email', type: 'text', label: 'Email', placeholder: 'your-email@company.com' },
        { key: 'username', type: 'text', label: 'Username', placeholder: 'your-bitbucket-username' },
        { key: 'workspaces', type: 'text', label: 'Workspaces', placeholder: 'workspace1,workspace2' }
      ]
    },
    {
      id: 'app-settings',
      title: 'App Settings',
      subtitle: 'General preferences and configuration',
      description: 'Configure general application settings and preferences.',
      icon: Settings,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      configKey: 'app',
      fields: [
        { key: 'theme', type: 'select', label: 'Theme', options: ['dark', 'light', 'system'], default: 'system' },
        { key: 'autoStart', type: 'toggle', label: 'Start with System', default: false },
        { key: 'notifications', type: 'toggle', label: 'Enable Notifications', default: true },
        { key: 'backgroundRefresh', type: 'toggle', label: 'Background Refresh', default: true },
        { key: 'updateInterval', type: 'number', label: 'Update Interval (seconds)', default: 300 },
        { key: 'defaultEditor', type: 'select', label: 'Default Editor', options: ['vscode', 'cursor'], default: 'vscode' }
      ]
    }
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        const configData = await window.electronAPI.getConfig();
        setConfig(configData || {});
      }
    } catch {
      // no-op
      setConfig({});
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));

    // Apply certain settings immediately for better UX
    if (section === 'app' && key === 'theme') {
      try {
        setThemeValue(value);
      } catch {
        // no-op
        try {
          document.documentElement.setAttribute('data-theme', value);
        } catch {
          // Ignore errors when setting theme
        }
      }
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.saveConfig(config);
        if (result?.success) {
          try { window.dispatchEvent(new CustomEvent('config-changed')); } catch {
            // Ignore errors when dispatching events
          }
          try { localStorage.setItem('devbuddy-onboarding-seen', 'true'); } catch {
            // Ignore errors when setting localStorage
          }
          try { window.dispatchEvent(new Event('onboarding-completed')); } catch {
            // Ignore errors when dispatching events
          }
          // Navigate to home page after successful save
          navigate('/');
        } else {
          throw new Error('Failed to save configuration');
        }
      }
    } catch {
      // no-op
      // You could show an error message here
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveConfig();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const currentStepData = setupSteps[currentStep];
  const IconComponent = currentStepData.icon;

  if (loading) {
    return <Loading fullScreen message="Loading configuration..." />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Panel - Step Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Step {currentStep + 1} of {setupSteps.length}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {Math.round(((currentStep + 1) / setupSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / setupSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className={`p-8 rounded-2xl ${currentStepData.bgColor} border border-gray-200 dark:border-gray-700`}>
            {/* Icon and Title */}
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-xl ${currentStepData.bgColor} mr-4`}>
                <IconComponent className={`h-8 w-8 ${currentStepData.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Configuration Fields */}
            <div className="space-y-6">
              {currentStepData.fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>

                  {field.type === 'toggle' && (
                    <div className="flex items-center">
                      <button
                        onClick={() => updateConfig(currentStepData.configKey, field.key, !(config[currentStepData.configKey]?.[field.key] ?? field.default))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          (config[currentStepData.configKey]?.[field.key] ?? field.default)
                            ? 'bg-blue-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            (config[currentStepData.configKey]?.[field.key] ?? field.default)
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {(config[currentStepData.configKey]?.[field.key] ?? field.default) ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={config[currentStepData.configKey]?.[field.key] ?? ''}
                      onChange={(e) => updateConfig(currentStepData.configKey, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {field.type === 'password' && (
                    <input
                      type="password"
                      value={config[currentStepData.configKey]?.[field.key] ?? ''}
                      onChange={(e) => updateConfig(currentStepData.configKey, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={config[currentStepData.configKey]?.[field.key] ?? field.default}
                      onChange={(e) => updateConfig(currentStepData.configKey, field.key, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={config[currentStepData.configKey]?.[field.key] ?? field.default}
                      onChange={(e) => updateConfig(currentStepData.configKey, field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'paths' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={(config[currentStepData.configKey]?.[field.key] ?? field.default).join(', ')}
                        onChange={(e) => updateConfig(currentStepData.configKey, field.key, e.target.value.split(',').map(s => s.trim()))}
                        placeholder="~/projects, ~/workspace"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Separate multiple paths with commas
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Navigation */}
      <div className="w-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 p-8">
        <div className="h-full flex flex-col">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Settings className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guided Setup</h2>
            <p className="text-gray-600 dark:text-gray-300">Configure your workspace</p>
          </div>

          {/* Step Navigation */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Setup Steps
            </h3>
            <div className="space-y-2">
              {setupSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentStep
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : index < currentStep
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                        : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === currentStep
                      ? 'bg-blue-500 text-white'
                      : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      index === currentStep
                        ? 'text-blue-900 dark:text-blue-100'
                        : index < currentStep
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-sm ${
                      index === currentStep
                        ? 'text-blue-700 dark:text-blue-200'
                        : index < currentStep
                          ? 'text-green-700 dark:text-green-200'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-all ${
                  currentStep === 0
                    ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              <button
                onClick={nextStep}
                disabled={saving}
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : currentStep === setupSteps.length - 1 ? (
                  <>
                    Complete Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>

            <button
              onClick={skipStep}
              className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Skip this step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedSetup;
