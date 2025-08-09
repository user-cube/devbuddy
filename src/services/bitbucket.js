const https = require('https');
const ConfigService = require('./config.js');
const CacheService = require('./cache.js');

class BitbucketService {
  constructor () {
    this.configService = new ConfigService();
    this.cacheService = new CacheService();
  }

  getConfig () {
    return this.configService.getBitbucketConfig();
  }

  async makeRequest (endpoint, options = {}) {
    const config = this.getConfig();

    if (!config.enabled || !config.apiToken) {
      throw new Error('Bitbucket integration not configured');
    }

    if (!config.email) {
      throw new Error('Bitbucket email is required for Atlassian API Token authentication');
    }

    const baseUrl = config.baseUrl || 'https://api.bitbucket.org';
    const url = `${baseUrl}/2.0${endpoint}`;

    // Parse URL to get hostname and path
    const urlObj = new URL(url);

    const authUser = config.email; // Must use email for Atlassian API Token
    const authHeader = `Basic ${Buffer.from(`${authUser}:${config.apiToken}`).toString('base64')}`;

    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Authorization': authHeader,
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
            if (data.length === 0) {
              reject(new Error(`Bitbucket API returned empty response (Status: ${res.statusCode})`));
              return;
            }

            const jsonData = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData);
            } else if (res.statusCode === 401) {
              reject(new Error('Bitbucket authentication failed (401). Please check your email and API token. Make sure you\'re using your Atlassian email address.'));
            } else if (res.statusCode === 403) {
              reject(new Error(`Bitbucket access denied (403). Your API token may not have the required permissions or access to Bitbucket. Error: ${jsonData.error?.message || data}`));
            } else {
              reject(new Error(`Bitbucket API error: ${res.statusCode} - ${jsonData.error?.message || data}`));
            }
          } catch (error) {
            console.error('Bitbucket API Response parsing error:', error.message);
            reject(new Error(`Failed to parse Bitbucket API response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Bitbucket API request failed: ${error.message}`));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async getPullRequests () {
    try {
      const config = this.getConfig();

      if (!config.enabled) {
        return [];
      }

      if (!config.apiToken) {
        return [];
      }

      // Check cache first
      const cacheKey = `bitbucket_prs_${config.username || 'workspaces'}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log('Bitbucket: Returning cached PRs data');
        return cachedData;
      }

      let prs = [];

      // First, test the connection
      try {
        await this.testConnection();
      } catch (error) {
        console.error('Bitbucket: Connection test failed:', error);
        // Don't fail the entire request, just return empty results
        return [];
      }

      // Get PRs from specified workspaces
      if (config.workspaces && config.workspaces.length > 0) {
        for (const workspace of config.workspaces) {
          try {
            const workspaceRepos = await this.makeRequest(`/repositories/${workspace}`);

            if (workspaceRepos.values) {
              for (const repo of workspaceRepos.values.slice(0, 5)) { // Limit to first 5 repos per workspace
                try {
                  const repoPRs = await this.makeRequest(`/repositories/${repo.full_name}/pullrequests?state=OPEN`);
                  if (repoPRs.values) {
                    prs = prs.concat(repoPRs.values);
                  }
                } catch (error) {
                  console.error(`Bitbucket: Error fetching PRs for workspace repo ${repo.full_name}:`, error.message);
                }
              }
            }
          } catch (error) {
            console.error(`Bitbucket: Error fetching workspace ${workspace}:`, error.message);
          }
        }
      } else {
        // If no workspaces specified, get all accessible workspaces
        try {
          const workspaces = await this.makeRequest('/workspaces?pagelen=100');

          if (workspaces.values) {
            for (const workspace of workspaces.values.slice(0, 3)) { // Limit to first 3 workspaces
              try {
                const workspaceRepos = await this.makeRequest(`/repositories/${workspace.slug}`);

                if (workspaceRepos.values) {
                  for (const repo of workspaceRepos.values.slice(0, 3)) { // Limit to first 3 repos per workspace
                    try {
                      const repoPRs = await this.makeRequest(`/repositories/${repo.full_name}/pullrequests?state=OPEN`);
                      if (repoPRs.values) {
                        prs = prs.concat(repoPRs.values);
                      }
                    } catch (error) {
                      console.error(`Bitbucket: Error fetching PRs for workspace repo ${repo.full_name}:`, error.message);
                    }
                  }
                }
              } catch (error) {
                console.error(`Bitbucket: Error fetching workspace ${workspace.slug}:`, error.message);
              }
            }
          }
        } catch (error) {
          console.error('Bitbucket: Error fetching workspaces:', error.message);
        }
      }

      // Remove duplicates and filter
      const uniquePRs = prs.filter((pr, index, self) =>
        index === self.findIndex(p => p.id === pr.id)
      );

      // Apply filters
      let filteredPRs = uniquePRs;

      if (!config.showDrafts) {
        filteredPRs = filteredPRs.filter(pr => !pr.title.toLowerCase().includes('[wip]') && !pr.title.toLowerCase().includes('[draft]'));
      }

      if (!config.showClosed) {
        filteredPRs = filteredPRs.filter(pr => pr.state === 'OPEN');
      }

      // Sort by updated date (newest first)
      filteredPRs.sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on));

      // Limit results
      const limitedPRs = filteredPRs.slice(0, config.maxResults || 50);

      // Format PRs for UI
      const formattedPRs = limitedPRs.map(pr => this.formatPullRequest(pr));

      // Cache the results with warm cache for initial load
      if (this.cacheService.isEmpty()) {
        // First load - use warm cache with longer TTL
        this.cacheService.setWarmCache(cacheKey, formattedPRs);
        console.log('Bitbucket: Using warm cache for initial load');
      } else {
        // Subsequent loads - use normal cache
        this.cacheService.set(cacheKey, formattedPRs, config.refreshInterval * 1000);
      }

      return formattedPRs;

    } catch (error) {
      console.error('Bitbucket: Error fetching pull requests:', error);
      throw error;
    }
  }

  async getPullRequestDetails (prId, repoSlug) {
    try {
      // Check cache first
      const cacheKey = `bitbucket_pr_details_${repoSlug}_${prId}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Bitbucket: Returning cached PR details for ${repoSlug}#${prId}`);
        return cachedData;
      }

      const prDetails = await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}`);

      // Cache the result
      this.cacheService.set(cacheKey, prDetails, 900); // Cache for 15 minutes

      return prDetails;
    } catch (error) {
      console.error('Bitbucket: Error fetching PR details:', error);
      throw error;
    }
  }

  async getPullRequestReviews (prId, repoSlug) {
    try {
      // Check cache first
      const cacheKey = `bitbucket_pr_reviews_${repoSlug}_${prId}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Bitbucket: Returning cached PR reviews for ${repoSlug}#${prId}`);
        return cachedData;
      }

      const reviews = await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/participants`);

      // Cache the result
      this.cacheService.set(cacheKey, reviews, 900); // Cache for 15 minutes

      return reviews;
    } catch (error) {
      console.error('Bitbucket: Error fetching PR reviews:', error);
      throw error;
    }
  }

  async getPullRequestComments (prId, repoSlug) {
    try {
      // Check cache first
      const cacheKey = `bitbucket_pr_comments_${repoSlug}_${prId}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Bitbucket: Returning cached PR comments for ${repoSlug}#${prId}`);
        return cachedData;
      }

      const comments = await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/comments`);

      // Cache the result
      this.cacheService.set(cacheKey, comments, 600); // Cache for 10 minutes

      return comments;
    } catch (error) {
      console.error('Bitbucket: Error fetching PR comments:', error);
      throw error;
    }
  }

  async getPullRequestCommits (prId, repoSlug) {
    try {
      // Check cache first
      const cacheKey = `bitbucket_pr_commits_${repoSlug}_${prId}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Bitbucket: Returning cached PR commits for ${repoSlug}#${prId}`);
        return cachedData;
      }

      const commits = await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/commits`);

      // Cache the result
      this.cacheService.set(cacheKey, commits, 900); // Cache for 15 minutes

      return commits;
    } catch (error) {
      console.error('Bitbucket: Error fetching PR commits:', error);
      throw error;
    }
  }

  async getPullRequestChanges (prId, repoSlug) {
    try {
      // Check cache first
      const cacheKey = `bitbucket_pr_changes_${repoSlug}_${prId}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Bitbucket: Returning cached PR changes for ${repoSlug}#${prId}`);
        return cachedData;
      }

      const changes = await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/diffstat`);

      // Cache the result
      this.cacheService.set(cacheKey, changes, 900); // Cache for 15 minutes

      return changes;
    } catch (error) {
      console.error('Bitbucket: Error fetching PR changes:', error);
      throw error;
    }
  }

  async approvePullRequest (prId, repoSlug) {
    try {
      return await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/approve`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Bitbucket: Error approving PR:', error);
      throw error;
    }
  }

  async mergePullRequest (prId, repoSlug, mergeStrategy = 'merge_commit') {
    try {
      return await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/merge`, {
        method: 'POST',
        body: JSON.stringify({
          merge_strategy: mergeStrategy
        })
      });
    } catch (error) {
      console.error('Bitbucket: Error merging PR:', error);
      throw error;
    }
  }

  async closePullRequest (prId, repoSlug) {
    try {
      return await this.makeRequest(`/repositories/${repoSlug}/pullrequests/${prId}/decline`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Bitbucket: Error closing PR:', error);
      throw error;
    }
  }

  async getUserInfo () {
    try {
      const config = this.getConfig();

      // Check cache first
      const cacheKey = `bitbucket_user_${config.username || 'workspaces'}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log('Bitbucket: Returning cached user info');
        return cachedData;
      }

      const userInfo = await this.makeRequest('/user');

      // Cache the result
      this.cacheService.set(cacheKey, userInfo, 3600); // Cache for 1 hour

      return userInfo;
    } catch (error) {
      console.error('Bitbucket: Error fetching user info:', error);

      // If /user fails, try to get user info from workspaces endpoint
      try {
        const workspaces = await this.makeRequest('/workspaces?pagelen=1');
        const fallbackUserInfo = {
          username: 'workspaces_access',
          display_name: 'Connected via workspaces',
          account_id: 'workspaces_access',
          connection_method: 'workspaces_fallback',
          workspaces_count: workspaces.size || 0
        };

        // Cache the fallback result
        const config = this.getConfig();
        const cacheKey = `bitbucket_user_${config.username || 'workspaces'}`;
        this.cacheService.set(cacheKey, fallbackUserInfo, 3600); // Cache for 1 hour

        return fallbackUserInfo;
      } catch {
        // If workspaces also fails, try repositories endpoint
        const config = this.getConfig();
        if (config.username) {
          try {
            await this.makeRequest(`/repositories/${config.username}?pagelen=1`);
            const fallbackUserInfo = {
              username: config.username,
              display_name: config.username,
              account_id: config.username,
              connection_method: 'repositories_fallback'
            };

            // Cache the fallback result
            const cacheKey = `bitbucket_user_${config.username || 'workspaces'}`;
            this.cacheService.set(cacheKey, fallbackUserInfo, 3600); // Cache for 1 hour

            return fallbackUserInfo;
          } catch {
            // Return error instead of fallback
            const basicUserInfo = {
              username: config.username || 'unknown',
              display_name: config.username || 'Unknown User',
              account_id: config.username || 'unknown',
              connection_method: 'error_fallback',
              error: 'Authentication failed. Please check your API token and email address.'
            };

            // Cache the fallback result
            const cacheKey = `bitbucket_user_${config.username || 'workspaces'}`;
            this.cacheService.set(cacheKey, basicUserInfo, 3600); // Cache for 1 hour

            return basicUserInfo;
          }
        }

        // Return error instead of fallback
        const basicUserInfo = {
          username: 'unknown',
          display_name: 'Unknown User',
          account_id: 'unknown',
          connection_method: 'error_fallback',
          error: 'Authentication failed. Please check your API token and email address.'
        };

        // Cache the fallback result
        const cacheKey = `bitbucket_user_${config.username || 'workspaces'}`;
        this.cacheService.set(cacheKey, basicUserInfo, 3600); // Cache for 1 hour

        return basicUserInfo;
      }
    }
  }

  async testConnection () {
    try {
      // Test with a simpler endpoint first
      try {
        const userInfo = await this.getUserInfo();

        // Check if getUserInfo returned an error
        if (userInfo && userInfo.error) {
          return {
            display_name: 'Unknown User',
            username: 'unknown',
            connection_method: 'error_fallback',
            error: userInfo.error
          };
        }

        return userInfo;
      } catch {
        // Try with workspaces endpoint as fallback
        try {
          const workspaces = await this.makeRequest('/workspaces?pagelen=1');
          return {
            display_name: 'Connected via workspaces',
            username: 'workspaces_access',
            connection_method: 'workspaces',
            workspaces_count: workspaces.size || 0
          };
        } catch {
          // Try with repositories endpoint as last fallback
          const config = this.getConfig();
          if (config.username) {
            try {
              await this.makeRequest(`/repositories/${config.username}?pagelen=1`);
              return { display_name: config.username, username: config.username, connection_method: 'repositories' };
            } catch {
              // Return error instead of fallback
              return {
                display_name: config.username || 'Unknown User',
                username: config.username || 'unknown',
                connection_method: 'error_fallback',
                error: 'Authentication failed. Please check your API token and email address.'
              };
            }
          } else {
            // Return error instead of fallback
            return {
              display_name: 'Unknown User',
              username: 'unknown',
              connection_method: 'error_fallback',
              error: 'Authentication failed. Please check your API token and email address.'
            };
          }
        }
      }
    } catch (error) {
      console.error('Bitbucket: Connection test failed:', error);
      // Return error instead of fallback
      const config = this.getConfig();
      return {
        display_name: config.username || 'Unknown User',
        username: config.username || 'unknown',
        connection_method: 'error_fallback',
        error: 'Authentication failed. Please check your API token and email address.'
      };
    }
  }

  async getWorkspaces () {
    try {
      const config = this.getConfig();

      // Check cache first
      const cacheKey = `bitbucket_workspaces_${config.username || 'all'}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log('Bitbucket: Returning cached workspaces data');
        return cachedData;
      }

      const workspaces = await this.makeRequest('/workspaces');

      // Cache the result
      this.cacheService.set(cacheKey, workspaces, 1800); // Cache for 30 minutes

      return workspaces;
    } catch (error) {
      console.error('Bitbucket: Error fetching workspaces:', error);
      throw error;
    }
  }

  async getRepositories (workspace = null) {
    try {
      const config = this.getConfig();

      // Check cache first
      const cacheKey = `bitbucket_repos_${workspace || 'user'}_${config.username || 'all'}`;
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Bitbucket: Returning cached repositories data for ${workspace || 'user'}`);
        return cachedData;
      }

      let repositories;
      if (workspace) {
        repositories = await this.makeRequest(`/repositories/${workspace}`);
      } else {
        repositories = await this.makeRequest('/repositories');
      }

      // Cache the result
      this.cacheService.set(cacheKey, repositories, 1800); // Cache for 30 minutes

      return repositories;
    } catch (error) {
      console.error('Bitbucket: Error fetching repositories:', error);
      throw error;
    }
  }

  async searchPullRequests (query) {
    try {
      const searchQuery = encodeURIComponent(query);
      return await this.makeRequest(`/repositories?q=state="OPEN" AND title~"${searchQuery}"`);
    } catch (error) {
      console.error('Bitbucket: Error searching PRs:', error);
      throw error;
    }
  }

  async getPullRequestsByRepository (repoSlug, state = 'OPEN') {
    try {
      return await this.makeRequest(`/repositories/${repoSlug}/pullrequests?state=${state}`);
    } catch (error) {
      console.error('Bitbucket: Error fetching repository PRs:', error);
      throw error;
    }
  }

  async getPullRequestsByWorkspace (workspace, state = 'OPEN') {
    try {
      const repos = await this.getRepositories(workspace);
      let allPRs = [];

      if (repos.values) {
        for (const repo of repos.values.slice(0, 10)) { // Limit to first 10 repos
          try {
            const repoPRs = await this.getPullRequestsByRepository(repo.full_name, state);
            if (repoPRs.values) {
              allPRs = allPRs.concat(repoPRs.values);
            }
          } catch (error) {
            console.log(`Bitbucket: Error fetching PRs for repo ${repo.full_name}:`, error.message);
          }
        }
      }

      return { values: allPRs };
    } catch (error) {
      console.error('Bitbucket: Error fetching workspace PRs:', error);
      throw error;
    }
  }

  // Helper method to format PR data for UI
  formatPullRequest (pr) {
    return {
      id: pr.id,
      title: pr.title,
      description: pr.description || '',
      state: pr.state,
      url: pr.links.html.href,
      created_at: pr.created_on,
      updated_at: pr.updated_on,
      author: {
        username: pr.author.username,
        display_name: pr.author.display_name,
        avatar_url: pr.author.links?.avatar?.href
      },
      source: {
        branch: pr.source.branch.name,
        repository: pr.source.repository.full_name
      },
      destination: {
        branch: pr.destination.branch.name,
        repository: pr.destination.repository.full_name
      },
      reviewers: pr.reviewers || [],
      participants: pr.participants || [],
      comment_count: pr.comment_count || 0,
      task_count: pr.task_count || 0,
      is_draft: pr.title.toLowerCase().includes('[wip]') || pr.title.toLowerCase().includes('[draft]')
    };
  }
}

module.exports = BitbucketService;
