// =============================
// CONFIG.JS - Environment Configuration
// Mengelola URL API & setting environment
// =============================

window.AppConfig = {
  // =============================
  // Deteksi environment dari hostname
  // =============================
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

  // =============================
  // Konfigurasi per environment
  // =============================
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

  // =============================
  // Ambil konfigurasi environment aktif
  // =============================
  get() {
    const env = this.getEnvironment();
    return this.environments[env];
  },

  // =============================
  // Ambil base URL API
  // =============================
  getApiUrl() {
    return this.get().API_BASE_URL;
  },

  // =============================
  // Cek mode debug
  // =============================
  isDebugMode() {
    return this.get().DEBUG;
  },

  // =============================
  // Ambil timeout request
  // =============================
  getTimeout() {
    return this.get().TIMEOUT;
  },
};
