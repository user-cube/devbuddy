const https = require('https')
const ConfigService = require('./config.js')

class GitHubService {
  constructor() {
    this.configService = new ConfigService()
    this.baseUrl = 'https://api.github.com'
  }

  getConfig() {
    return this.configService.getGithubConfig()
  }

  async makeRequest(endpoint, options = {}) {
    const config = this.getConfig()
    
    if (!config.enabled || !config.apiToken) {
      throw new Error('GitHub integration not configured')
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const requestOptions = {
      hostname: 'api.github.com',
      path: endpoint,
      method: options.method || 'GET',
      headers: {
        'Authorization': `token ${config.apiToken}`,
        'User-Agent': 'DevBuddy-App',
        'Accept': 'application/vnd.github.v3+json',
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
              reject(new Error(`GitHub API error: ${res.statusCode} - ${jsonData.message || data}`))
            }
          } catch (error) {
            reject(new Error(`Failed to parse GitHub API response: ${error.message}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(new Error(`GitHub API request failed: ${error.message}`))
      })

      if (options.body) {
        req.write(options.body)
      }

      req.end()
    })
  }

  async getPullRequests() {
    try {
      const config = this.getConfig()
      
      if (!config.enabled) {
        return []
      }
      
      if (!config.apiToken) {
        return []
      }
      
      // Try different queries to find PRs
      let prs = []
      
      if (config.username) {
        // Query 1: Search for PRs assigned to user
        try {
          const endpoint1 = `/search/issues?q=is:pr+assignee:${config.username}+state:open&sort=updated&order=desc&per_page=${config.maxResults || 50}`
          const response1 = await this.makeRequest(endpoint1)
          if (response1.items && response1.items.length > 0) {
            prs = response1.items
          }
        } catch (error) {
          console.log('Query 1 failed:', error.message)
        }
        
        // Query 2: Search for PRs where user is requested as reviewer
        try {
          const endpoint2 = `/search/issues?q=is:pr+review-requested:${config.username}+state:open&sort=updated&order=desc&per_page=${config.maxResults || 50}`
          const response2 = await this.makeRequest(endpoint2)
          if (response2.items && response2.items.length > 0) {
            // Merge with existing PRs, avoiding duplicates
            const existingIds = new Set(prs.map(pr => pr.id))
            const newPRs = response2.items.filter(pr => !existingIds.has(pr.id))
            prs = [...prs, ...newPRs]
          }
        } catch (error) {
          console.log('Query 2 failed:', error.message)
        }
        
        // Query 3: Search for PRs authored by user
        try {
          const endpoint3 = `/search/issues?q=is:pr+author:${config.username}+state:open&sort=updated&order=desc&per_page=${config.maxResults || 50}`
          const response3 = await this.makeRequest(endpoint3)
          if (response3.items && response3.items.length > 0) {
            // Merge with existing PRs, avoiding duplicates
            const existingIds = new Set(prs.map(pr => pr.id))
            const newPRs = response3.items.filter(pr => !existingIds.has(pr.id))
            prs = [...prs, ...newPRs]
          }
        } catch (error) {
          console.log('Query 3 failed:', error.message)
        }
      }
      
      // Query 4: Get user's own issues (includes PRs)
      if (prs.length === 0) {
        try {
          const endpoint4 = `/user/issues?filter=assigned&state=open&sort=updated&direction=desc&per_page=${config.maxResults || 50}`
          const response4 = await this.makeRequest(endpoint4)
          if (response4 && response4.length > 0) {
            // Filter to only include PRs
            prs = response4.filter(item => item.pull_request)
          }
        } catch (error) {
          console.log('Query 4 failed:', error.message)
        }
      }
      
      return prs
    } catch (error) {
      console.error('Error fetching pull requests:', error)
      return []
    }
  }

  async getPullRequestDetails(prNumber, repo) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching PR details:', error)
      return null
    }
  }

  async getPullRequestReviews(prNumber, repo) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}/reviews`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching PR reviews:', error)
      return []
    }
  }

  async getPullRequestComments(prNumber, repo) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}/comments`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching PR comments:', error)
      return []
    }
  }

  async getPullRequestCommits(prNumber, repo) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}/commits`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching PR commits:', error)
      return []
    }
  }

  async getPullRequestFiles(prNumber, repo) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}/files`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching PR files:', error)
      return []
    }
  }

  async reviewPullRequest(prNumber, repo, review) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}/reviews`
      const body = JSON.stringify(review)
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body
      })
    } catch (error) {
      console.error('Error reviewing PR:', error)
      return false
    }
  }

  async mergePullRequest(prNumber, repo, mergeMethod = 'merge') {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}/merge`
      const body = JSON.stringify({ merge_method: mergeMethod })
      
      return await this.makeRequest(endpoint, {
        method: 'PUT',
        body
      })
    } catch (error) {
      console.error('Error merging PR:', error)
      return false
    }
  }

  async closePullRequest(prNumber, repo) {
    try {
      const endpoint = `/repos/${repo}/pulls/${prNumber}`
      const body = JSON.stringify({ state: 'closed' })
      
      return await this.makeRequest(endpoint, {
        method: 'PATCH',
        body
      })
    } catch (error) {
      console.error('Error closing PR:', error)
      return false
    }
  }

  async getUserInfo() {
    try {
      const userInfo = await this.makeRequest('/user')
      return userInfo
    } catch (error) {
      console.error('Error fetching user info:', error)
      return null
    }
  }

  async getOrganizations() {
    try {
      return await this.makeRequest('/user/orgs')
    } catch (error) {
      console.error('Error fetching organizations:', error)
      return []
    }
  }

  async getRepositories(org = null) {
    try {
      const endpoint = org ? `/orgs/${org}/repos` : '/user/repos'
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching repositories:', error)
      return []
    }
  }

  async searchPullRequests(query) {
    try {
      const config = this.getConfig()
      const endpoint = `/search/issues?q=${encodeURIComponent(query)}&type=pr&sort=updated&order=desc`
      
      const response = await this.makeRequest(endpoint)
      return response.items || []
    } catch (error) {
      console.error('Error searching pull requests:', error)
      return []
    }
  }

  async getPullRequestsByRepo(repo, state = 'open') {
    try {
      const endpoint = `/repos/${repo}/pulls?state=${state}&sort=updated&direction=desc`
      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error('Error fetching repository pull requests:', error)
      return []
    }
  }

  async getPullRequestsByOrg(org, state = 'open') {
    try {
      const config = this.getConfig()
      const endpoint = `/search/issues?q=is:pr+org:${org}+assignee:${config.username}+state:${state}&sort=updated&order=desc`
      
      const response = await this.makeRequest(endpoint)
      return response.items || []
    } catch (error) {
      console.error('Error fetching organization pull requests:', error)
      return []
    }
  }
}

module.exports = GitHubService 