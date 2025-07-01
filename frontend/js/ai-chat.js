/**
 * AI-CHAT.JS - AI Chat Page Specific JavaScript
 * Consolidated functionality for AI Chat page
 */

// =============================
// AIChatManager: Main Chat Page Controller
// =============================
class AIChatManager {
  constructor() {
    // Current selected batch ID
    this.currentBatchId = null;
    // Chat history array
    this.chatHistory = [];
    // API base URL from global AppUtils
    this.API_BASE_URL = window.AppUtils.API_BASE_URL;

    // Initialize all features
    this.init();
  }

  // Initialize all main features and event listeners
  init() {
    this.checkAuthentication();
    this.setupEventListeners();
    this.loadBatchSelector();
    this.setupQuickButtons();
    this.setupFormEnhancements();
    this.setupScrollAnimations();
    this.setupKeyboardShortcuts();
    this.setupLoadingStates();
  }

  // =============================
  // Authentication Check
  // =============================
  checkAuthentication() {
    if (!window.AppUtils.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
  }

  // =============================
  // Setup All DOM Event Listeners
  // =============================
  setupEventListeners() {
    // Chat form submit
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', e => this.handleChatSubmit(e));
    }

    // Batch selector change
    const batchSelector = document.getElementById('batchSelector');
    if (batchSelector) {
      batchSelector.addEventListener('change', e => this.handleBatchChange(e));
    }

    // Deep analysis button
    const deepAnalysisBtn = document.getElementById('deepAnalysisBtn');
    if (deepAnalysisBtn) {
      deepAnalysisBtn.addEventListener('click', () => this.performDeepAnalysis());
    }

    // Clear chat button
    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => this.clearChat());
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin logout?')) {
          window.AppUtils.logout();
        }
      });
    }
  }

  // =============================
  // Load Batch Selector Options from API
  // =============================
  async loadBatchSelector() {
    try {
      const response = await window.AppUtils.apiCall('/api/transactions/batches');
      const batchSelector = document.getElementById('batchSelector');

      if (batchSelector && Array.isArray(response)) {
        batchSelector.innerHTML = '<option value="">Pilih Batch untuk Analisis...</option>';

        response.forEach(batch => {
          const option = document.createElement('option');
          option.value = batch.id;
          const transactionCount = batch._count?.transactions || 0;
          option.textContent = `Batch ${batch.id} - ${batch.fileName} (${transactionCount} transaksi)`;
          batchSelector.appendChild(option);
        });

        if (response.length === 0) {
          batchSelector.innerHTML =
            '<option value="">Tidak ada batch tersedia - Upload data terlebih dahulu</option>';
        }
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      window.AppUtils.showToast('error', 'Gagal memuat daftar batch');

      const batchSelector = document.getElementById('batchSelector');
      if (batchSelector) {
        batchSelector.innerHTML =
          '<option value="">Error loading batches - Coba refresh halaman</option>';
      }
    }
  }

  // =============================
  // Handle Batch Selection Change
  // =============================
  async handleBatchChange(e) {
    const batchId = e.target.value;
    this.currentBatchId = batchId;

    if (batchId) {
      this.clearChat();
      this.showBatchInfo(batchId);
      this.enableChatInterface();
    } else {
      this.disableChatInterface();
    }
  }

  // =============================
  // Show Selected Batch Information in Chat
  // =============================
  async showBatchInfo(batchId) {
    try {
      const batchSelector = document.getElementById('batchSelector');
      const selectedOption = batchSelector.querySelector(`option[value="${batchId}"]`);
      if (selectedOption) {
        const batchText = selectedOption.textContent;
        const batchInfoHtml = `
          <div class="rounded-lg bg-green-50 border border-green-200 p-4 mb-3">
            <div class="flex items-center">
              <i class="fas fa-database text-2xl mr-3 text-green-600"></i>
              <div>
                <h6 class="mb-1 flex items-center font-semibold text-green-700"><i class="fas fa-check-circle mr-2"></i>Dataset Dipilih</h6>
                <p class="mb-0 font-medium text-green-900">${batchText}</p>
                <small class="text-green-700">Sekarang Anda dapat bertanya tentang data ini atau menjalankan analisis mendalam.</small>
              </div>
            </div>
          </div>
        `;
        this.addMessageToChat('system', batchInfoHtml);
      }
    } catch (error) {
      console.error('Error showing batch info:', error);
    }
  }

  // =============================
  // Handle Chat Form Submission
  // =============================
  async handleChatSubmit(e) {
    e.preventDefault();

    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) {
      window.AppUtils.showToast('warning', 'Masukkan pertanyaan terlebih dahulu');
      return;
    }

    if (!this.currentBatchId) {
      window.AppUtils.showToast('warning', 'Pilih batch data terlebih dahulu');
      return;
    }

    // Add user message to chat
    this.addMessageToChat('user', message);
    chatInput.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await window.AppUtils.apiCall(
        `/api/transactions/chat/${this.currentBatchId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            question: message,
            chatHistory: this.chatHistory.slice(-10), // Send last 10 messages for context
          }),
        }
      );

      this.hideTypingIndicator();

      if (response.answer) {
        this.addMessageToChat('assistant', response.answer);
      } else {
        this.addMessageToChat(
          'assistant',
          'Maaf, tidak ada respons yang diterima. Silakan coba lagi.'
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.hideTypingIndicator();
      this.addMessageToChat(
        'assistant',
        `<div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.
        </div>`
      );
      window.AppUtils.showToast('error', 'Gagal mengirim pesan');
    }
  }

  // =============================
  // Add Message to Chat Interface
  // =============================
  addMessageToChat(sender, message) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message mb-3`;

    const timestamp = new Date().toLocaleTimeString('id-ID');

    if (sender === 'system') {
      messageDiv.innerHTML = message;
    } else if (sender === 'user') {
      messageDiv.innerHTML = `
        <div class="flex justify-end">
          <div class="bg-blue-600 text-white rounded-xl p-3 max-w-[75%]">
            <div class="message-text">${this.formatMessage(message)}</div>
            <small class="opacity-75">${timestamp}</small>
          </div>
        </div>
      `;
    } else {
      // assistant
      messageDiv.innerHTML = `
        <div class="flex justify-start">
          <div class="bg-gray-50 border rounded-xl p-3 max-w-[75%]">
            <div class="flex items-center mb-2">
              <i class="fas fa-robot text-blue-600 mr-2"></i>
              <strong class="text-blue-700">AI Analyst</strong>
            </div>
            <div class="message-text">${this.formatMessage(message)}</div>
            <small class="text-gray-500">${timestamp}</small>
          </div>
        </div>
      `;
    }

    chatContainer.appendChild(messageDiv);

    // Add to chat history (skip system messages)
    if (sender !== 'system') {
      this.chatHistory.push({ sender, message, timestamp });
    }

    // Scroll to bottom
    this.scrollToBottom();
  }

  // =============================
  // Format Message Content (Markdown-like to HTML)
  // =============================
  formatMessage(message) {
    return message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // =============================
  // Show Typing Indicator in Chat
  // =============================
  showTypingIndicator() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    // Remove existing typing indicator first
    this.hideTypingIndicator();

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message typing-indicator mb-3';
    typingDiv.innerHTML = `
      <div class="flex justify-start">
        <div class="bg-gray-50 border rounded-xl p-3">
          <div class="flex items-center mb-2">
            <i class="fas fa-robot text-blue-600 mr-2"></i>
            <strong class="text-blue-700">AI Analyst</strong>
          </div>
          <div class="typing-dots flex items-center">
            <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1" style="animation-delay:0s"></span>
            <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1" style="animation-delay:0.15s"></span>
            <span class="inline-block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay:0.3s"></span>
            <small class="text-gray-500 ml-2">Menganalisis data...</small>
          </div>
        </div>
      </div>
    `;

    chatContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  // =============================
  // Hide Typing Indicator
  // =============================
  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // =============================
  // Scroll Chat to Bottom
  // =============================
  scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  // =============================
  // Clear All Chat Messages
  // =============================
  clearChat() {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      // Remove all messages except the welcome message
      const messages = chatContainer.querySelectorAll('.chat-message');
      messages.forEach(message => message.remove());
    }
    this.chatHistory = [];
    window.AppUtils.showToast('info', 'Chat history cleared');
  }

  // =============================
  // Enable Chat Input & Buttons
  // =============================
  enableChatInterface() {
    const chatInput = document.getElementById('chatInput');
    const chatSubmit = document.getElementById('chatSubmit');
    const deepAnalysisBtn = document.getElementById('deepAnalysisBtn');

    if (chatInput) {
      chatInput.disabled = false;
      chatInput.placeholder =
        'Tanyakan tentang pattern fraud, rekomendasi, atau insight lainnya...';
    }
    if (chatSubmit) chatSubmit.disabled = false;
    if (deepAnalysisBtn) deepAnalysisBtn.disabled = false;
  }

  // =============================
  // Disable Chat Input & Buttons
  // =============================
  disableChatInterface() {
    const chatInput = document.getElementById('chatInput');
    const chatSubmit = document.getElementById('chatSubmit');
    const deepAnalysisBtn = document.getElementById('deepAnalysisBtn');

    if (chatInput) {
      chatInput.disabled = true;
      chatInput.placeholder = 'Pilih dataset batch terlebih dahulu untuk mulai chat...';
    }
    if (chatSubmit) chatSubmit.disabled = true;
    if (deepAnalysisBtn) deepAnalysisBtn.disabled = true;
  }

  // =============================
  // Perform Deep Analysis (AI)
  // =============================
  async performDeepAnalysis() {
    if (!this.currentBatchId) {
      window.AppUtils.showToast('warning', 'Pilih batch data terlebih dahulu');
      return;
    }
    const deepAnalysisBtn = document.getElementById('deepAnalysisBtn');
    const originalText = deepAnalysisBtn ? deepAnalysisBtn.innerHTML : '';
    try {
      if (deepAnalysisBtn) {
        deepAnalysisBtn.disabled = true;
        deepAnalysisBtn.innerHTML =
          '<span class="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></span>Menganalisis...';
      }
      // Prompt for deep analysis
      this.addMessageToChat(
        'user',
        'Sebagai AI Risk Analyst, mohon lakukan analisis risiko mendalam pada batch data ini. Identifikasi pola fraud, transaksi mencurigakan, dan berikan rekomendasi mitigasi risiko.'
      );
      this.showTypingIndicator();
      const response = await window.AppUtils.apiCall(
        `/api/transactions/deep-analysis/${this.currentBatchId}`,
        {
          method: 'POST',
        }
      );
      this.hideTypingIndicator();
      if (response.analysis) {
        if (response.needsAnalysis) {
          this.addMessageToChat(
            'assistant',
            `
            <div class="rounded-lg bg-yellow-50 border border-yellow-300 p-4">
              <h6 class="flex items-center font-semibold text-yellow-800 mb-2"><i class="fas fa-exclamation-triangle mr-2"></i>Batch Belum Dianalisis</h6>
              <div>${response.analysis.replace(/\n/g, '<br>')}</div>
              <hr class="my-2">
              <button class="bg-blue-600 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-blue-700 transition mt-2" onclick="chatManager.runBatchAnalysis()">
                <i class="fas fa-brain mr-1"></i>Jalankan Analisis AI Sekarang
              </button>
            </div>
          `
          );
        } else {
          this.addMessageToChat(
            'assistant',
            `
            <div class="analysis-result">
              <h6 class="flex items-center font-semibold text-blue-800 mb-2"><i class="fas fa-chart-line mr-2"></i>Hasil Analisis Mendalam</h6>
              <div class="analysis-content">${response.analysis.replace(/\n/g, '<br>')}</div>
            </div>
          `
          );
        }
      } else {
        this.addMessageToChat(
          'assistant',
          'Analisis berhasil dilakukan, tetapi tidak ada hasil yang ditemukan.'
        );
      }
      window.AppUtils.showToast('success', 'Analisis mendalam selesai');
    } catch (error) {
      console.error('Error performing deep analysis:', error);
      this.hideTypingIndicator();
      this.addMessageToChat(
        'assistant',
        `
        <div class="rounded-lg bg-red-50 border border-red-300 p-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Terjadi kesalahan saat melakukan analisis mendalam. Silakan coba lagi.
        </div>
      `
      );
      window.AppUtils.showToast('error', 'Gagal melakukan analisis mendalam');
    } finally {
      if (deepAnalysisBtn) {
        deepAnalysisBtn.disabled = false;
        deepAnalysisBtn.innerHTML = originalText;
      }
    }
  }

  // =============================
  // Setup Quick Question Buttons
  // =============================
  setupQuickButtons() {
    const quickButtons = document.querySelectorAll('.quick-btn');
    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.currentBatchId) {
          window.AppUtils.showToast('warning', 'Pilih batch data terlebih dahulu');
          return;
        }

        const question = btn.getAttribute('data-question');
        const chatInput = document.getElementById('chatInput');

        if (chatInput && question) {
          chatInput.value = question;
          chatInput.focus();

          // Trigger form submit to send the question
          const chatForm = document.getElementById('chatForm');
          if (chatForm) {
            chatForm.dispatchEvent(new Event('submit'));
          }
        }
      });
    });
  }

  // =============================
  // Setup Form Enhancements (Enter to Send)
  // =============================
  setupFormEnhancements() {
    const chatInput = document.getElementById('chatInput');

    if (chatInput) {
      // Enter to send (Ctrl+Enter for new line)
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.ctrlKey) {
          e.preventDefault();
          const chatForm = document.getElementById('chatForm');
          if (chatForm && !chatInput.disabled) {
            chatForm.dispatchEvent(new Event('submit'));
          }
        }
      });
    }
  }

  // =============================
  // Setup Scroll Animations (for future use)
  // =============================
  setupScrollAnimations() {
    const chatContainer = document.getElementById('chatContainer');

    if (chatContainer) {
      let isScrolling = false;

      chatContainer.addEventListener('scroll', () => {
        isScrolling = true;
        setTimeout(() => {
          isScrolling = false;
        }, 150);
      });
    }
  }

  // =============================
  // Setup Keyboard Shortcuts (Ctrl+K, Ctrl+L)
  // =============================
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Ctrl/Cmd + K to focus on message input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
          messageInput.focus();
        }
      }

      // Ctrl/Cmd + L to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        this.clearChat();
      }
    });
  }

  // =============================
  // Setup Loading State for Buttons
  // =============================
  setupLoadingStates() {
    // Add loading state to buttons when clicked
    const buttons = document.querySelectorAll('button[type="submit"], .btn-primary');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) {
          const originalText = btn.innerHTML;
          btn.setAttribute('data-original-text', originalText);
        }
      });
    });
  }

  // =============================
  // Run Batch Analysis using AI Model
  // =============================
  async runBatchAnalysis() {
    if (!this.currentBatchId) {
      window.AppUtils.showToast('warning', 'Tidak ada batch yang dipilih');
      return;
    }
    try {
      this.addMessageToChat('user', 'Menjalankan analisis AI pada batch ini...');
      this.showTypingIndicator();
      const response = await window.AppUtils.apiCall(
        `/api/transactions/analyze/${this.currentBatchId}`,
        {
          method: 'POST',
        }
      );
      this.hideTypingIndicator();
      if (response.message) {
        this.addMessageToChat(
          'assistant',
          `
          <div class="rounded-lg bg-green-50 border border-green-300 p-4">
            <i class="fas fa-check-circle mr-2"></i>
            ${response.message}
            <br><small class="text-green-700">Sekarang Anda dapat menjalankan analisis mendalam.</small>
          </div>
          `
        );
        window.AppUtils.showToast('success', 'Analisis AI selesai');
      }
    } catch (error) {
      console.error('Error running batch analysis:', error);
      this.hideTypingIndicator();
      this.addMessageToChat(
        'assistant',
        `
        <div class="rounded-lg bg-red-50 border border-red-300 p-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Gagal menjalankan analisis AI: ${error.message}
        </div>
        `
      );
      window.AppUtils.showToast('error', 'Gagal menjalankan analisis AI');
    }
  }
}

// =============================
// Initialize Chat Manager on DOM Ready
// =============================
document.addEventListener('DOMContentLoaded', () => {
  window.chatManager = new AIChatManager();
});
