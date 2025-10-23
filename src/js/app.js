class Application {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.init();
  }
  
  async init() {
    try {
      console.log('🚀 Initializing application...');
      
      // Check if jQuery is loaded
      if (typeof $ === 'undefined') {
        throw new Error('jQuery is required but not loaded');
      }
      
      // Check API connectivity
      const apiHealthy = await apiClient.healthCheck();
      if (!apiHealthy && CONFIG.debug.enabled) {
        console.warn('API is not available - using fallback data');
      }
      
      // Initialize modules
      await this.initializeModules();
      
      // Setup global error handling
      this.setupGlobalErrorHandling();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      this.isInitialized = true;
      console.log('Application initialized successfully');
      
      // Trigger custom event
      $(document).trigger('app:initialized');
      
    } catch (error) {
      console.error('Application initialization failed:', error);
      this.handleInitializationError(error);
    }
  }
  
  async initializeModules() {
    const moduleConfigs = [
      { name: 'navigation', enabled: true, required: true },
      { name: 'contactForm', enabled: CONFIG.features.contactForm, required: false },
      { name: 'portfolioGallery', enabled: CONFIG.features.portfolioFilters, required: false },
      { name: 'debugTools', enabled: CONFIG.debug.enabled, required: false }
    ];
    
    for (let config of moduleConfigs) {
      if (config.enabled) {
        try {
          await this.initializeModule(config.name);
          this.modules.set(config.name, { status: 'loaded', required: config.required });
        } catch (error) {
          console.error(`Failed to initialize module: ${config.name}`, error);
          
          if (config.required) {
            throw new Error(`Required module failed to load: ${config.name}`);
          } else {
            this.modules.set(config.name, { status: 'failed', required: config.required });
          }
        }
      }
    }
  }
  
  async initializeModule(moduleName) {
    switch (moduleName) {
      case 'navigation':
        // Navigation is initialized automatically
        break;
      case 'contactForm':
        if (typeof ContactFormController === 'undefined') {
          throw new Error('ContactFormController not found');
        }
        break;
      case 'portfolioGallery':
        if (typeof PortfolioGallery === 'undefined') {
          throw new Error('PortfolioGallery not found');
        }
        break;
      case 'debugTools':
        if (typeof DebugTools === 'undefined') {
          throw new Error('DebugTools not found');
        }
        break;
      default:
        console.warn(`Unknown module: ${moduleName}`);
    }
  }
  
  setupGlobalErrorHandling() {
    // Catch unhandled jQuery errors
    $(document).ajaxError((event, xhr, settings, error) => {
      console.error('AJAX Error:', {
        url: settings.url,
        method: settings.type,
        status: xhr.status,
        error: error
      });
      
      // Show user-friendly error message
      this.showNotification('Connection error. Please try again.', 'error');
    });
    
    // Handle module failures gracefully
    window.addEventListener('error', (e) => {
      if (e.filename && e.filename.includes('/js/components/')) {
        console.error('Component error:', e);
        this.handleComponentError(e);
      }
    });
  }
  
  setupPerformanceMonitoring() {
    if (!CONFIG.debug.enabled) return;
    
    // Monitor page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        console.group('📊 Performance Metrics');
        console.log(`Page Load Time: ${loadTime}ms`);
        console.log(`DOM Ready: ${domReady}ms`);
        console.log(`Module Status:`, Array.from(this.modules.entries()));
        console.groupEnd();
      }, 100);
    });
  }
  
  handleInitializationError(error) {
    // Show fallback UI
    const errorMessage = `
      <div class="app-error">
        <h2>Application Error</h2>
        <p>Sorry, something went wrong while loading the application.</p>
        <p>Please refresh the page to try again.</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          Refresh Page
        </button>
      </div>
    `;
    
    $('body').html(errorMessage);
  }
  
  handleComponentError(error) {
    // Try to gracefully degrade functionality
    const componentName = this.extractComponentName(error.filename);
    
    if (componentName && this.modules.has(componentName)) {
      this.modules.set(componentName, { status: 'failed', required: false });
      console.warn(`Component ${componentName} failed - functionality may be limited`);
    }
  }
  
  extractComponentName(filename) {
    const match = filename.match(/\/js\/components\/(.+)\.js/);
    return match ? match[1] : null;
  }
  
  showNotification(message, type = 'info', duration = 5000) {
    const notification = $(`
      <div class="notification notification-${type}">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `);
    
    $('body').append(notification);
    
    // Auto-hide
    setTimeout(() => {
      notification.fadeOut(() => notification.remove());
    }, duration);
    
    // Close button
    notification.find('.notification-close').on('click', () => {
      notification.fadeOut(() => notification.remove());
    });
  }
  
  getModuleStatus(moduleName) {
    return this.modules.get(moduleName);
  }
  
  isModuleLoaded(moduleName) {
    const module = this.modules.get(moduleName);
    return module && module.status === 'loaded';
  }
}

// Initialize application when DOM is ready
$(document).ready(() => {
  window.app = new Application();
});