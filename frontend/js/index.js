// =============================
// INDEX.JS - Dashboard Page Specific JavaScript
// Fungsionalitas khusus untuk halaman dashboard/index
// =============================

// =============================
// DashboardManager: Controller untuk Dashboard
// =============================
class DashboardManager {
  constructor() {
    // API endpoint utama
    this.API_BASE_URL = window.AppUtils.API_BASE_URL + '/api/transactions';
    // Data batch yang diupload
    this.batchData = [];
    // Data hasil deteksi saat ini
    this.currentResults = [];
    // Data hasil filter
    this.filteredResults = [];
    // Field urutan sort saat ini
    this.currentSortField = null;
    this.currentSortDirection = 'asc';
    this.currentSort = { column: 'anomalyScore', direction: 'desc' };
    this.pageSize = 50;

    this.init();
  }

  // =============================
  // Inisialisasi semua fitur dashboard
  // =============================
  init() {
    this.loadUserInfo();
    this.setupFileUpload();
    this.loadBatchData();
    this.setupTableInteractions();
    this.setupResultsFilter();
    this.hideLoadingSkeleton();
    this.updateStatsDisplay();
    this.initializeAdvancedFilters();
  }

  // =============================
  // Load informasi user saat ini
  // =============================
  async loadUserInfo() {
    try {
      const userData = await window.AppUtils.apiCall('/auth/me');
      const userNameElement = document.getElementById('user-name');

      if (userNameElement && userData) {
        userNameElement.textContent = userData.name || userData.email || 'User';
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      // Jika token invalid, redirect ke login
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        window.AppUtils.showToast('error', 'Session expired, please login again');
        setTimeout(() => {
          window.AppUtils.logout();
        }, 1500);
      }
    }
  }

  // =============================
  // Fitur upload file CSV
  // =============================
  setupFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const csvFile = document.getElementById('csvFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const uploadBtn = document.getElementById('uploadBtn');
    const chooseFileBtn = document.getElementById('chooseFileBtn');

    if (!uploadZone || !csvFile) return;

    // Drag and drop events
    uploadZone.addEventListener('dragover', e => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', e => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const files = e.dataTransfer.files;

      if (files.length > 0) {
        if (this.validateFile(files[0])) {
          csvFile.files = files;
          this.handleFileSelect();
        }
      }
    });

    // Click to upload (zone or button)
    uploadZone.addEventListener('click', () => {
      csvFile.click();
    });
    if (chooseFileBtn) {
      chooseFileBtn.addEventListener('click', e => {
        e.stopPropagation();
        csvFile.click();
      });
    }

    csvFile.addEventListener('change', () => this.handleFileSelect());

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.uploadFile());
    }
  }

  // =============================
  // Validasi file upload
  // =============================
  validateFile(file) {
    if (!file) {
      window.AppUtils.showToast('error', 'Please select a file');
      return false;
    }

    // Check file type
    if (!window.AppUtils.validateFileType(file, ['.csv'])) {
      window.AppUtils.showToast('error', 'Please select a CSV file');
      return false;
    }

    // Check file size (10MB limit)
    if (!window.AppUtils.validateFileSize(file, 10)) {
      window.AppUtils.showToast('error', 'File size must be less than 10MB');
      return false;
    }

    // Check if file is empty
    if (file.size === 0) {
      window.AppUtils.showToast('error', 'File cannot be empty');
      return false;
    }

    return true;
  }

  // =============================
  // Handler saat file dipilih
  // =============================
  handleFileSelect() {
    const csvFile = document.getElementById('csvFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const uploadBtn = document.getElementById('uploadBtn');

    if (!csvFile?.files[0]) return;

    const file = csvFile.files[0];

    if (this.validateFile(file)) {
      fileName.textContent = `${file.name} (${window.AppUtils.formatFileSize(file.size)})`;
      fileInfo.classList.remove('d-none');
      if (uploadBtn) uploadBtn.disabled = false;

      window.AppUtils.showToast('info', 'File selected successfully');
    } else {
      this.clearFileSelection();
    }
  }

  // =============================
  // Reset pilihan file
  // =============================
  clearFileSelection() {
    const csvFile = document.getElementById('csvFile');
    const fileInfo = document.getElementById('fileInfo');
    const uploadBtn = document.getElementById('uploadBtn');

    if (csvFile) csvFile.value = '';
    if (fileInfo) fileInfo.classList.add('d-none');
    if (uploadBtn) uploadBtn.disabled = true;
  }

  // =============================
  // Upload file ke server (dengan progress)
  // =============================
  async uploadFile() {
    const csvFile = document.getElementById('csvFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (!csvFile?.files[0]) {
      window.AppUtils.showToast('error', 'Please select a file first');
      return;
    }

    const file = csvFile.files[0];
    if (!this.validateFile(file)) return;

    window.AppUtils.performanceMonitor.start('fileUpload');

    try {
      // Show progress container
      if (progressContainer) {
        progressContainer.classList.remove('hidden');
        progressContainer.classList.add('flex');
      }

      // Set loading state
      window.AppUtils.setLoadingState(uploadBtn, true, 'Uploading...');

      const formData = new FormData();
      formData.append('csvFile', file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;

          if (progressBar) {
            progressBar.style.width = `${percentComplete}%`;
          }

          if (progressText) {
            progressText.textContent = `Uploading: ${Math.round(percentComplete)}%`;
          }
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);

            if (progressText) {
              progressText.textContent = 'Processing completed!';
            }

            window.AppUtils.showToast('success', 'File uploaded and processed successfully!');

            // Reload data
            this.loadBatches();
            this.loadResults();
            this.loadStats();

            // Reset form
            this.clearFileSelection();
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            window.AppUtils.showToast('error', 'Upload completed but response parsing failed');
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch (e) {
            // Use default error message
          }
          window.AppUtils.showToast('error', errorMessage);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        window.AppUtils.showToast('error', 'Network error during upload');
      });

      // Configure and send request
      xhr.open('POST', `${window.AppUtils.API_BASE_URL}/api/upload`);

      const token = window.AppUtils.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload file';
      window.AppUtils.showToast('error', errorMessage);
    } finally {
      // Reset UI after a delay
      setTimeout(() => {
        window.AppUtils.setLoadingState(uploadBtn, false);

        if (progressContainer) {
          progressContainer.classList.add('hidden');
          progressContainer.classList.remove('flex');
        }

        window.AppUtils.performanceMonitor.end('fileUpload');
      }, 1000);
    }
  }

  // =============================
  // Load data batch dari server
  // =============================
  async loadBatchData() {
    try {
      const data = await window.AppUtils.apiCall('/api/transactions/batches');
      this.batchData = Array.isArray(data) ? data : data.batches || [];
      this.renderBatchTable();
      this.updateStatsDisplay();
    } catch (error) {
      console.error('Failed to load batch data:', error);
    }
  }

  // =============================
  // Render tabel batch
  // =============================
  renderBatchTable() {
    const batchBody = document.getElementById('batchBody');
    if (!batchBody) return;

    if (this.batchData.length === 0) {
      batchBody.innerHTML = `
        <tr id="batchSkeleton">
          <td colspan="6" class="px-6 py-12 text-center text-gray-500">
            <div class="flex flex-col items-center">
              <i class="fas fa-inbox text-6xl mb-4 text-gray-300"></i>
              <h4 class="text-lg font-medium text-gray-600 mb-2">
                No batches uploaded yet
              </h4>
              <p class="text-gray-400">Upload your first CSV file to get started</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    batchBody.innerHTML = this.batchData
      .map(
        batch => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ${batch.id}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <i class="fas fa-file-csv mr-2 text-green-500"></i>
            <span class="text-sm font-medium text-gray-900">${batch.fileName}</span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center text-sm text-gray-500">
            <i class="fas fa-clock mr-1 text-yellow-500"></i>
            ${new Date(batch.createdAt).toLocaleString()}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <i class="fas fa-database mr-1"></i>
            ${batch._count?.transactions || 0}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeClass(
            batch.status
          )}">
            <i class="fas ${this.getStatusIcon(batch.status)} mr-1"></i>
            ${batch.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex items-center gap-2">
            <button 
              class="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors ${
                batch.status !== 'COMPLETED'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-blue-600'
              }" 
              onclick="dashboard.analyzeBatch('${batch.id}')" 
              ${batch.status !== 'COMPLETED' ? 'disabled' : ''} 
              title="Analisa AI Batch"
            >
              <i class="fas fa-brain text-blue-500"></i>
            </button>
            <button 
              class="p-2 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors ${
                batch.status !== 'COMPLETED'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-green-600'
              }" 
              onclick="dashboard.viewResults('${batch.id}')" 
              ${batch.status !== 'COMPLETED' ? 'disabled' : ''} 
              title="Lihat Hasil Analisis"
            >
              <i class="fas fa-eye text-green-500"></i>
            </button>
            <button 
              class="p-2 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors ${
                batch.status !== 'COMPLETED'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-purple-600'
              }" 
              onclick="dashboard.downloadResults('${batch.id}')" 
              ${batch.status !== 'COMPLETED' ? 'disabled' : ''} 
              title="Download Hasil"
            >
              <i class="fas fa-download text-purple-500"></i>
            </button>
            <button 
              class="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors hover:text-red-600" 
              onclick="dashboard.deleteBatch('${batch.id}')" 
              title="Hapus Batch"
            >
              <i class="fas fa-trash text-red-500"></i>
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }

  // =============================
  // Helper: badge status batch
  // =============================
  getStatusBadgeClass(status) {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // =============================
  // Helper: icon status batch
  // =============================
  getStatusIcon(status) {
    switch (status) {
      case 'COMPLETED':
        return 'fa-check';
      case 'PENDING':
        return 'fa-clock';
      case 'FAILED':
        return 'fa-times';
      default:
        return 'fa-question';
    }
  }

  // =============================
  // Hapus batch
  // =============================
  async deleteBatch(batchId) {
    if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return;
    }

    try {
      await window.AppUtils.apiCall(`/api/transactions/batch/${batchId}`, {
        method: 'DELETE',
      });

      window.AppUtils.showToast('success', 'Batch deleted successfully');
      this.loadBatchData(); // Reload data
    } catch (error) {
      console.error('Failed to delete batch:', error);
      window.AppUtils.showToast('error', 'Failed to delete batch');
    }
  }

  // =============================
  // Lihat hasil deteksi untuk batch tertentu
  // =============================
  async viewResults(batchId) {
    try {
      const data = await window.AppUtils.apiCall(`/api/transactions/anomalies/${batchId}`);
      this.currentResults = data.anomalies || [];
      this.filteredResults = []; // Reset filter

      // Reset filter dropdown
      const filterSelect = document.getElementById('resultsFilter');
      if (filterSelect) filterSelect.value = 'all';

      // Reset sort state
      this.currentSortField = null;
      this.currentSortDirection = 'asc';

      this.renderFilteredResults();
      this.updateAnomalySummary(data);
    } catch (error) {
      console.error('Failed to load results:', error);
      window.AppUtils.showToast('error', 'Failed to load results');
    }
  }

  // =============================
  // Helper: badge risiko
  // =============================
  getRiskBadgeClass(score) {
    const safeScore = score || 0;
    if (safeScore > 0.7) return 'bg-red-100 text-red-800 border border-red-200';
    if (safeScore > 0.5) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    return 'bg-green-100 text-green-800 border border-green-200';
  }

  // =============================
  // Update ringkasan anomali
  // =============================
  updateAnomalySummary(data = null) {
    if (data) {
      // Use data from API response
      const total = data.totalTransaksi || 0;
      const anomalies = data.jumlahAnomali || 0;
      const riskPercentage = total > 0 ? ((anomalies / total) * 100).toFixed(1) : 0;

      const summaryTotal = document.getElementById('summaryTotal');
      const summaryAnomalies = document.getElementById('summaryAnomalies');
      const summaryRisk = document.getElementById('summaryRisk');

      if (summaryTotal) summaryTotal.textContent = total;
      if (summaryAnomalies) summaryAnomalies.textContent = anomalies;
      if (summaryRisk) summaryRisk.textContent = riskPercentage + '%';
    } else {
      // Fallback to calculate from current results
      const total = this.currentResults.length;
      const anomalies = this.currentResults.filter(
        r => r.isAnomaly || (r.anomalyScore || 0) > 0.5
      ).length;
      const riskPercentage = total > 0 ? ((anomalies / total) * 100).toFixed(1) : 0;

      const summaryTotal = document.getElementById('summaryTotal');
      const summaryAnomalies = document.getElementById('summaryAnomalies');
      const summaryRisk = document.getElementById('summaryRisk');

      if (summaryTotal) summaryTotal.textContent = total;
      if (summaryAnomalies) summaryAnomalies.textContent = anomalies;
      if (summaryRisk) summaryRisk.textContent = riskPercentage + '%';
    }
  }

  // =============================
  // Update tampilan statistik dashboard
  // =============================
  updateStatsDisplay() {
    const totalBatches = this.batchData.length;
    const totalTransactions = this.batchData.reduce(
      (sum, batch) => sum + (batch._count?.transactions || 0),
      0
    );
    const totalAnomalies = this.batchData.reduce((sum, batch) => sum + (batch.anomalies || 0), 0);
    const avgRiskScore =
      totalTransactions > 0 ? ((totalAnomalies / totalTransactions) * 100).toFixed(1) : 0;

    // Animate the stats
    setTimeout(() => {
      this.animateStats(totalBatches, totalTransactions, totalAnomalies, avgRiskScore);
    }, 500);
  }

  // =============================
  // Animasi statistik dashboard
  // =============================
  animateStats(batches, transactions, anomalies, riskScore) {
    const totalBatchesElement = document.getElementById('totalBatches');
    const totalTransactionsElement = document.getElementById('totalTransactions');
    const anomaliesFoundElement = document.getElementById('anomaliesFound');
    const riskScoreElement = document.getElementById('riskScore');

    if (totalBatchesElement) window.AppUtils.animateValue(totalBatchesElement, 0, batches, 1000);
    if (totalTransactionsElement)
      window.AppUtils.animateValue(totalTransactionsElement, 0, transactions, 1500);
    if (anomaliesFoundElement)
      window.AppUtils.animateValue(anomaliesFoundElement, 0, anomalies, 2000);
    if (riskScoreElement) {
      setTimeout(() => {
        riskScoreElement.textContent = riskScore + '%';
      }, 2500);
    }
  }

  // =============================
  // Setup interaksi tabel (sort)
  // =============================
  setupTableInteractions() {
    // Setup sortable headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const sortType = header.getAttribute('data-sort');
        this.sortResults(sortType);
      });
    });
  }

  // =============================
  // Setup filter hasil deteksi
  // =============================
  setupResultsFilter() {
    const filterSelect = document.getElementById('resultsFilter');
    const exportBtn = document.getElementById('exportBtn');

    if (filterSelect) {
      filterSelect.addEventListener('change', e => {
        this.filterResults(e.target.value);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportResults();
      });
    }
  }

  // =============================
  // Inisialisasi filter lanjutan & search
  // =============================
  initializeAdvancedFilters() {
    // Create search input with debounced search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const debouncedSearch = window.AppUtils.debounce(query => {
        this.performSearch(query);
      }, 300);

      searchInput.addEventListener('input', e => {
        debouncedSearch(e.target.value);
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }

    // Initialize filter dropdowns
    this.initializeFilterDropdowns();
  }

  // =============================
  // Inisialisasi dropdown filter
  // =============================
  initializeFilterDropdowns() {
    // Risk level filter
    const riskFilter = document.getElementById('riskFilter');
    if (riskFilter) {
      riskFilter.addEventListener('change', () => this.applyFilters());
    }

    // Amount range filter
    const amountFilter = document.getElementById('amountFilter');
    if (amountFilter) {
      amountFilter.addEventListener('change', () => this.applyFilters());
    }

    // Date range filter
    const dateFromFilter = document.getElementById('dateFrom');
    const dateToFilter = document.getElementById('dateTo');
    if (dateFromFilter && dateToFilter) {
      dateFromFilter.addEventListener('change', () => this.applyFilters());
      dateToFilter.addEventListener('change', () => this.applyFilters());
    }
  }

  // =============================
  // Fitur pencarian transaksi
  // =============================
  async performSearch(query) {
    if (!query || query.length < 2) {
      this.clearSearch();
      return;
    }

    window.AppUtils.performanceMonitor.start('search');

    try {
      // Client-side search through current results
      if (this.currentResults.length === 0) {
        window.AppUtils.showToast(
          'info',
          'No data to search. Please upload and analyze a batch first.'
        );
        return;
      }

      const searchResults = this.currentResults.filter(result => {
        const searchTerm = query.toLowerCase();
        return (
          result.transactionId?.toString().toLowerCase().includes(searchTerm) ||
          result.amount?.toString().includes(searchTerm) ||
          result.description?.toLowerCase().includes(searchTerm) ||
          result.merchant?.toLowerCase().includes(searchTerm) ||
          result.cardNumber?.toString().includes(searchTerm)
        );
      });

      this.filteredResults = searchResults;
      this.renderFilteredResults();

      // Update search results indicator
      const resultsInfo = document.getElementById('resultsInfo');
      if (resultsInfo) {
        resultsInfo.textContent = `Found ${searchResults.length} results for "${query}"`;
        resultsInfo.classList.remove('hidden');
      }

      window.AppUtils.showToast('success', `Found ${searchResults.length} matching transactions`);
    } catch (error) {
      console.error('Search error:', error);
      window.AppUtils.showToast('error', 'Search failed. Please try again.');
    } finally {
      window.AppUtils.performanceMonitor.end('search');
    }
  }

  // =============================
  // Reset pencarian
  // =============================
  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsInfo = document.getElementById('resultsInfo');

    if (searchInput) searchInput.value = '';
    if (resultsInfo) resultsInfo.classList.add('hidden');

    // Reset filtered results and render original data
    this.filteredResults = [];
    this.renderFilteredResults();
  }

  // =============================
  // Terapkan filter hasil deteksi
  // =============================
  async applyFilters() {
    const filters = this.getActiveFilters();

    if (Object.keys(filters).length === 0) {
      this.filteredResults = [];
      this.renderFilteredResults();
      return;
    }

    window.AppUtils.performanceMonitor.start('filter');

    try {
      if (this.currentResults.length === 0) {
        window.AppUtils.showToast(
          'info',
          'No data to filter. Please upload and analyze a batch first.'
        );
        return;
      }

      let filteredResults = [...this.currentResults];

      // Apply risk level filter
      if (filters.riskLevel) {
        switch (filters.riskLevel) {
          case 'high':
            filteredResults = filteredResults.filter(r => (r.anomalyScore || 0) > 0.7);
            break;
          case 'medium':
            filteredResults = filteredResults.filter(
              r => (r.anomalyScore || 0) > 0.5 && (r.anomalyScore || 0) <= 0.7
            );
            break;
          case 'low':
            filteredResults = filteredResults.filter(r => (r.anomalyScore || 0) <= 0.5);
            break;
        }
      }

      // Apply amount range filter
      if (filters.amountRange) {
        switch (filters.amountRange) {
          case 'small':
            filteredResults = filteredResults.filter(r => (r.amount || 0) <= 1000);
            break;
          case 'medium':
            filteredResults = filteredResults.filter(
              r => (r.amount || 0) > 1000 && (r.amount || 0) <= 10000
            );
            break;
          case 'large':
            filteredResults = filteredResults.filter(r => (r.amount || 0) > 10000);
            break;
        }
      }

      // Apply date filters
      if (filters.dateFrom || filters.dateTo) {
        filteredResults = filteredResults.filter(r => {
          if (!r.timestamp) return true;
          const txDate = new Date(r.timestamp);
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
          const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null;

          if (fromDate && txDate < fromDate) return false;
          if (toDate && txDate > toDate) return false;
          return true;
        });
      }

      this.filteredResults = filteredResults;
      this.renderFilteredResults();

      // Update filter indicator
      this.updateFilterIndicator(Object.keys(filters).length);

      window.AppUtils.showToast(
        'success',
        `Applied ${Object.keys(filters).length} filter(s), ${filteredResults.length} results found`
      );
    } catch (error) {
      console.error('Filter error:', error);
      window.AppUtils.showToast('error', 'Filter failed. Please try again.');
    } finally {
      window.AppUtils.performanceMonitor.end('filter');
    }
  }

  // =============================
  // Ambil filter yang aktif
  // =============================
  getActiveFilters() {
    const filters = {};

    const riskFilter = document.getElementById('riskFilter');
    if (riskFilter?.value && riskFilter.value !== 'all') {
      filters.riskLevel = riskFilter.value;
    }

    const amountFilter = document.getElementById('amountFilter');
    if (amountFilter?.value && amountFilter.value !== 'all') {
      filters.amountRange = amountFilter.value;
    }

    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    if (dateFrom?.value) filters.dateFrom = dateFrom.value;
    if (dateTo?.value) filters.dateTo = dateTo.value;

    return filters;
  }

  // =============================
  // Update indikator jumlah filter aktif
  // =============================
  updateFilterIndicator(activeCount) {
    const indicator = document.getElementById('filterIndicator');
    if (!indicator) return;

    if (activeCount > 0) {
      indicator.textContent = `${activeCount} filter${activeCount > 1 ? 's' : ''} active`;
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }

  // =============================
  // Reset semua filter
  // =============================
  clearAllFilters() {
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Clear all filter dropdowns
    const riskFilter = document.getElementById('riskFilter');
    const amountFilter = document.getElementById('amountFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');

    if (riskFilter) riskFilter.value = 'all';
    if (amountFilter) amountFilter.value = 'all';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';

    // Clear indicators
    const resultsInfo = document.getElementById('resultsInfo');
    const filterIndicator = document.getElementById('filterIndicator');
    if (resultsInfo) resultsInfo.classList.add('hidden');
    if (filterIndicator) filterIndicator.classList.add('hidden');

    // Reset filtered results and render original data
    this.filteredResults = [];
    this.renderFilteredResults();

    window.AppUtils.showToast('success', 'All filters cleared');
  }

  // =============================
  // Filter hasil berdasarkan tipe risiko
  // =============================
  filterResults(filterType) {
    if (this.currentResults.length === 0) return;

    let filtered = [...this.currentResults];

    switch (filterType) {
      case 'high':
        filtered = filtered.filter(r => (r.anomalyScore || 0) > 0.7);
        break;
      case 'medium':
        filtered = filtered.filter(
          r => (r.anomalyScore || 0) > 0.5 && (r.anomalyScore || 0) <= 0.7
        );
        break;
      case 'low':
        filtered = filtered.filter(r => (r.anomalyScore || 0) <= 0.5);
        break;
      case 'all':
      default:
        // Show all results
        break;
    }

    this.filteredResults = filtered;
    this.renderFilteredResults();
    this.updateFilterSummary();
  }

  // =============================
  // Render hasil deteksi (dengan filter)
  // =============================
  renderFilteredResults() {
    const resultsTableContainer = document.getElementById('resultsTableContainer');
    const resultStatus = document.getElementById('resultStatus');
    const resultsBody = document.getElementById('resultsBody');
    const searchFilterContainer = document.getElementById('searchFilterContainer');

    const dataToRender =
      this.filteredResults.length > 0 ? this.filteredResults : this.currentResults;

    if (dataToRender.length === 0) {
      resultsTableContainer.classList.add('hidden');
      searchFilterContainer.classList.add('hidden');
      resultStatus.classList.remove('hidden');
      return;
    }

    resultStatus.classList.add('hidden');
    resultsTableContainer.classList.remove('hidden');
    searchFilterContainer.classList.remove('hidden');

    resultsBody.innerHTML = dataToRender
      .map(
        result => `
      <tr class="hover:bg-gray-50 transition-colors ${
        (result.anomalyScore || 0) > 0.7
          ? 'bg-red-50 border-l-4 border-red-500'
          : (result.anomalyScore || 0) > 0.5
          ? 'bg-yellow-50 border-l-4 border-yellow-500'
          : ''
      }">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${new Date(result.timestamp).toLocaleString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          $${parseFloat(result.amount).toLocaleString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${result.merchant}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${result.location}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getRiskBadgeClass(
            result.anomalyScore || 0
          )}">
            ${((result.anomalyScore || 0) * 100).toFixed(1)}%
          </span>
        </td>
      </tr>
    `
      )
      .join('');
  }

  // =============================
  // Update ringkasan hasil filter
  // =============================
  updateFilterSummary() {
    const dataToShow = this.filteredResults.length > 0 ? this.filteredResults : this.currentResults;
    const total = dataToShow.length;
    const anomalies = dataToShow.filter(r => r.isAnomaly || (r.anomalyScore || 0) > 0.5).length;
    const riskPercentage = total > 0 ? ((anomalies / total) * 100).toFixed(1) : 0;

    const summaryTotal = document.getElementById('summaryTotal');
    const summaryAnomalies = document.getElementById('summaryAnomalies');
    const summaryRisk = document.getElementById('summaryRisk');

    if (summaryTotal) summaryTotal.textContent = total;
    if (summaryAnomalies) summaryAnomalies.textContent = anomalies;
    if (summaryRisk) summaryRisk.textContent = riskPercentage + '%';
  }

  // =============================
  // Urutkan hasil deteksi
  // =============================
  sortResults(sortBy) {
    const dataToSort = this.filteredResults.length > 0 ? this.filteredResults : this.currentResults;

    if (dataToSort.length === 0) return;

    // Toggle sort direction if same field
    if (this.currentSortField === sortBy) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortField = sortBy;
      this.currentSortDirection = 'asc';
    }

    // Sort the data
    const sorted = [...dataToSort].sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'timestamp':
          valueA = new Date(a.timestamp);
          valueB = new Date(b.timestamp);
          break;
        case 'amount':
          valueA = parseFloat(a.amount) || 0;
          valueB = parseFloat(b.amount) || 0;
          break;
        case 'merchant':
          valueA = (a.merchant || '').toLowerCase();
          valueB = (b.merchant || '').toLowerCase();
          break;
        case 'location':
          valueA = (a.location || '').toLowerCase();
          valueB = (b.location || '').toLowerCase();
          break;
        case 'anomalyScore':
          valueA = a.anomalyScore || 0;
          valueB = b.anomalyScore || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return this.currentSortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.currentSortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Update the data array
    if (this.filteredResults.length > 0) {
      this.filteredResults = sorted;
    } else {
      this.currentResults = sorted;
    }

    // Re-render the table
    this.renderFilteredResults();
    this.updateSortIndicators(sortBy);
  }

  // =============================
  // Update indikator sort pada header tabel
  // =============================
  updateSortIndicators(sortBy) {
    // Reset all sort icons to default state
    document
      .querySelectorAll('[data-sort] .fa-sort, [data-sort] .fa-sort-up, [data-sort] .fa-sort-down')
      .forEach(icon => {
        icon.className = 'fas fa-sort ml-2 text-gray-400';
      });

    // Reset all header backgrounds
    document.querySelectorAll('[data-sort]').forEach(header => {
      header.classList.remove('bg-blue-100');
    });

    // Update the active sort icon and header
    const activeHeader = document.querySelector(`[data-sort="${sortBy}"]`);
    if (activeHeader) {
      const sortIcon = activeHeader.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down');
      if (sortIcon) {
        sortIcon.className =
          this.currentSortDirection === 'asc'
            ? 'fas fa-sort-up ml-2 text-blue-600'
            : 'fas fa-sort-down ml-2 text-blue-600';
      }

      // Add active background
      activeHeader.classList.add('bg-blue-100');
    }
  }

  // =============================
  // Ekspor hasil deteksi ke CSV
  // =============================
  exportResults() {
    const dataToExport =
      this.filteredResults.length > 0 ? this.filteredResults : this.currentResults;

    if (dataToExport.length === 0) {
      window.AppUtils.showToast('warning', 'No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Timestamp', 'Amount', 'Merchant', 'Location', 'Risk Score'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row =>
        [
          `"${new Date(row.timestamp).toLocaleString()}"`,
          row.amount,
          `"${row.merchant}"`,
          `"${row.location}"`,
          ((row.anomalyScore || 0) * 100).toFixed(1),
        ].join(',')
      ),
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud_results_filtered_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    window.AppUtils.showToast('success', 'Results exported successfully');
  }

  // =============================
  // Download hasil deteksi batch tertentu
  // =============================
  async downloadResults(batchId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/download/${batchId}`, {
        headers: {
          Authorization: `Bearer ${window.AppUtils.getAuthToken()}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fraud_results_${batchId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        window.AppUtils.showToast('success', 'Results downloaded successfully');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      window.AppUtils.showToast('error', 'Download failed');
    }
  }

  // =============================
  // Analisa batch dengan AI
  // =============================
  async analyzeBatch(batchId) {
    if (!confirm('Start AI analysis for this batch? This process may take a few minutes.')) {
      return;
    }

    const analyzeBtn = document.querySelector(
      `button[onclick="dashboardManager.analyzeBatch('${batchId}')"]`
    );
    const originalText = analyzeBtn ? analyzeBtn.innerHTML : '';

    try {
      // Show loading state
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-1"></span>Analyzing...';
      }

      window.AppUtils.showToast('info', 'AI analysis started. Please wait...');

      const response = await window.AppUtils.apiCall(`/api/transactions/analyze/${batchId}`, {
        method: 'POST',
      });

      if (response.message && response.message.includes('selesai')) {
        window.AppUtils.showToast('success', 'Analysis completed successfully!');

        // Auto-load results after analysis
        setTimeout(() => {
          this.viewResults(batchId);
        }, 1000);

        // Refresh batch data to show updated status
        this.loadBatchData();
      } else {
        window.AppUtils.showToast('success', 'Analysis completed!');
      }
    } catch (error) {
      console.error('Failed to analyze batch:', error);
      window.AppUtils.showToast('error', 'Analysis failed: ' + (error.message || 'Unknown error'));
    } finally {
      // Restore button state
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
      }
    }
  }

  // =============================
  // Load hasil deteksi (dengan optimasi performa)
  // =============================
  async loadResults(sortBy = 'amount', sortOrder = 'desc', page = 1, pageSize = 25) {
    window.AppUtils.performanceMonitor.start('loadResults');

    const resultsTable = document.getElementById('resultsTable');
    const loadingContainer = document.getElementById('loadingContainer');

    try {
      // Show skeleton loader
      if (resultsTable) {
        window.AppUtils.createSkeletonLoader(resultsTable, 'table');
      }

      const response = await window.AppUtils.apiCall(
        `/api/results?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&pageSize=${pageSize}`
      );

      if (response?.results) {
        this.currentResults = response.results;
        this.totalResults = response.total || response.results.length;
        this.currentPage = page;
        this.pageSize = pageSize;

        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
          this.renderResults(response.results);
          this.updatePagination(response.total, page, pageSize);
        });

        console.log(`Loaded ${response.results.length} results`);
      } else {
        this.renderResults([]);
      }
    } catch (error) {
      console.error('Error loading results:', error);
      this.renderResults([]);
    } finally {
      window.AppUtils.performanceMonitor.end('loadResults');
    }
  }

  // =============================
  // Render hasil deteksi (virtual scroll untuk dataset besar)
  // =============================
  renderResults(results) {
    const tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) return;

    if (!results || results.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-12 text-center text-gray-500">
            <div class="flex flex-col items-center space-y-4">
              <i class="fas fa-search text-4xl text-gray-300"></i>
              <div>
                <p class="text-lg font-medium">No results found</p>
                <p class="text-sm">Upload a CSV file to start fraud detection</p>
              </div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    results.forEach((result, index) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition-colors border-b border-gray-200';

      const riskInfo = window.AppUtils.formatters.riskLevel(result.fraud_score);

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${result.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${window.AppUtils.formatters.currency(
          result.amount
        )}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
          result.merchant || 'N/A'
        }</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
          result.category || 'N/A'
        }</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            riskInfo.class
          }">
            <i class="fas ${riskInfo.icon} mr-1"></i>
            ${(result.fraud_score * 100).toFixed(1)}%
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            riskInfo.class
          }">
            ${riskInfo.label}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${window.AppUtils.formatters.date(
          result.created_at
        )}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex space-x-2">
            <button 
              onclick="dashboard.showTransactionDetails(${result.id})" 
              class="text-blue-600 hover:text-blue-900 transition-colors"
              title="View Details"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button 
              onclick="dashboard.exportSingleResult(${result.id})" 
              class="text-green-600 hover:text-green-900 transition-colors"
              title="Export"
            >
              <i class="fas fa-download"></i>
            </button>
          </div>
        </td>
      `;

      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  }
  // =============================
  // Sembunyikan skeleton loading
  // =============================
  hideLoadingSkeleton() {
    setTimeout(() => {
      const skeleton = document.getElementById('batchSkeleton');
      if (skeleton) {
        skeleton.style.display = 'none';
      }
    }, 2000);
  }
}

// =============================
// Inisialisasi dashboard saat DOM siap
// =============================
document.addEventListener('DOMContentLoaded', () => {
  // Cek autentikasi user
  if (!window.AppUtils.isAuthenticated()) {
    window.location.href = '/login';
    return;
  }

  window.dashboardManager = new DashboardManager();
  window.dashboard = window.dashboardManager; // Alias untuk HTML compatibility
});
