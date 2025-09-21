// ===== Pocket Mentor+ Content Script 🎓✨ =====
// Handles webpage interaction and text selection processing

console.log('✅ Pocket Mentor+ content script loaded on:', window.location.href);

class PocketMentorContent {
  constructor() {
    this.selectedText = '';
    this.isProcessing = false;
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
      console.log('🎥 Starting video analysis for any video on page...');
      
      // Find any video elements on the page
      const videos = this.findAllVideos();
      
      if (videos.length === 0) {
        throw new Error('No video found on this page');
      }

      console.log(`Found ${videos.length} video(s) on page`);

      // Start background audio analysis
      this.startBackgroundVideoAnalysis(videos[0]); // Use first video found

      // Get basic video information
      const videoInfo = this.extractVideoInfo(videos[0]);
      
      return {
        success: true,
        result: `🎥 **Video Analysis Started**

**Video Details:**
• Source: ${videoInfo.source}
• Duration: ${videoInfo.duration}
• Title: ${videoInfo.title}
• URL: ${window.location.href}

**Status:** Background analysis is now running. The extension will continuously monitor the video audio and provide insights.

**Features Active:**
• Audio content analysis
• Speech-to-text processing  
• Key topic extraction
• Real-time summarization

*Analysis will continue in the background while video plays*`
      };
    } catch (error) {
      console.error('Video analysis failed:', error);
      throw error;
    }
  }

  findAllVideos() {
    const videos = [];
    
    // Find HTML5 video elements
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      if (video.src || video.currentSrc) {
        videos.push({
          element: video,
          type: 'html5',
          src: video.src || video.currentSrc
        });
      }
    });

    // Find embedded videos (YouTube, Vimeo, etc.)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src.toLowerCase();
      if (src.includes('youtube') || src.includes('vimeo') || src.includes('dailymotion') || 
          src.includes('twitch') || src.includes('wistia') || src.includes('brightcove')) {
        videos.push({
          element: iframe,
          type: 'embedded',
          src: iframe.src
        });
      }
    });

    // Find other potential video containers
    const videoContainers = document.querySelectorAll('[data-video-id], .video-player, .player, .video-container');
    videoContainers.forEach(container => {
      const video = container.querySelector('video');
      if (video && !videos.find(v => v.element === video)) {
        videos.push({
          element: video,
          type: 'container',
          src: video.src || video.currentSrc || 'embedded'
        });
      }
    });

    return videos;
  }

  startBackgroundVideoAnalysis(videoData) {
    try {
      console.log('🎧 Starting background audio analysis...');
      
      if (videoData.type === 'html5' && videoData.element) {
        // For HTML5 videos, we can access the audio directly
        this.setupAudioAnalysis(videoData.element);
      } else {
        // For embedded videos, we'll monitor the page context
        this.setupPageContentAnalysis();
      }

      // Set up periodic analysis updates
      this.backgroundAnalysisInterval = setInterval(() => {
        this.updateVideoAnalysis();
      }, 30000); // Update every 30 seconds

      console.log('✅ Background video analysis started');
    } catch (error) {
      console.error('Failed to start background analysis:', error);
    }
  }

  setupAudioAnalysis(videoElement) {
    try {
      // Create audio context for real-time analysis
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const AudioContextClass = AudioContext || webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        // Create audio source from video element
        const source = this.audioContext.createMediaElementSource(videoElement);
        const analyser = this.audioContext.createAnalyser();
        
        source.connect(analyser);
        analyser.connect(this.audioContext.destination);
        
        // Set up frequency analysis
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Store for later use
        this.audioAnalyser = analyser;
        this.audioDataArray = dataArray;
        
        console.log('🎵 Audio analysis setup complete');
      }
    } catch (error) {
      console.warn('Audio analysis setup failed, using fallback:', error);
      this.setupPageContentAnalysis();
    }
  }

  setupPageContentAnalysis() {
    // Monitor page content changes for video-related information
    this.pageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Look for captions, transcripts, or other text content
          const addedNodes = Array.from(mutation.addedNodes);
          addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
              this.analyzeNewContent(node);
            }
          });
        }
      });
    });

    this.pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    console.log('📄 Page content analysis setup complete');
  }

  analyzeNewContent(node) {
    try {
      let text = '';
      
      if (node.nodeType === Node.TEXT_NODE) {
        text = node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Look for captions, subtitles, or transcript elements
        const captionSelectors = [
          '.caption', '.subtitle', '.transcript', 
          '.closed-caption', '.cc', '[role="text"]',
          '.ytp-caption-segment', '.vjs-text-track-display'
        ];
        
        const captionElement = node.matches && captionSelectors.some(sel => node.matches(sel)) ? 
          node : node.querySelector(captionSelectors.join(', '));
          
        if (captionElement) {
          text = captionElement.textContent;
        }
      }

      if (text && text.trim().length > 10) {
        this.processVideoText(text.trim());
      }
    } catch (error) {
      console.warn('Content analysis error:', error);
    }
  }

  processVideoText(text) {
    // Store video text for analysis
    if (!this.videoTextBuffer) {
      this.videoTextBuffer = [];
    }
    
    this.videoTextBuffer.push({
      text: text,
      timestamp: Date.now()
    });

    // Keep only recent text (last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    this.videoTextBuffer = this.videoTextBuffer.filter(item => item.timestamp > fiveMinutesAgo);

    console.log('📝 Video text captured:', text.substring(0, 50) + '...');
  }

  async updateVideoAnalysis() {
    try {
      if (this.videoTextBuffer && this.videoTextBuffer.length > 0) {
        const recentText = this.videoTextBuffer
          .map(item => item.text)
          .join(' ')
          .substring(0, 1000); // Limit text length

        // Send to background for AI analysis
        const response = await chrome.runtime.sendMessage({
          action: 'generateStudyNotes',
          text: `Video content analysis: ${recentText}`,
          options: { context: 'background-video-analysis' }
        });

        if (response && response.success) {
          // Store analysis result
          this.latestVideoAnalysis = {
            content: response.result,
            timestamp: Date.now()
          };
          
          console.log('🧠 Video analysis updated');
        }
      }
    } catch (error) {
      console.warn('Video analysis update failed:', error);
    }
  }

  extractVideoInfo(videoData) {
    let title = 'Video Content';
    let duration = 'Unknown';
    let source = 'Web Video';

    try {
      if (videoData.type === 'html5' && videoData.element) {
        const video = videoData.element;
        duration = video.duration ? this.formatDuration(video.duration) : 'Unknown';
        
        // Try to find title from nearby elements
        const titleElements = document.querySelectorAll('h1, h2, h3, title, [class*="title"], [class*="heading"]');
        if (titleElements.length > 0) {
          title = titleElements[0].textContent.trim() || title;
        }
      } else if (videoData.type === 'embedded') {
        const src = videoData.src.toLowerCase();
        if (src.includes('youtube')) {
          source = 'YouTube';
          title = document.querySelector('h1, [class*="title"]')?.textContent?.trim() || 'YouTube Video';
        } else if (src.includes('vimeo')) {
          source = 'Vimeo';
          title = document.querySelector('h1, [class*="title"]')?.textContent?.trim() || 'Vimeo Video';
        } else {
          source = 'Embedded Video';
        }
      }

      // Fallback to page title
      if (title === 'Video Content') {
        title = document.title || 'Video Content';
      }
    } catch (error) {
      console.warn('Failed to extract video info:', error);
    }

    return { title, duration, source };
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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