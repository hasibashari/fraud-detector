// =========================
// LOGGER UTILITY
// Sistem logging yang konsisten dan mudah dikontrol
// =========================

const isDevelopment = process.env.NODE_ENV !== 'production';
const isDebugMode = process.env.DEBUG === 'true' || isDevelopment;

class Logger {
  static info(message, data = null) {
    if (isDebugMode) {
      console.log(`ℹ️  [INFO] ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  }

  static error(message, error = null) {
    console.error(`❌ [ERROR] ${message}`);
    if (error) {
      console.error('   Details:', error);
    }
  }

  static warn(message, data = null) {
    if (isDebugMode) {
      console.warn(`⚠️  [WARN] ${message}`);
      if (data) {
        console.warn('   Data:', data);
      }
    }
  }

  static success(message, data = null) {
    if (isDebugMode) {
      console.log(`✅ [SUCCESS] ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  }

  static debug(message, data = null) {
    if (isDebugMode) {
      console.log(`🐛 [DEBUG] ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  }

  static ai(message, data = null) {
    if (isDebugMode) {
      console.log(`🤖 [AI] ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  }

  static upload(message, data = null) {
    if (isDebugMode) {
      console.log(`📁 [UPLOAD] ${message}`);
      if (data) {
        console.log('   Data:', data);
      }
    }
  }
}

module.exports = Logger;
