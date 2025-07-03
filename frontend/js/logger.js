// =============================
// CLIENT LOGGER - Frontend Logging Utility
// Sistem logging yang konsisten untuk frontend
// =============================

window.ClientLogger = {
  // Cek mode debug dari config
  get isDebugMode() {
    return window.AppConfig?.isDebugMode() || false;
  },

  info(message, data = null) {
    if (this.isDebugMode) {
      console.log(`ℹ️  [INFO] ${message}`);
      if (data) console.log('   Data:', data);
    }
  },

  error(message, error = null) {
    console.error(`❌ [ERROR] ${message}`);
    if (error) console.error('   Details:', error);
  },

  warn(message, data = null) {
    if (this.isDebugMode) {
      console.warn(`⚠️  [WARN] ${message}`);
      if (data) console.warn('   Data:', data);
    }
  },

  success(message, data = null) {
    if (this.isDebugMode) {
      console.log(`✅ [SUCCESS] ${message}`);
      if (data) console.log('   Data:', data);
    }
  },

  debug(message, data = null) {
    if (this.isDebugMode) {
      console.log(`🐛 [DEBUG] ${message}`);
      if (data) console.log('   Data:', data);
    }
  },

  api(message, data = null) {
    if (this.isDebugMode) {
      console.log(`🌐 [API] ${message}`);
      if (data) console.log('   Data:', data);
    }
  },

  upload(message, data = null) {
    if (this.isDebugMode) {
      console.log(`📁 [UPLOAD] ${message}`);
      if (data) console.log('   Data:', data);
    }
  },
};
