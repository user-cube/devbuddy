import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message || !message.text) return null;

  const getIcon = () => {
    switch (message.type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />;
    case 'error':
      return <AlertCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />;
    case 'info':
      return <Info className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />;
    default:
      return null;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
    case 'success':
      return 'rgba(16, 185, 129, 0.1)';
    case 'error':
      return 'rgba(239, 68, 68, 0.1)';
    case 'info':
      return 'rgba(59, 130, 246, 0.1)';
    default:
      return 'rgba(59, 130, 246, 0.1)';
    }
  };

  const getBorderColor = () => {
    switch (message.type) {
    case 'success':
      return 'rgba(16, 185, 129, 0.3)';
    case 'error':
      return 'rgba(239, 68, 68, 0.3)';
    case 'info':
      return 'rgba(59, 130, 246, 0.3)';
    default:
      return 'rgba(59, 130, 246, 0.3)';
    }
  };

  const getTextColor = () => {
    switch (message.type) {
    case 'success':
      return 'var(--success)';
    case 'error':
      return 'var(--error)';
    case 'info':
      return 'var(--accent-primary)';
    default:
      return 'var(--accent-primary)';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="flex items-center gap-3 p-4 rounded-lg min-w-80">
        {getIcon()}
        <p
          className="flex-1 text-sm font-medium"
          style={{ color: getTextColor() }}
        >
          {message.text}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="p-1 rounded-full transition-colors hover:bg-black/10"
          style={{ color: getTextColor() }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container component for global toasts
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { id, type, message, duration } = event.detail;
      setToasts(prev => [...prev, { id, type, message, duration }]);
      
      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={{ type: toast.type, text: toast.message }}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </>
  );
};

export default Toast;
