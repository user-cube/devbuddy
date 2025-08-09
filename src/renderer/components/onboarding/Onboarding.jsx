import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

import { useOnboarding } from '../../hooks/useOnboarding';
import Loading from '../layout/Loading';
import steps from './steps/OnboardingSteps';
import StepContent from './StepContent';

const Onboarding = () => {
  const navigate = useNavigate();

  const onboardingHook = useOnboarding();
  const markOnboardingComplete = onboardingHook?.markOnboardingComplete || (() => {
    localStorage.setItem('devbuddy-onboarding-seen', 'true');
  });
  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.getConfig();
      }
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete and navigate to guided setup
      markOnboardingComplete();
      // Ensure the renderer state reflects completion before navigating
      try { window.dispatchEvent(new CustomEvent('config-changed')); } catch {
        // Ignore errors when dispatching events
      }
      try { window.dispatchEvent(new Event('onboarding-completed')); } catch {
        // Ignore errors when dispatching events
      }
      try {
        navigate('/guided-setup');
      } catch {
        // no-op
        // Fallback: try to navigate to config page
        navigate('/config');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    markOnboardingComplete();
    // Ensure the renderer state reflects completion before navigating
    try { window.dispatchEvent(new CustomEvent('config-changed')); } catch {
      // Ignore errors when dispatching events
    }
    try { window.dispatchEvent(new Event('onboarding-completed')); } catch {
      // Ignore errors when dispatching events
    }
    try {
      navigate('/guided-setup');
    } catch {
      // no-op
      // Fallback: try to navigate to config page
      navigate('/config');
    }
  };

  const currentStepData = steps[currentStep];

  if (loading) {
    return <Loading fullScreen message="Loading DevBuddy..." />;
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
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <StepContent step={currentStepData} />
        </div>
      </div>

      {/* Right Panel - Navigation */}
      <div className="w-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 p-8">
        <div className="h-full flex flex-col">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Rocket className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DevBuddy</h2>
            <p className="text-gray-600 dark:text-gray-300">Development Workflow Assistant</p>
          </div>

          {/* Step Navigation */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What you&apos;ll learn
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
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
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Get Started
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
              onClick={skipOnboarding}
              className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Skip onboarding
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
