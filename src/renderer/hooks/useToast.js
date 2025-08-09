import { useState, useCallback } from 'react';

let toastCallbacks = [];

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now();
    const newToast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast('error', message, duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast('info', message, duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info
  };
};

// Global toast functions for use outside of React components
export const Toast = {
  success: (message, duration = 5000) => {
    const id = Date.now();
    const event = new CustomEvent('show-toast', {
      detail: { id, type: 'success', message, duration }
    });
    window.dispatchEvent(event);
    return id;
  },
  
  error: (message, duration = 5000) => {
    const id = Date.now();
    const event = new CustomEvent('show-toast', {
      detail: { id, type: 'error', message, duration }
    });
    window.dispatchEvent(event);
    return id;
  },
  
  info: (message, duration = 5000) => {
    const id = Date.now();
    const event = new CustomEvent('show-toast', {
      detail: { id, type: 'info', message, duration }
    });
    window.dispatchEvent(event);
    return id;
  }
};
