/**
 * CONFIG.JS - Environment Configuration
 * Manages API URLs and other environment-specific settings
 */

window.AppConfig = {
  // Determine environment based on hostname
  getEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev')) {
      return 'staging';
    } else {
      return 'production';
    }
  },

  // Environment-specific configurations
  environments: {
    development: {
      API_BASE_URL: 'http://localhost:3001',
      DEBUG: true,
      TIMEOUT: 30000,
    },
    staging: {
      API_BASE_URL: 'https://api-staging.frauddetection.com',
      DEBUG: true,
      TIMEOUT: 30000,
    },
    production: {
      API_BASE_URL: 'https://api.frauddetection.com',
      DEBUG: false,
      TIMEOUT: 15000,
    },
  },

  // Get current configuration
  get() {
    const env = this.getEnvironment();
    return this.environments[env];
  },

  // Get API base URL for current environment
  getApiUrl() {
    return this.get().API_BASE_URL;
  },

  // Check if debug mode is enabled
  isDebugMode() {
    return this.get().DEBUG;
  },

  // Get request timeout
  getTimeout() {
    return this.get().TIMEOUT;
  },
};
