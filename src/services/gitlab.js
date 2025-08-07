const https = require('https');
const ConfigService = require('./config.js');
const CacheService = require('./cache.js');

class GitLabService {
  constructor () {
    this.configService = new ConfigService();
    this.cacheService = new CacheService();
  }

  getConfig () {
    return this.configService.getGitlabConfig();
  }

  async makeRequest (endpoint, options = {}) {
    const config = this.getConfig();

    if (!config.enabled || !config.apiToken) {
      throw new Error('GitLab integration not configured');
    }

    const baseUrl = config.baseUrl || 'https://gitlab.com';
    const url = `${baseUrl}/api/v4${endpoint}`;

    // Parse URL to get hostname and path
    const urlObj = new URL(url);

    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData);
            } else {
              reject(new Error(`GitLab API error: ${res.statusCode} - ${jsonData.message || data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse GitLab API response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`GitLab API request failed: ${error.message}`));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async getMergeRequests () {
    try {
      const config = this.getConfig();

      if (!config.enabled) {
        return [];
      }

      if (!config.apiToken) {
        return [];
      }

      // Check cache first
      const cacheKey = `gitlab_mrs_${config.username}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log('GitLab: Returning cached MRs data');
        return cachedData;
      }

      let mrs = [];

      if (config.username) {
        // Query 1: Get MRs assigned to user
        try {
          const endpoint1 = `/merge_requests?assignee_username=${config.username}&state=opened&order_by=updated_at&sort=desc&per_page=50`;
          const response1 = await this.makeRequest(endpoint1);
          if (response1 && response1.length > 0) {
            mrs = response1;
          }
        } catch (error) {
          console.log('GitLab Query 1 failed:', error.message);
        }

        // Query 2: Get MRs where user is reviewer
        try {
          const endpoint2 = `/merge_requests?reviewer_username=${config.username}&state=opened&order_by=updated_at&sort=desc&per_page=50`;
          const response2 = await this.makeRequest(endpoint2);
          if (response2 && response2.length > 0) {
            // Merge with existing MRs, avoiding duplicates
            const existingIds = new Set(mrs.map(mr => mr.id));
            const newMRs = response2.filter(mr => !existingIds.has(mr.id));
            mrs = [...mrs, ...newMRs];
          }
        } catch (error) {
          console.log('GitLab Query 2 failed:', error.message);
        }

        // Query 3: Get MRs authored by user
        try {
          const endpoint3 = `/merge_requests?author_username=${config.username}&state=opened&order_by=updated_at&sort=desc&per_page=50`;
          const response3 = await this.makeRequest(endpoint3);
          if (response3 && response3.length > 0) {
            // Merge with existing MRs, avoiding duplicates
            const existingIds = new Set(mrs.map(mr => mr.id));
            const newMRs = response3.filter(mr => !existingIds.has(mr.id));
            mrs = [...mrs, ...newMRs];
          }
        } catch (error) {
          console.log('GitLab Query 3 failed:', error.message);
        }
      }

      // Query 4: Get user's own MRs if no results
      if (mrs.length === 0) {
        try {
          const endpoint4 = '/user/merge_requests?state=opened&order_by=updated_at&sort=desc&per_page=50';
          const response4 = await this.makeRequest(endpoint4);
          if (response4 && response4.length > 0) {
            mrs = response4;
          }
        } catch (error) {
          console.log('GitLab Query 4 failed:', error.message);
        }
      }

      // Cache the result with warm cache for initial load
      if (this.cacheService.isEmpty()) {
        // First load - use warm cache with longer TTL
        this.cacheService.setWarmCache(cacheKey, mrs);
        console.log('GitLab: Using warm cache for initial load');
      } else {
        // Subsequent loads - use normal cache
        this.cacheService.set(cacheKey, mrs, config.refreshInterval * 1000);
      }

      return mrs;
    } catch (error) {
      console.error('Error fetching merge requests:', error);
      return [];
    }
  }

  async getMergeRequestDetails (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching MR details:', error);
      return null;
    }
  }

  async getMergeRequestReviews (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/approvals`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching MR reviews:', error);
      return null;
    }
  }

  async getMergeRequestComments (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/notes`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching MR comments:', error);
      return [];
    }
  }

  async getMergeRequestCommits (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/commits`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching MR commits:', error);
      return [];
    }
  }

  async getMergeRequestChanges (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/changes`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching MR changes:', error);
      return null;
    }
  }

  async approveMergeRequest (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/approve`;
      return await this.makeRequest(endpoint, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error approving MR:', error);
      return false;
    }
  }

  async mergeMergeRequest (mrId, projectId, mergeMethod = 'merge') {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/merge`;
      const body = JSON.stringify({ merge_method: mergeMethod });

      return await this.makeRequest(endpoint, {
        method: 'PUT',
        body
      });
    } catch (error) {
      console.error('Error merging MR:', error);
      return false;
    }
  }

  async closeMergeRequest (mrId, projectId) {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}`;
      const body = JSON.stringify({ state_event: 'close' });

      return await this.makeRequest(endpoint, {
        method: 'PUT',
        body
      });
    } catch (error) {
      console.error('Error closing MR:', error);
      return false;
    }
  }

  async getUserInfo () {
    try {
      const userInfo = await this.makeRequest('/user');
      return userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  async getGroups () {
    try {
      return await this.makeRequest('/groups');
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  async getProjects (groupId = null) {
    try {
      const endpoint = groupId ? `/groups/${groupId}/projects` : '/projects';
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async searchMergeRequests (query) {
    try {
      const endpoint = `/merge_requests?search=${encodeURIComponent(query)}&state=opened&order_by=updated_at&sort=desc`;

      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error searching merge requests:', error);
      return [];
    }
  }

  async getMergeRequestsByProject (projectId, state = 'opened') {
    try {
      const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests?state=${state}&order_by=updated_at&sort=desc`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching project merge requests:', error);
      return [];
    }
  }

  async getMergeRequestsByGroup (groupId, state = 'opened') {
    try {
      const endpoint = `/groups/${groupId}/merge_requests?state=${state}&order_by=updated_at&sort=desc`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching group merge requests:', error);
      return [];
    }
  }
}

module.exports = GitLabService;
