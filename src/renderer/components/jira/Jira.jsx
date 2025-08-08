import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import JiraHeader from './JiraHeader'
import JiraStats from './JiraStats'
import JiraFilters from './JiraFilters'
import JiraIssueCard from './JiraIssueCard'
import JiraLoading from './JiraLoading'
import JiraError from './JiraError'
import JiraEmpty from './JiraEmpty'
import { calculateStats, filterIssues } from './JiraUtils'

const Jira = () => {
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [issueDetails, setIssueDetails] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, assigned, reported, priority
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    reported: 0,
    highPriority: 0,
    inProgress: 0
  })

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async (forceReload = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear cache if force reload is requested
      if (forceReload) {
        try {
          await window.electronAPI.clearJiraCache()
        } catch (error) {
          console.error('Error clearing Jira cache:', error)
        }
      }
      
      const jiraIssues = await window.electronAPI.getJiraIssues()
      setIssues(jiraIssues)
      setStats(calculateStats(jiraIssues))
    } catch (err) {
      console.error('Jira component: Error loading issues:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testJiraConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = await window.electronAPI.getJiraUserInfo()
      
      if (userInfo) {
        alert(`Jira connection successful! Logged in as: ${userInfo.displayName}`)
      } else {
        alert('Jira connection failed. Please check your configuration.')
      }
    } catch (err) {
      console.error('Jira connection test failed:', err)
      alert(`Jira connection test failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadIssueDetails = async (issue) => {
    try {
      const details = await window.electronAPI.getJiraIssueDetails(issue.key)
      setIssueDetails(details)
      setSelectedIssue(issue)
    } catch (err) {
      console.error('Error loading issue details:', err)
    }
  }

  const openIssue = async (issue) => {
    try {
      if (window.electronAPI) {
        const config = await window.electronAPI.getJiraConfig()
        const issueUrl = `${config.baseUrl}/browse/${issue.key}`
        await window.electronAPI.openExternal(issueUrl)
      }
    } catch (error) {
      console.error('Error opening issue:', error)
    }
  }

  const getFilteredIssues = () => {
    return filterIssues(issues, searchQuery, filter)
  }



  if (loading) {
    return <JiraLoading />
  }

  if (error) {
    return <JiraError error={error} onRetry={() => loadIssues(false)} />
  }

  const filteredIssues = getFilteredIssues()

  return (
    <div className="p-8">
      <JiraHeader />
      <JiraStats stats={stats} />
      <JiraFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onRefresh={() => loadIssues(false)}
        onForceRefresh={() => loadIssues(true)}
        onTestConnection={testJiraConnection}
      />

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <JiraEmpty searchQuery={searchQuery} filter={filter} />
        ) : (
          filteredIssues.map((issue) => (
            <JiraIssueCard 
              key={issue.id} 
              issue={issue} 
              onClick={openIssue} 
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Jira 