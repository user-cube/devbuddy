import React from 'react'
import {
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const RedirectsMessage = ({ message }) => {
  if (!message.text) return null

  return (
    <div 
      className="mb-6 p-4 rounded-lg flex items-center gap-3"
      style={{
        backgroundColor: message.type === 'success' 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        border: message.type === 'success' 
          ? '1px solid rgba(16, 185, 129, 0.3)' 
          : '1px solid rgba(239, 68, 68, 0.3)',
        color: message.type === 'success' 
          ? 'var(--success)' 
          : 'var(--error)'
      }}
    >
      {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message.text}
    </div>
  )
}

export default RedirectsMessage
