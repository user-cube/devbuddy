import React from 'react'
import {
  GitBranch,
  MessageSquare,
  ExternalLink,
  User,
  Calendar,
  FolderOpen,
  Tag
} from 'lucide-react'
import { getStatusIcon, getPriorityIcon, getPriorityColor, formatDate } from './JiraUtils'

const JiraIssueCard = ({ issue, onClick }) => {
  return (
    <div
      className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => onClick(issue)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(issue)}
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {issue.fields?.status?.name || 'Unknown'}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {issue.key}
            </span>
            {getPriorityIcon(issue.fields?.priority)}
            {issue.fields?.priority && (
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: getPriorityColor(issue.fields?.priority),
                  border: `1px solid ${getPriorityColor(issue.fields?.priority)}40`
                }}
              >
                {issue.fields.priority.name}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {issue.fields?.summary}
          </h3>
          
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1">
              <FolderOpen className="w-4 h-4" />
              <span>{issue.fields?.project?.name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{issue.fields?.issuetype?.name}</span>
            </div>
            
            {issue.fields?.assignee && (
              <div className="flex items-center gap-1">
                {issue.fields.assignee.avatarUrls?.['16x16'] && (
                  <img 
                    src={issue.fields.assignee.avatarUrls['16x16']} 
                    alt={issue.fields.assignee.displayName || 'Assignee'}
                    className="w-4 h-4 rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'inline'
                    }}
                  />
                )}
                <User className="w-4 h-4" style={{ display: issue.fields.assignee.avatarUrls?.['16x16'] ? 'none' : 'inline' }} />
                <span>{issue.fields.assignee.displayName}</span>
              </div>
            )}
            
            {issue.fields?.reporter && (
              <div className="flex items-center gap-1">
                {issue.fields.reporter.avatarUrls?.['16x16'] && (
                  <img 
                    src={issue.fields.reporter.avatarUrls['16x16']} 
                    alt={issue.fields.reporter.displayName || 'Reporter'}
                    className="w-4 h-4 rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'inline'
                    }}
                  />
                )}
                <User className="w-4 h-4" style={{ display: issue.fields.reporter.avatarUrls?.['16x16'] ? 'none' : 'inline' }} />
                <span>Reporter: {issue.fields.reporter.displayName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(issue.fields?.created)}</span>
            </div>
            
            {issue.fields?.comment?.total > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{issue.fields.comment.total}</span>
              </div>
            )}
          </div>
        </div>
        
        <ExternalLink className="w-4 h-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}

export default JiraIssueCard
