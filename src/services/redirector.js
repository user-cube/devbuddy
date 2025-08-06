const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')
const os = require('os')
const yaml = require('js-yaml')

class RedirectorService {
  constructor() {
    this.configDir = path.join(os.homedir(), '.devbuddy')
    this.redirectsPath = path.join(this.configDir, 'redirects.yaml')
    this.configPath = path.join(this.configDir, 'config.yaml')
    this.server = null
    this.port = this.getPortFromConfig()
    this.defaultRedirects = this.getDefaultRedirects()
  }

  getDefaultRedirects() {
    return {
      'localhost': {
        'jira': 'https://jira.atlassian.net',
        'github': 'https://github.com',
        'gitlab': 'https://gitlab.com',
        'staging': 'https://staging.yourapp.com',
        'prod': 'https://yourapp.com'
      },
      'devbuddy.local': {
        'jira': 'https://jira.atlassian.net',
        'github': 'https://github.com',
        'gitlab': 'https://gitlab.com',
        'staging': 'https://staging.yourapp.com',
        'prod': 'https://yourapp.com'
      }
    }
  }

  loadRedirects() {
    try {
      this.ensureConfigDir()
      
      if (!fs.existsSync(this.redirectsPath)) {
        this.saveRedirects(this.defaultRedirects)
        return this.defaultRedirects
      }

      const redirectsData = fs.readFileSync(this.redirectsPath, 'utf8')
      const redirects = yaml.load(redirectsData)
      
      return redirects || this.defaultRedirects
    } catch (error) {
      console.error('Error loading redirects:', error)
      return this.defaultRedirects
    }
  }

  saveRedirects(redirects) {
    try {
      this.ensureConfigDir()
      const yamlData = yaml.dump(redirects, { 
        indent: 2,
        lineWidth: 120,
        noRefs: true
      })
      fs.writeFileSync(this.redirectsPath, yamlData, 'utf8')
      return true
    } catch (error) {
      console.error('Error saving redirects:', error)
      return false
    }
  }

  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true })
    }
  }

  getPortFromConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8')
        const config = yaml.load(configData)
        return config?.app?.redirectorPort || 10000
      }
    } catch (error) {
      console.error('Error reading port from config:', error)
    }
    return 10000 // Default port
  }

  getRedirects() {
    return this.loadRedirects()
  }

  updateRedirects(redirects) {
    return this.saveRedirects(redirects)
  }

  addRedirect(domain, path, targetUrl) {
    const redirects = this.loadRedirects()
    
    if (!redirects[domain]) {
      redirects[domain] = {}
    }
    
    redirects[domain][path] = targetUrl
    return this.saveRedirects(redirects)
  }

  removeRedirect(domain, path) {
    const redirects = this.loadRedirects()
    
    if (redirects[domain] && redirects[domain][path]) {
      delete redirects[domain][path]
      
      // Remove domain if empty
      if (Object.keys(redirects[domain]).length === 0) {
        delete redirects[domain]
      }
      
      return this.saveRedirects(redirects)
    }
    
    return false
  }

  startServer() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        console.log('Redirector server already running')
        resolve()
        return
      }

      this.server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true)
        const host = req.headers.host
        const pathname = parsedUrl.pathname.slice(1) // Remove leading slash
        
        console.log(`Redirect request: ${host}${req.url}`)
        
        const redirects = this.loadRedirects()
        const domain = host.split(':')[0] // Remove port if present
        
        if (redirects[domain] && redirects[domain][pathname]) {
          const targetUrl = redirects[domain][pathname]
          console.log(`Redirecting ${host}${req.url} to ${targetUrl}`)
          
          res.writeHead(302, {
            'Location': targetUrl,
            'Content-Type': 'text/html'
          })
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Redirecting... - DevBuddy</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                  color: #e0e0e0;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  line-height: 1.6;
                }
                
                .redirect-container {
                  text-align: center;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 16px;
                  padding: 3rem;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  max-width: 500px;
                  width: 90%;
                }
                
                .logo {
                  font-size: 2rem;
                  font-weight: bold;
                  background: linear-gradient(45deg, #667eea, #764ba2);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  margin-bottom: 1rem;
                }
                
                .redirect-icon {
                  font-size: 3rem;
                  margin-bottom: 1rem;
                  animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                  100% { transform: scale(1); }
                }
                
                .redirect-title {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #51cf66;
                  margin-bottom: 1rem;
                }
                
                .redirect-message {
                  font-size: 1.1rem;
                  color: #a0a0a0;
                  margin-bottom: 2rem;
                }
                
                .target-link {
                  display: inline-block;
                  background: linear-gradient(45deg, #667eea, #764ba2);
                  color: white;
                  text-decoration: none;
                  padding: 1rem 2rem;
                  border-radius: 8px;
                  font-weight: bold;
                  transition: all 0.3s ease;
                  margin-bottom: 1rem;
                }
                
                .target-link:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }
                
                .auto-redirect {
                  font-size: 0.9rem;
                  color: #868e96;
                  font-style: italic;
                }
                
                .spinner {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  border: 3px solid rgba(255, 255, 255, 0.3);
                  border-radius: 50%;
                  border-top-color: #51cf66;
                  animation: spin 1s ease-in-out infinite;
                  margin-right: 0.5rem;
                }
                
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              </style>
            </head>
            <body>
              <div class="redirect-container">
                <div class="logo">🚀 DevBuddy</div>
                <div class="redirect-icon">⏳</div>
                <div class="redirect-title">Redirecting...</div>
                <div class="redirect-message">
                  You are being redirected to the target URL
                </div>
                <a href="${targetUrl}" class="target-link">
                  <span class="spinner"></span>
                  ${targetUrl}
                </a>
                <div class="auto-redirect">
                  If you are not redirected automatically, click the link above
                </div>
              </div>
              
              <script>
                // Auto-redirect after 2 seconds
                setTimeout(() => {
                  window.location.href = '${targetUrl}';
                }, 2000);
              </script>
            </body>
            </html>
          `)
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' })
          
          // Generate HTML for all available redirects across all domains
          let allRedirectsHtml = ''
          let hasRedirects = false
          
          Object.entries(redirects).forEach(([redirectDomain, paths]) => {
            if (Object.keys(paths).length > 0) {
              hasRedirects = true
              allRedirectsHtml += `
                <div class="domain-section">
                  <h3 class="domain-title">${redirectDomain}</h3>
                  <div class="redirects-grid">
                    ${Object.entries(paths).map(([path, url]) => `
                      <div class="redirect-item">
                        <div class="redirect-source">
                          <span class="domain">${redirectDomain}</span>
                          <span class="path">/${path}</span>
                        </div>
                        <div class="redirect-arrow">→</div>
                        <div class="redirect-target">
                          <a href="http://${redirectDomain}:${this.port}/${path}" class="test-link">Test</a>
                          <span class="target-url">${url}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `
            }
          })
          
          if (!hasRedirects) {
            allRedirectsHtml = '<p class="no-redirects">No redirects configured yet. Configure them in DevBuddy app.</p>'
          }
          
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Redirect Not Found - DevBuddy</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                  color: #e0e0e0;
                  min-height: 100vh;
                  padding: 2rem;
                  line-height: 1.6;
                }
                
                .container {
                  max-width: 1200px;
                  margin: 0 auto;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 16px;
                  padding: 2rem;
                  backdrop-filter: blur(10px);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .header {
                  text-align: center;
                  margin-bottom: 2rem;
                  padding-bottom: 1rem;
                  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                }
                
                .logo {
                  font-size: 2.5rem;
                  font-weight: bold;
                  background: linear-gradient(45deg, #667eea, #764ba2);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  margin-bottom: 0.5rem;
                }
                
                .error-code {
                  font-size: 4rem;
                  font-weight: bold;
                  color: #ff6b6b;
                  margin-bottom: 0.5rem;
                }
                
                .error-message {
                  font-size: 1.2rem;
                  color: #a0a0a0;
                  margin-bottom: 1rem;
                }
                
                .requested-url {
                  background: rgba(255, 107, 107, 0.1);
                  border: 1px solid rgba(255, 107, 107, 0.3);
                  border-radius: 8px;
                  padding: 1rem;
                  margin: 1rem 0;
                  font-family: 'Monaco', 'Menlo', monospace;
                  font-size: 0.9rem;
                  color: #ff6b6b;
                }
                
                .help-section {
                  background: rgba(102, 126, 234, 0.1);
                  border: 1px solid rgba(102, 126, 234, 0.3);
                  border-radius: 8px;
                  padding: 1.5rem;
                  margin: 1.5rem 0;
                }
                
                .help-title {
                  font-size: 1.3rem;
                  font-weight: bold;
                  color: #667eea;
                  margin-bottom: 1rem;
                }
                
                .help-steps {
                  list-style: none;
                  counter-reset: step-counter;
                }
                
                .help-steps li {
                  counter-increment: step-counter;
                  margin-bottom: 0.8rem;
                  padding-left: 2rem;
                  position: relative;
                }
                
                .help-steps li::before {
                  content: counter(step-counter);
                  position: absolute;
                  left: 0;
                  top: 0;
                  background: #667eea;
                  color: white;
                  width: 1.5rem;
                  height: 1.5rem;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.8rem;
                  font-weight: bold;
                }
                
                .redirects-section {
                  margin-top: 2rem;
                }
                
                .redirects-title {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #51cf66;
                  margin-bottom: 1rem;
                  text-align: center;
                }
                
                .domain-section {
                  margin-bottom: 2rem;
                }
                
                .domain-title {
                  font-size: 1.2rem;
                  font-weight: bold;
                  color: #74c0fc;
                  margin-bottom: 1rem;
                  padding: 0.5rem;
                  background: rgba(116, 192, 252, 0.1);
                  border-radius: 6px;
                }
                
                .redirects-grid {
                  display: grid;
                  gap: 1rem;
                }
                
                .redirect-item {
                  display: flex;
                  align-items: center;
                  background: rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 8px;
                  padding: 1rem;
                  transition: all 0.3s ease;
                }
                
                .redirect-item:hover {
                  background: rgba(255, 255, 255, 0.1);
                  border-color: rgba(255, 255, 255, 0.2);
                  transform: translateY(-2px);
                }
                
                .redirect-source {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }
                
                .domain {
                  color: #74c0fc;
                  font-weight: bold;
                }
                
                .path {
                  color: #ffd43b;
                  font-family: 'Monaco', 'Menlo', monospace;
                }
                
                .redirect-arrow {
                  margin: 0 1rem;
                  color: #868e96;
                  font-size: 1.2rem;
                  font-weight: bold;
                }
                
                .redirect-target {
                  flex: 2;
                  display: flex;
                  align-items: center;
                  gap: 1rem;
                }
                
                .test-link {
                  background: #51cf66;
                  color: white;
                  text-decoration: none;
                  padding: 0.3rem 0.8rem;
                  border-radius: 4px;
                  font-size: 0.8rem;
                  font-weight: bold;
                  transition: background 0.3s ease;
                }
                
                .test-link:hover {
                  background: #40c057;
                }
                
                .target-url {
                  color: #a0a0a0;
                  font-size: 0.9rem;
                  word-break: break-all;
                }
                
                .no-redirects {
                  text-align: center;
                  color: #868e96;
                  font-style: italic;
                  padding: 2rem;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 2rem;
                  padding-top: 1rem;
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
                  color: #868e96;
                  font-size: 0.9rem;
                }
                
                @media (max-width: 768px) {
                  body {
                    padding: 1rem;
                  }
                  
                  .container {
                    padding: 1rem;
                  }
                  
                  .redirect-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.5rem;
                  }
                  
                  .redirect-arrow {
                    transform: rotate(90deg);
                    margin: 0;
                  }
                  
                  .redirect-target {
                    width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🚀 DevBuddy</div>
                  <div class="error-code">404</div>
                  <div class="error-message">Redirect Not Found</div>
                  <div class="requested-url">${host}${req.url}</div>
                </div>
                
                <div class="help-section">
                  <div class="help-title">💡 How to fix this:</div>
                  <ol class="help-steps">
                    <li>Open the DevBuddy application</li>
                    <li>Go to the "Redirects" page</li>
                    <li>Add a new redirect for "${pathname}"</li>
                    <li>Save your configuration</li>
                    <li>Try accessing the URL again</li>
                  </ol>
                </div>
                
                <div class="redirects-section">
                  <div class="redirects-title">📋 Available Redirects</div>
                  ${allRedirectsHtml}
                </div>
                
                <div class="footer">
                  <p>DevBuddy Local Redirector • Port ${this.port} • Powered by Electron</p>
                </div>
              </div>
            </body>
            </html>
          `)
        }
      })

      this.server.listen(this.port, () => {
        console.log(`Redirector server running on port ${this.port}`)
        console.log(`Available domains: localhost, devbuddy.local`)
        console.log(`For devbuddy.local, add to /etc/hosts: 127.0.0.1 devbuddy.local`)
        resolve()
      })

      this.server.on('error', (error) => {
        if (error.code === 'EACCES') {
          console.error(`Permission denied to bind to port ${this.port}. Try running with sudo or use a different port.`)
        } else {
          console.error('Redirector server error:', error)
        }
        reject(error)
      })
    })
  }

  stopServer() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null
          console.log('Redirector server stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  isServerRunning() {
    return this.server !== null
  }

  updatePort(newPort) {
    if (this.isServerRunning()) {
      console.log('Cannot change port while server is running')
      return false
    }
    this.port = newPort
    return true
  }

  getServerStatus() {
    return {
      running: this.isServerRunning(),
      port: this.port,
      redirects: this.loadRedirects()
    }
  }
}

module.exports = RedirectorService 