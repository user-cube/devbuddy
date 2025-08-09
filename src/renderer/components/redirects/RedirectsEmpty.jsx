import React from 'react';
import {
  Globe,
  Plus
} from 'lucide-react';

const RedirectsEmpty = ({ onAddFirstDomain }) => {
  return (
    <div className="text-center py-12">
      <div className="p-4 rounded-full mx-auto w-16 h-16 mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
        <Globe className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Redirects Configured</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Get started by adding your first domain and redirect rules
      </p>
      <button
        onClick={onAddFirstDomain}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300"
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: 'var(--accent-primary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <Plus className="w-5 h-5" />
        Add Your First Domain
      </button>
    </div>
  );
};

export default RedirectsEmpty;
