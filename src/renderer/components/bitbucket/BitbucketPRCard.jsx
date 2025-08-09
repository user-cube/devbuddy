import React from 'react'
import {
  GitPullRequest,
  GitBranch,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Calendar,
  GitCommit,
  FileText
} from 'lucide-react'
import { formatDate, getStatusText, getStatusBackground, getStatusBorder, getStatusColor } from './BitbucketUtils'

const BitbucketPRCard = ({ pullRequest, onClick }) => {
  const pr = pullRequest

  const getStatusIcon = (pr) => {
    if (pr.is_draft || (typeof pr.is_draft === 'object' && pr.is_draft?.draft)) return <Clock className="w-4 h-4 text-yellow-500" />
    if (pr.state === 'MERGED' || (typeof pr.state === 'object' && pr.state?.name === 'MERGED')) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (pr.state === 'CLOSED' || (typeof pr.state === 'object' && pr.state?.name === 'CLOSED')) return <XCircle className="w-4 h-4 text-red-500" />
    return <GitPullRequest className="w-4 h-4 text-orange-500" />
  }

  return (
    <div
      className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => onClick(pr)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(pr)}
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: getStatusBackground(pr),
                color: getStatusColor(pr),
                border: getStatusBorder(pr)
              }}
            >
              {getStatusText(pr)}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              #{typeof pr.id === 'string' || typeof pr.id === 'number' ? pr.id : pr.id?.id || 'unknown'}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {typeof pr.title === 'string' ? pr.title : pr.title?.name || 'Untitled Pull Request'}
          </h3>
          
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span>
                {typeof pr.source?.branch === 'string' ? pr.source.branch : pr.source?.branch?.name || 'unknown'} → {typeof pr.destination?.branch === 'string' ? pr.destination.branch : pr.destination?.branch?.name || 'unknown'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {pr.author?.avatar_url && (
                <img 
                  src={pr.author.avatar_url} 
                  alt={typeof pr.author === 'string' ? pr.author : pr.author?.display_name || pr.author?.username || 'Author'}
                  className="w-4 h-4 rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'inline'
                  }}
                />
              )}
              <User className="w-4 h-4" style={{ display: pr.author?.avatar_url ? 'none' : 'inline' }} />
              <span>
                {typeof pr.author === 'string' ? pr.author : 
                 pr.author?.display_name || pr.author?.username || pr.author?.name || 'Unknown Author'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(pr.created_on || pr.updated_on)}</span>
            </div>
            
            {pr.reviewers?.length > 0 && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Assigned</span>
              </div>
            )}
            
            {pr.reviewers?.length > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Reviewer</span>
              </div>
            )}
            
            {pr.comment_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{pr.comment_count}</span>
              </div>
            )}
            
            {pr.task_count > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{pr.task_count} tasks</span>
              </div>
            )}
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}

export default BitbucketPRCard
