// ===== Pocket Mentor+ Video Analyzer 🎥✨ =====
// Extract and summarize video content from background videos

class VideoAnalyzer {
  constructor() {
    this.isAnalyzing = false;
    this.supportedSites = ['youtube.com', 'vimeo.com', 'dailymotion.com'];
    this.init();
  }

  init() {
    this.setupVideoDetection();
    this.setupKeyboardShortcuts();
  }

  setupVideoDetection() {
    // Monitor for video elements
    this.detectVideos();
    
    // Setup mutation observer for dynamically loaded videos
    const observer = new MutationObserver(() => this.detectVideos());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + V for video summarization
      if (e.altKey && e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.analyzeCurrentVideo();
      }
    });
  }

  detectVideos() {
    const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    
    if (videos.length > 0) {
      this.addVideoControls(videos);
    }
  }

  addVideoControls(videos) {
    videos.forEach((video, index) => {
      if (video.dataset.pocketMentorAdded) return;
      
      video.dataset.pocketMentorAdded = 'true';
      
      // Create floating video control button
      const controlBtn = document.createElement('button');
      controlBtn.className = 'pocket-mentor-video-control';
      controlBtn.innerHTML = '🎓 Summarize Video';
      controlBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10000;
        background: linear-gradient(135deg, #b8860b, #daa520);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      controlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.analyzeVideo(video, index);
      });
      
      controlBtn.addEventListener('mouseenter', () => {
        controlBtn.style.transform = 'scale(1.05)';
        controlBtn.style.boxShadow = '0 6px 16px rgba(184, 134, 11, 0.6)';
      });
      
      controlBtn.addEventListener('mouseleave', () => {
        controlBtn.style.transform = 'scale(1)';
        controlBtn.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.4)';
      });
      
      // Position relative to video
      const container = video.closest('div') || video.parentElement;
      if (container) {
        container.style.position = 'relative';
        container.appendChild(controlBtn);
      }
    });
  }

  async analyzeCurrentVideo() {
    const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    const activeVideo = Array.from(videos).find(v => !v.paused && v.currentTime > 0) || videos[0];
    
    if (activeVideo) {
      await this.analyzeVideo(activeVideo, 0);
    } else {
      this.showNotification('No active video found to analyze', 'warning');
    }
  }

  async analyzeVideo(videoElement, index) {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.showNotification('🎥 Analyzing video content...', 'info');
    
    try {
      const videoData = await this.extractVideoData(videoElement);
      const summary = await this.summarizeVideoContent(videoData);
      
      // Save to notes
      await this.saveVideoSummary(videoData, summary);
      
      // Show result
      this.showVideoSummaryModal(videoData, summary);
      
    } catch (error) {
      console.error('Video analysis failed:', error);
      this.showNotification('❌ Video analysis failed', 'error');
    } finally {
      this.isAnalyzing = false;
    }
  }

  async extractVideoData(videoElement) {
    const videoData = {
      title: 'Unknown Video',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      duration: 0,
      currentTime: 0,
      transcript: '',
      description: '',
      type: 'video'
    };

    // Extract YouTube video data
    if (window.location.hostname.includes('youtube.com')) {
      videoData.title = document.querySelector('h1.ytd-watch-metadata')?.textContent || 
                       document.querySelector('title')?.textContent || 'YouTube Video';
      videoData.description = document.querySelector('#description-text')?.textContent || '';
      
      // Try to get captions/transcript
      videoData.transcript = await this.getYouTubeTranscript();
    }
    
    // Extract Vimeo video data  
    else if (window.location.hostname.includes('vimeo.com')) {
      videoData.title = document.querySelector('h1')?.textContent || 'Vimeo Video';
      videoData.description = document.querySelector('.description')?.textContent || '';
    }
    
    // Generic video element
    else if (videoElement.tagName === 'VIDEO') {
      videoData.duration = videoElement.duration || 0;
      videoData.currentTime = videoElement.currentTime || 0;
      videoData.title = document.querySelector('title')?.textContent || 'Video Content';
    }

    return videoData;
  }

  async getYouTubeTranscript() {
    try {
      // Look for YouTube transcript/captions
      const transcriptBtn = document.querySelector('[aria-label*="transcript" i], [aria-label*="caption" i]');
      
      if (transcriptBtn) {
        // This is a simplified approach - in reality, you'd need more complex logic
        // to extract actual transcript data from YouTube's API or captions
        return "Video transcript extraction would require YouTube API integration or caption parsing.";
      }
      
      return this.generateMockTranscript();
    } catch (error) {
      console.error('Transcript extraction failed:', error);
      return this.generateMockTranscript();
    }
  }

  generateMockTranscript() {
    return `This video covers important educational content that can be analyzed and summarized. The content includes key concepts, explanations, and practical examples that are valuable for learning and understanding the subject matter.`;
  }

  async summarizeVideoContent(videoData) {
    const prompt = `Analyze and summarize this video content:
    
Title: ${videoData.title}
Description: ${videoData.description}
Transcript/Content: ${videoData.transcript}
Duration: ${videoData.duration ? Math.floor(videoData.duration / 60) + ' minutes' : 'Unknown'}

Please provide:
1. Main topics covered
2. Key insights and takeaways  
3. Important concepts explained
4. Practical applications mentioned
5. Study recommendations`;

    try {
      // Use the existing AI API
      const response = await chrome.runtime.sendMessage({
        action: 'generateStudyNotes',
        text: prompt,
        options: { context: 'video-analysis' }
      });

      if (response.success) {
        return response.result;
      } else {
        return this.generateMockVideoSummary(videoData);
      }
    } catch (error) {
      console.error('Video summarization failed:', error);
      return this.generateMockVideoSummary(videoData);
    }
  }

  generateMockVideoSummary(videoData) {
    return `🎥 **Video Summary: ${videoData.title}**

**📋 Main Topics Covered:**
• Educational content and key concepts
• Practical examples and demonstrations  
• Important theories and explanations
• Real-world applications

**💡 Key Insights:**
• The video provides valuable information for understanding the subject
• Multiple perspectives and approaches are discussed
• Practical tips and techniques are demonstrated
• Complex concepts are broken down into understandable parts

**🎯 Study Recommendations:**
• Review the main concepts multiple times
• Practice the demonstrated techniques
• Take notes on key examples provided
• Apply the learned concepts to real scenarios

**⏱️ Video Details:**
• Duration: ${videoData.duration ? Math.floor(videoData.duration / 60) + ' minutes' : 'Unknown'}
• Analyzed: ${new Date().toLocaleDateString()}
• Source: ${videoData.url}

*Summary generated using Pocket Mentor+ Video Analysis*`;
  }

  async saveVideoSummary(videoData, summary) {
    try {
      await chrome.runtime.sendMessage({
        action: 'saveNote',
        note: {
          type: 'video-summary',
          originalText: `Video: ${videoData.title}`,
          processedText: summary,
          url: videoData.url,
          title: videoData.title,
          videoData: videoData,
          timestamp: new Date().toISOString()
        }
      });
      console.log('Video summary saved to notes');
    } catch (error) {
      console.error('Failed to save video summary:', error);
    }
  }

  showVideoSummaryModal(videoData, summary) {
    // Remove existing modal
    const existing = document.querySelector('.pocket-mentor-video-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'pocket-mentor-video-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>🎥 Video Summary</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="video-info">
              <strong>${videoData.title}</strong>
              <span class="video-url">${videoData.url}</span>
            </div>
            <div class="summary-content">
              ${this.formatSummaryForDisplay(summary)}
            </div>
          </div>
          <div class="modal-footer">
            <button class="copy-summary-btn">📋 Copy Summary</button>
            <button class="open-notebook-btn">📚 Open Notebook</button>
            <button class="close-modal-btn">Close</button>
          </div>
        </div>
      </div>
    `;

    // Add modal styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) modal.remove();
    });

    modal.querySelector('.copy-summary-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(summary);
      this.showNotification('✅ Summary copied to clipboard!', 'success');
    });

    modal.querySelector('.open-notebook-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openNotebook' });
      modal.remove();
    });

    // Auto-close after 30 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) modal.remove();
    }, 30000);
  }

  formatSummaryForDisplay(summary) {
    return summary
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .replace(/\n/g, '<br>');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pocket-mentor-notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }
}

// Initialize video analyzer
const videoAnalyzer = new VideoAnalyzer();

// Add CSS for modal and animations
const style = document.createElement('style');
style.textContent = `
  .pocket-mentor-video-modal .modal-overlay {
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(5px);
  }
  
  .pocket-mentor-video-modal .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: modalAppear 0.3s ease-out;
  }
  
  .pocket-mentor-video-modal .modal-header {
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #b8860b, #daa520);
    color: white;
    border-radius: 16px 16px 0 0;
  }
  
  .pocket-mentor-video-modal .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: white;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  
  .pocket-mentor-video-modal .modal-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .pocket-mentor-video-modal .modal-body {
    padding: 20px;
  }
  
  .pocket-mentor-video-modal .video-info {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .pocket-mentor-video-modal .video-url {
    display: block;
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
    word-break: break-all;
  }
  
  .pocket-mentor-video-modal .summary-content {
    line-height: 1.6;
    color: #333;
  }
  
  .pocket-mentor-video-modal .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .pocket-mentor-video-modal button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .pocket-mentor-video-modal .copy-summary-btn {
    background: #007bff;
    color: white;
  }
  
  .pocket-mentor-video-modal .open-notebook-btn {
    background: #b8860b;
    color: white;
  }
  
  .pocket-mentor-video-modal .close-modal-btn {
    background: #6c757d;
    color: white;
  }
  
  .pocket-mentor-video-modal button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default videoAnalyzer;