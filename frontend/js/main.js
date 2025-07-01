/**
 * MAIN.JS - Global JavaScript Functions
 * Fungsi-fungsi yang digunakan di semua halaman
 */

// Global Variables
window.AppUtils = {
  get API_BASE_URL() {
    // Use dynamic config if available, fallback to localhost for development
    return window.AppConfig ? window.AppConfig.getApiUrl() : 'http://localhost:3001';
  },

  // Authentication utilities
  getAuthToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return this.getAuthToken() !== null;
  },

  logout() {
    localStorage.removeItem('token');
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      window.location.href = '/login';
    });
  },

  // Toast notification system
  showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
    };

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle',
    };

    toast.className = `${
      colors[type] || colors.error
    } text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-center space-x-3 max-w-md`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.error}"></i>
      <span class="flex-1">${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add animation
    toast.style.transform = 'translateX(100%)';
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after delay
    const delay = type === 'info' ? 3000 : 5000;
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }
    }, delay);
  },

  // Utility for animated counters
  animateValue(element, start, end, duration) {
    const startTimestamp = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * (end - start) + start);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  },

  // Debounce utility for performance optimization
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle utility for scroll/resize events
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Performance monitoring
  performanceMonitor: {
    marks: new Map(),

    start(label) {
      this.marks.set(label, performance.now());
    },

    end(label) {
      const start = this.marks.get(label);
      if (start) {
        const duration = performance.now() - start;
        console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`);
        this.marks.delete(label);
        return duration;
      }
    },
  },

  // Enhanced loading states
  setLoadingState(element, isLoading, loadingText = 'Loading...') {
    if (!element) return;

    if (isLoading) {
      element.dataset.originalText = element.textContent;
      element.innerHTML = `
        <i class="fas fa-spinner fa-spin mr-2"></i>
        ${loadingText}
      `;
      element.disabled = true;
      element.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
      element.textContent = element.dataset.originalText || 'Submit';
      element.disabled = false;
      element.classList.remove('opacity-75', 'cursor-not-allowed');
    }
  },

  // Generic API call helper
  async apiCall(endpoint, options = {}) {
    try {
      this.performanceMonitor.start(`API-${endpoint}`);

      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...options,
      };

      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, config);

      this.performanceMonitor.end(`API-${endpoint}`);

      if (!response.ok) {
        // Enhanced error handling
        let errorMessage = `Request failed with status ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }

        // Handle specific error codes
        if (response.status === 401) {
          this.showToast('error', 'Session expired. Please login again.');
          setTimeout(() => this.logout(), 2000);
          return null;
        } else if (response.status === 403) {
          this.showToast('error', 'Access denied.');
          return null;
        } else if (response.status === 429) {
          this.showToast('warning', 'Too many requests. Please try again later.');
          return null;
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);

      // Network error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        this.showToast('error', 'Network error. Please check your connection.');
      } else {
        this.showToast('error', error.message || 'An unexpected error occurred.');
      }

      throw error;
    }
  },

  // Enhanced error handling
  handleApiError(error, context = '') {
    console.error(`API Error ${context}:`, error);

    if (error.message.includes('401')) {
      this.showToast('error', 'Session expired. Please login again.');
      setTimeout(() => this.logout(), 2000);
      return;
    }

    if (error.message.includes('403')) {
      this.showToast('error', 'Access denied. Insufficient permissions.');
      return;
    }

    if (error.message.includes('500')) {
      this.showToast('error', 'Server error. Please try again later.');
      return;
    }

    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      this.showToast('error', 'Network connection error. Please check your internet connection.');
      return;
    }

    this.showToast('error', 'An unexpected error occurred. Please try again.');
  },

  // Form validation helpers
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePassword(password) {
    // At least 6 characters for basic security
    return password && password.length >= 6;
  },

  // File validation
  validateFileType(file, allowedTypes = ['.csv']) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  },

  validateFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Format utilities
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  },

  formatCurrency(amount, currency = 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  formatDate(dateString) {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  },

  // Theme utilities (for future use)
  getPreferredColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  // Device detection
  isMobile() {
    return window.innerWidth <= 768;
  },

  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  isDesktop() {
    return window.innerWidth > 1024;
  },

  // Progressive loading with skeleton screens
  createSkeletonLoader(container, type = 'table') {
    if (!container) return;

    const skeletons = {
      table: `
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="space-y-3">
            ${Array(5)
              .fill(0)
              .map(
                () => `
              <div class="grid grid-cols-4 gap-4">
                <div class="h-4 bg-gray-300 rounded"></div>
                <div class="h-4 bg-gray-300 rounded"></div>
                <div class="h-4 bg-gray-300 rounded"></div>
                <div class="h-4 bg-gray-300 rounded"></div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `,
      card: `
        <div class="animate-pulse">
          <div class="h-6 bg-gray-300 rounded mb-4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-300 rounded"></div>
            <div class="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      `,
      stats: `
        <div class="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
          ${Array(3)
            .fill(0)
            .map(
              () => `
            <div class="bg-gray-200 rounded-lg p-6">
              <div class="h-8 bg-gray-300 rounded mb-4"></div>
              <div class="h-12 bg-gray-300 rounded"></div>
            </div>
          `
            )
            .join('')}
        </div>
      `,
    };

    container.innerHTML = skeletons[type] || skeletons.table;
  },

  // Enhanced batch operations with progress tracking
  batchProcessor: {
    async process(items, processor, onProgress, batchSize = 10) {
      const results = [];
      const total = items.length;

      for (let i = 0; i < total; i += batchSize) {
        const batch = items.slice(i, Math.min(i + batchSize, total));
        const batchResults = await Promise.allSettled(batch.map(item => processor(item)));

        results.push(...batchResults);

        if (onProgress) {
          const progress = Math.min(((i + batchSize) / total) * 100, 100);
          onProgress(progress, i + batch.length, total);
        }
      }

      return results;
    },
  },

  // Enhanced file operations
  downloadFile(data, filename, type = 'application/json') {
    try {
      let content;

      if (typeof data === 'object') {
        content = type.includes('json') ? JSON.stringify(data, null, 2) : data;
      } else {
        content = data;
      }

      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      this.showToast('success', `${filename} downloaded successfully`);
    } catch (error) {
      console.error('Download failed:', error);
      this.showToast('error', 'Failed to download file');
    }
  },

  uploadFile(input, callback) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target.result;
      callback(content, file);
    };
    reader.readAsText(file);
  },

  // Initialize global features
  init() {
    this.setupGlobalEventListeners();
  },

  setupGlobalEventListeners() {
    // Global escape key handler
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        // Close any open modals or dropdowns
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) modalInstance.hide();
        });
      }
    });

    // Global loading state handler
    document.addEventListener('submit', e => {
      const form = e.target;
      if (form.tagName === 'FORM') {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';

          // Re-enable after 3 seconds (fallback)
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
          }, 3000);
        }
      }
    });
  },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppUtils.init();
});

// Export for global access (backward compatibility)
window.logout = window.AppUtils.logout.bind(window.AppUtils);
window.showToast = window.AppUtils.showToast.bind(window.AppUtils);
