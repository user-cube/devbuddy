import React from 'react'
import {
  ExternalLink,
  GitBranch,
  User,
  Calendar,
  Eye,
  MessageSquare,
  GitCommit,
  FileText,
  GitPullRequest,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { getStatusText, formatDate } from './GitHubUtils'

const getStatusIcon = (pr) => {
  if (pr.draft) return <Clock className="w-4 h-4 text-yellow-500" />
  if (pr.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />
  if (pr.state === 'closed') return <XCircle className="w-4 h-4 text-red-500" />
  return <GitPullRequest className="w-4 h-4 text-blue-500" />
}

const GitHubPRCard = ({ pr, onClick }) => {
  return (
    <div
      className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(pr)}
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: pr.draft 
                  ? 'rgba(245, 158, 11, 0.1)' 
                  : pr.merged_at 
                  ? 'rgba(16, 185, 129, 0.1)'
                  : pr.state === 'closed'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(59, 130, 246, 0.1)',
                color: pr.draft 
                  ? 'var(--warning)' 
                  : pr.merged_at 
                  ? 'var(--success)'
                  : pr.state === 'closed'
                  ? 'var(--error)'
                  : 'var(--accent-primary)',
                border: pr.draft 
                  ? '1px solid rgba(245, 158, 11, 0.3)' 
                  : pr.merged_at 
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : pr.state === 'closed'
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {getStatusText(pr)}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              #{pr.number}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {pr.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span>{pr.repository?.full_name || pr.repository_url.split('/repos/')[1]}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{pr.user?.login}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(pr.created_at)}</span>
            </div>
            
            {pr.assignees?.length > 0 && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Assigned</span>
              </div>
            )}
            
            {pr.requested_reviewers?.length > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Reviewer</span>
              </div>
            )}
            
            {pr.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{pr.comments}</span>
              </div>
            )}
            
            {pr.commits > 0 && (
              <div className="flex items-center gap-1">
                <GitCommit className="w-4 h-4" />
                <span>{pr.commits}</span>
              </div>
            )}
            
            {pr.changed_files > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{pr.changed_files}</span>
              </div>
            )}
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}

export default GitHubPRCard
