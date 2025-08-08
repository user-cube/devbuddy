import { useState, useEffect } from 'react'

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [isFirstRun, setIsFirstRun] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  // React to onboarding completion and storage updates
  useEffect(() => {
    const handleOnboardingCompleted = () => {
      setHasSeenOnboarding(true)
      // After onboarding completes, we treat it as not first run from the UX perspective
      setIsFirstRun(false)
    }

    const handleStorage = (event) => {
      if (!event || event.key === null || event.key === 'devbuddy-onboarding-seen') {
        const seen = localStorage.getItem('devbuddy-onboarding-seen')
        setHasSeenOnboarding(!!seen)
      }
    }

    window.addEventListener('onboarding-completed', handleOnboardingCompleted)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('onboarding-completed', handleOnboardingCompleted)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      let isConfigured = false;
      
      if (window.electronAPI) {
        // Check if this is the first run (no config exists)
        isConfigured = await window.electronAPI.isConfigured()
      } else {
        // Fallback: check if there's any config in localStorage
        const hasConfig = localStorage.getItem('devbuddy-config')
        isConfigured = !!hasConfig
      }
      
      setIsFirstRun(!isConfigured)

      // Check if user has seen onboarding before.
      // IMPORTANT: If it's first run (no config), ignore any previous 'seen' flag
      // so onboarding shows again after a clean config reset.
      const onboardingSeen = localStorage.getItem('devbuddy-onboarding-seen')
      const effectiveHasSeen = isConfigured ? !!onboardingSeen : false
      setHasSeenOnboarding(effectiveHasSeen)
      
      
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // Fallback: assume first run if there's an error
      setIsFirstRun(true)
      setHasSeenOnboarding(false)
    } finally {
      setLoading(false)
    }
  }

  const markOnboardingComplete = () => {
    localStorage.setItem('devbuddy-onboarding-seen', 'true')
    setHasSeenOnboarding(true)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('devbuddy-onboarding-seen')
    setHasSeenOnboarding(false)
  }

  const shouldShowOnboarding = () => {
    return isFirstRun && !hasSeenOnboarding
  }

  return {
    hasSeenOnboarding,
    isFirstRun,
    loading,
    markOnboardingComplete,
    resetOnboarding,
    shouldShowOnboarding
  }
}
