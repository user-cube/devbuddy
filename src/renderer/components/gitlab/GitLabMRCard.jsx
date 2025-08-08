import React from 'react'
import {
  GitMerge,
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
import { formatDate, getStatusText, getStatusBackground, getStatusBorder, getStatusColor } from './GitLabUtils'

const GitLabMRCard = ({ mr, onClick }) => {
  const getStatusIcon = (mr) => {
    if (mr.work_in_progress) return <Clock className="w-4 h-4 text-yellow-500" />
    if (mr.merged_at) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (mr.state === 'closed') return <XCircle className="w-4 h-4 text-red-500" />
    return <GitMerge className="w-4 h-4 text-orange-500" />
  }

  return (
    <div
      className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => onClick(mr)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(mr)}
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: getStatusBackground(mr),
                color: getStatusColor(mr),
                border: getStatusBorder(mr)
              }}
            >
              {getStatusText(mr)}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              !{mr.iid}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {mr.title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span>{mr.source_branch} → {mr.target_branch}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{mr.author?.name || mr.author?.username}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(mr.created_at)}</span>
            </div>
            
            {mr.assignees?.length > 0 && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Assigned</span>
              </div>
            )}
            
            {mr.reviewers?.length > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>Reviewer</span>
              </div>
            )}
            
            {mr.user_notes_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{mr.user_notes_count}</span>
              </div>
            )}
            
            {mr.commits_count > 0 && (
              <div className="flex items-center gap-1">
                <GitCommit className="w-4 h-4" />
                <span>{mr.commits_count}</span>
              </div>
            )}
            
            {mr.changes_count > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{mr.changes_count} files</span>
              </div>
            )}
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}

export default GitLabMRCard
