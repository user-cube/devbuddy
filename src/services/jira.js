const https = require('https')
const ConfigService = require('./config.js')
const CacheService = require('./cache.js')

class JiraService {
  constructor() {
    this.configService = new ConfigService()
    this.cacheService = new CacheService()
  }

  getConfig() {
    return this.configService.getJiraConfig()
  }

  async makeRequest(endpoint, options = {}) {
    const config = this.getConfig()
    
    if (!config.enabled || !config.apiToken || !config.baseUrl) {
      throw new Error('Jira integration not configured')
    }

    const url = `${config.baseUrl}/rest/api/3${endpoint}`
    
    // Parse URL to get hostname and path
    const urlObj = new URL(url)
    
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body)
    }

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data)
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData)
            } else {
              reject(new Error(`Jira API error: ${res.statusCode} - ${jsonData.errorMessages?.[0] || data}`))
            }
          } catch (error) {
            reject(new Error(`Failed to parse Jira API response: ${error.message}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(new Error(`Jira API request failed: ${error.message}`))
      })

      if (options.body) {
        req.write(options.body)
      }

      req.end()
    })
  }

  async getIssues() {
    try {
      const config = this.getConfig()
      
      if (!config.enabled) {
        return []
      }

      // Check cache first
      const cacheKey = `jira_issues_${config.username}`
      const cachedData = this.cacheService.get(cacheKey)
      if (cachedData) {
        console.log('Jira: Returning cached issues data')
        return cachedData
      }

      // Build JQL query
      let jql = 'assignee = currentUser() AND status != Done AND status != Closed ORDER BY updated DESC'
      
      // Add project filter if specified
      if (config.projectKeys && config.projectKeys.length > 0) {
        const projectFilter = config.projectKeys.map(key => `project = ${key}`).join(' OR ')
        jql = `(${projectFilter}) AND ${jql}`
      }

      const endpoint = `/search?jql=${encodeURIComponent(jql)}&maxResults=${config.maxResults || 50}&fields=summary,status,priority,issuetype,project,assignee,reporter,created,updated,description,comment,worklog`
      
      const response = await this.makeRequest(endpoint)
      const issues = response.issues || []
      
      // Cache the result
      this.cacheService.set(cacheKey, issues, config.refreshInterval * 1000)
      
      return issues
    } catch (error) {
      console.error('Error fetching Jira issues:', error)
      return []
    }
  }

  async getIssueDetails(issueKey) {
    try {
      const endpoint = `/issue/${issueKey}?fields=summary,status,priority,issuetype,project,assignee,reporter,created,updated,description,comment,worklog,attachment,components,labels`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching issue details:', error)
      return null
    }
  }

  async getIssueComments(issueKey) {
    try {
      const endpoint = `/issue/${issueKey}/comment`
      const response = await this.makeRequest(endpoint)
      return response.comments || []
    } catch (error) {
      console.error('Error fetching issue comments:', error)
      return []
    }
  }

  async getIssueWorklog(issueKey) {
    try {
      const endpoint = `/issue/${issueKey}/worklog`
      const response = await this.makeRequest(endpoint)
      return response.worklogs || []
    } catch (error) {
      console.error('Error fetching issue worklog:', error)
      return []
    }
  }

  async getIssueTransitions(issueKey) {
    try {
      const endpoint = `/issue/${issueKey}/transitions`
      const response = await this.makeRequest(endpoint)
      return response.transitions || []
    } catch (error) {
      console.error('Error fetching issue transitions:', error)
      return []
    }
  }

  async updateIssueStatus(issueKey, transitionId) {
    try {
      const endpoint = `/issue/${issueKey}/transitions`
      const body = JSON.stringify({
        transition: {
          id: transitionId
        }
      })
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error updating issue status:', error)
      return false
    }
  }

  async addComment(issueKey, comment) {
    try {
      const endpoint = `/issue/${issueKey}/comment`
      const body = JSON.stringify({
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: comment
                }
              ]
            }
          ]
        }
      })
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      return false
    }
  }

  async logWork(issueKey, timeSpent, comment = '') {
    try {
      const endpoint = `/issue/${issueKey}/worklog`
      const body = JSON.stringify({
        timeSpent: timeSpent,
        comment: comment
      })
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error logging work:', error)
      return false
    }
  }

  async getUserInfo() {
    try {
      const userInfo = await this.makeRequest('/myself')
      return userInfo
    } catch (error) {
      console.error('Error fetching user info:', error)
      return null
    }
  }

  async getProjects() {
    try {
      const response = await this.makeRequest('/project?expand=description,lead,url,projectKeys')
      return response || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  }

  async getProjectDetails(projectKey) {
    try {
      const endpoint = `/project/${projectKey}`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching project details:', error)
      return null
    }
  }

  async searchIssues(jql, maxResults = 50) {
    try {
      const endpoint = `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,status,priority,issuetype,project,assignee,reporter,created,updated`
      
      const response = await this.makeRequest(endpoint)
      return response.issues || []
    } catch (error) {
      console.error('Error searching issues:', error)
      return []
    }
  }

  async getIssuesByProject(projectKey, status = null) {
    try {
      let jql = `project = ${projectKey}`
      if (status) {
        jql += ` AND status = "${status}"`
      }
      jql += ' ORDER BY updated DESC'
      
      return await this.searchIssues(jql)
    } catch (error) {
      console.error('Error fetching project issues:', error)
      return []
    }
  }

  async getIssuesByStatus(status) {
    try {
      const jql = `status = "${status}" AND assignee = currentUser() ORDER BY updated DESC`
      return await this.searchIssues(jql)
    } catch (error) {
      console.error('Error fetching issues by status:', error)
      return []
    }
  }

  async getIssuesByPriority(priority) {
    try {
      const jql = `priority = "${priority}" AND assignee = currentUser() ORDER BY updated DESC`
      return await this.searchIssues(jql)
    } catch (error) {
      console.error('Error fetching issues by priority:', error)
      return []
    }
  }

  async getIssueTypes() {
    try {
      const response = await this.makeRequest('/issuetype')
      return response || []
    } catch (error) {
      console.error('Error fetching issue types:', error)
      return []
    }
  }

  async getStatuses() {
    try {
      const response = await this.makeRequest('/status')
      return response || []
    } catch (error) {
      console.error('Error fetching statuses:', error)
      return []
    }
  }

  async getPriorities() {
    try {
      const response = await this.makeRequest('/priority')
      return response || []
    } catch (error) {
      console.error('Error fetching priorities:', error)
      return []
    }
  }

  async createIssue(projectKey, summary, description, issueType = 'Task') {
    try {
      const endpoint = '/issue'
      const body = JSON.stringify({
        fields: {
          project: {
            key: projectKey
          },
          summary: summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: issueType
          }
        }
      })
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error creating issue:', error)
      return null
    }
  }
}

module.exports = JiraService 