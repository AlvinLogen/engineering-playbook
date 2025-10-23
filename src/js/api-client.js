class APIClient {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.timeout = 10000; // 10 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }
  
  getBaseURL() {
    // Auto-detect API URL based on environment
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000'; // Local development
    } else {
      return '/api'; // Production - same domain
    }
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;
    
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        if (CONFIG.debug.enabled) {
          console.log(`🌐 API Request (attempt ${attempt}):`, url, config);
        }
        
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (CONFIG.debug.enabled) {
          console.log('🌐 API Response:', data);
        }
        
        return {
          success: true,
          data,
          status: response.status
        };
        
      } catch (error) {
        lastError = error;
        
        if (error.name === 'AbortError') {
          console.error(`API request timeout after ${this.timeout}ms:`, url);
        } else {
          console.error(`API request failed (attempt ${attempt}):`, error.message);
        }
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || 
            (error.message.includes('HTTP 4') && !error.message.includes('HTTP 429'))) {
          break;
        }
        
        // Wait before retrying
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    return {
      success: false,
      error: lastError.message,
      status: null
    };
  }
  
  async get(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return this.request(url.pathname + url.search, {
      method: 'GET'
    });
  }
  
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
  
  // Health check method
  async healthCheck() {
    try {
      const result = await this.get('/health');
      return result.success;
    } catch (error) {
      return false;
    }
  }
  
  // Contact form submission
  async submitContactForm(formData) {
    return this.post('/contact', formData);
  }
  
  // Get portfolio projects
  async getProjects() {
    return this.get('/projects');
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global API client instance
window.apiClient = new APIClient();

// Test API connection on page load
$(document).ready(async () => {
  if (CONFIG.debug.enabled) {
    const isHealthy = await apiClient.healthCheck();
    console.log(`🏥 API Health Check: ${isHealthy ? '✅ Connected' : '❌ Failed'}`);
  }
});