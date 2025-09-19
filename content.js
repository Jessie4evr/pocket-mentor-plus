// ===== Pocket Mentor+ Content Script 🎓✨ =====
// Handles webpage interaction and text selection processing

console.log('✅ Pocket Mentor+ content script loaded on:', window.location.href);

class PocketMentorContent {
  constructor() {
    this.selectedText = '';
    this.isProcessing = false;
    this.videoAnalyzer = videoAnalyzer;
    this.init();
  }

  init() {
    this.setupMessageListeners();
    this.setupSelectionTracking();
    this.setupKeyboardShortcuts();
    this.injectStyles();
  }

  setupMessageListeners() {
    // Listen for messages from popup, background, or webpage
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('📨 Content script received message:', request);

      switch (request.action) {
        case 'getSelectedText':
          sendResponse({ text: this.getSelectedText() });
          break;
        
        case 'highlightText':
          sendResponse({ text: this.getSelectedText() });
          break;
        
        case 'processSelectedText':
          this.processSelectedText(request.aiAction)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep message channel open for async response
        
        case 'analyzeVideo':
          this.analyzeCurrentVideo(request.options)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep message channel open for async response
        
        case 'showNotification':
          this.showInPageNotification(request.message, request.type);
          sendResponse({ success: true });
          break;
        
        default:
          console.warn('Unknown action:', request.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    });

    // Listen for messages from the webpage itself
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      
      const { type, action, text } = event.data;
      
      if (type === 'POCKET_MENTOR_REQUEST' && action && text) {
        this.forwardToBackground(action, text)
          .then(result => {
            window.postMessage({
              type: 'POCKET_MENTOR_RESPONSE',
              action,
              result,
              success: true
            }, '*');
          })
          .catch(error => {
            window.postMessage({
              type: 'POCKET_MENTOR_RESPONSE',
              action,
              error: error.message,
              success: false
            }, '*');
          });
      }
    });
  }

  async analyzeCurrentVideo(options = {}) {
    try {
      // Use the video analyzer to find and analyze videos
      await this.videoAnalyzer.analyzeCurrentVideo();
      return 'Video analysis initiated. Check for summary modal or notifications.';
    } catch (error) {
      console.error('Video analysis failed:', error);
      throw new Error('No video found to analyze or analysis failed');
    }
  }

  setupSelectionTracking() {
    let selectionTimeout;
    
    document.addEventListener('mouseup', () => {
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => {
        this.selectedText = this.getSelectedText();
        if (this.selectedText.length > 10) {
          this.showSelectionTooltip(this.selectedText);
        } else {
          this.hideSelectionTooltip();
        }
      }, 100);
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
          e.shiftKey) {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          this.selectedText = this.getSelectedText();
          if (this.selectedText.length > 10) {
            this.showSelectionTooltip(this.selectedText);
          } else {
            this.hideSelectionTooltip();
          }
        }, 100);
      }
    });

    // Hide tooltip when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pocket-mentor-tooltip')) {
        this.hideSelectionTooltip();
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + S for summarize
      if (e.altKey && e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.quickProcess('summarize');
      }
      
      // Alt + E for explain
      if (e.altKey && e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.quickProcess('explain');
      }
      
      // Alt + T for translate
      if (e.altKey && e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.quickProcess('translate');
      }
      
      // Alt + P for proofread
      if (e.altKey && e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.quickProcess('proofread');
      }
    });
  }

  getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
  }

  async forwardToBackground(action, text) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action, text }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    });
  }

  async processSelectedText(action) {
    const text = this.getSelectedText();
    
    if (!text) {
      throw new Error('No text selected');
    }

    if (text.length < 10) {
      throw new Error('Please select more text (at least 10 characters)');
    }

    this.isProcessing = true;
    this.showProcessingIndicator(action);

    try {
      const result = await this.forwardToBackground(action, text);
      this.showResultNotification(result, action);
      return result;
    } finally {
      this.isProcessing = false;
      this.hideProcessingIndicator();
    }
  }

  async quickProcess(action) {
    const text = this.getSelectedText();
    
    if (!text) {
      this.showInPageNotification('Please select some text first', 'warning');
      return;
    }

    if (text.length < 10) {
      this.showInPageNotification('Please select more text (at least 10 characters)', 'warning');
      return;
    }

    try {
      await this.processSelectedText(action);
    } catch (error) {
      console.error(`Quick ${action} failed:`, error);
      this.showInPageNotification(`${action} failed: ${error.message}`, 'error');
    }
  }

  showSelectionTooltip(text) {
    this.hideSelectionTooltip();
    
    if (this.isProcessing) return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'pocket-mentor-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <span>🎓 Pocket Mentor+</span>
        <button class="tooltip-close" title="Close">×</button>
      </div>
      <div class="tooltip-content">
        <button class="tooltip-btn" data-action="summarize" title="Alt+S">📝 Summarize</button>
        <button class="tooltip-btn" data-action="explain" title="Alt+E">💡 Explain</button>
        <button class="tooltip-btn" data-action="translate" title="Alt+T">🌐 Translate</button>
        <button class="tooltip-btn" data-action="proofread" title="Alt+P">✏️ Proofread</button>
      </div>
    `;
    
    // Position tooltip
    tooltip.style.position = 'fixed';
    tooltip.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
    tooltip.style.top = `${Math.max(10, rect.top - 120)}px`;
    tooltip.style.zIndex = '10000';
    
    document.body.appendChild(tooltip);
    
    // Add event listeners
    tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
      this.hideSelectionTooltip();
    });
    
    tooltip.querySelectorAll('.tooltip-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        this.hideSelectionTooltip();
        await this.quickProcess(action);
      });
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideSelectionTooltip();
    }, 10000);
  }

  hideSelectionTooltip() {
    const existing = document.querySelector('.pocket-mentor-tooltip');
    if (existing) {
      existing.remove();
    }
  }

  showProcessingIndicator(action) {
    const indicator = document.createElement('div');
    indicator.className = 'pocket-mentor-processing';
    indicator.innerHTML = `
      <div class="processing-content">
        <div class="spinner"></div>
        <span>Processing with Pocket Mentor+...</span>
      </div>
    `;
    
    indicator.style.position = 'fixed';
    indicator.style.top = '20px';
    indicator.style.right = '20px';
    indicator.style.zIndex = '10001';
    
    document.body.appendChild(indicator);
  }

  hideProcessingIndicator() {
    const existing = document.querySelector('.pocket-mentor-processing');
    if (existing) {
      existing.remove();
    }
  }

  showResultNotification(result, action) {
    const notification = document.createElement('div');
    notification.className = 'pocket-mentor-notification success';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <span>🎓 Pocket Mentor+ - ${this.capitalizeFirst(action)} Complete!</span>
          <button class="notification-close">×</button>
        </div>
        <div class="notification-body">
          <div class="result-preview">${this.truncateText(result, 150)}</div>
          <div class="notification-actions">
            <button class="notification-btn copy-btn">📋 Copy</button>
            <button class="notification-btn notebook-btn">📚 Open Notebook</button>
          </div>
        </div>
      </div>
    `;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10002';
    
    document.body.appendChild(notification);
    
    // Add event listeners
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });
    
    notification.querySelector('.copy-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(result);
        this.showInPageNotification('✅ Copied to clipboard!', 'success');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    });
    
    notification.querySelector('.notebook-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openNotebook' });
      notification.remove();
    });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 8000);
  }

  showInPageNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pocket-mentor-toast ${type}`;
    notification.textContent = message;
    
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10003';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.remove();
          }
        }, 300);
      }
    }, 3000);
  }

  injectStyles() {
    if (document.getElementById('pocket-mentor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pocket-mentor-styles';
    style.textContent = `
      .pocket-mentor-tooltip {
        background: white;
        border: 2px solid #b8860b;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 280px;
        max-width: 320px;
        animation: fadeInUp 0.3s ease-out;
      }
      
      .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #b8860b;
        color: white;
        border-radius: 10px 10px 0 0;
        font-weight: 600;
      }
      
      .tooltip-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .tooltip-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .tooltip-content {
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .tooltip-btn {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 10px 8px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        font-weight: 500;
      }
      
      .tooltip-btn:hover {
        background: #b8860b;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(184, 134, 11, 0.3);
      }
      
      .pocket-mentor-processing {
        background: white;
        border: 2px solid #007bff;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: fadeInUp 0.3s ease-out;
      }
      
      .processing-content {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #007bff;
        font-weight: 500;
      }
      
      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .pocket-mentor-notification {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      }
      
      .pocket-mentor-notification.success {
        border-left: 4px solid #28a745;
      }
      
      .notification-content {
        padding: 0;
      }
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px 12px;
        font-weight: 600;
        color: #28a745;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6c757d;
        padding: 0;
      }
      
      .notification-body {
        padding: 0 20px 16px;
      }
      
      .result-preview {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        font-size: 13px;
        line-height: 1.4;
        color: #495057;
      }
      
      .notification-actions {
        display: flex;
        gap: 8px;
      }
      
      .notification-btn {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .notification-btn:hover {
        background: #0056b3;
      }
      
      .pocket-mentor-toast {
        background: white;
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
      }
      
      .pocket-mentor-toast.success {
        border-left: 4px solid #28a745;
        color: #155724;
      }
      
      .pocket-mentor-toast.warning {
        border-left: 4px solid #ffc107;
        color: #856404;
      }
      
      .pocket-mentor-toast.error {
        border-left: 4px solid #dc3545;
        color: #721c24;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // Utility methods
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

// Initialize content script
const pocketMentorContent = new PocketMentorContent();

// Export for potential use by other scripts
window.PocketMentorContent = pocketMentorContent;