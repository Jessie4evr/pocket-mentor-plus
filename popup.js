// ===== Pocket Mentor+ Popup Script 🎓✨ =====

import pocketMentorAPI from './api.js';
import themeManager from './theme-manager.js';

class PocketMentorPopup {
  constructor() {
    this.elements = {};
    this.isLoading = false;
    this.init();
  }

  init() {
    this.bindElements();
    this.attachEventListeners();
    this.loadTheme();
    this.loadRecentNotes();
    this.checkAIStatus();
    this.setupThemes();
  }

  bindElements() {
    this.elements = {
      themeToggle: document.getElementById('themeToggle'),
      themesBtn: document.getElementById('themesBtn'),
      themesPanel: document.getElementById('themesPanel'),
      themeGrid: document.getElementById('themeGrid'),
      quickInput: document.getElementById('quickInput'),
      quickOutput: document.getElementById('quickOutput'),
      openNotebook: document.getElementById('openNotebook'),
      checkCapabilities: document.getElementById('checkCapabilities'),
      summarizeVideo: document.getElementById('summarizeVideo'),
      quickNotes: document.getElementById('quickNotes'),
      quickSummarize: document.getElementById('quickSummarize'),
      quickExplain: document.getElementById('quickExplain'),
      quickTranslate: document.getElementById('quickTranslate'),
      quickProofread: document.getElementById('quickProofread'),
      recentNotesList: document.getElementById('recentNotesList'),
      clearNotes: document.getElementById('clearNotes')
    };
  }

  attachEventListeners() {
    // Theme controls
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.elements.themesBtn.addEventListener('click', () => this.toggleThemesPanel());

    // Navigation
    this.elements.openNotebook.addEventListener('click', () => this.openNotebook());
    this.elements.checkCapabilities.addEventListener('click', () => this.checkCapabilities());
    this.elements.summarizeVideo.addEventListener('click', () => this.summarizeVideo());
    this.elements.quickNotes.addEventListener('click', () => this.showQuickNotes());

    // Quick actions
    this.elements.quickSummarize.addEventListener('click', () => this.handleQuickAction('summarize'));
    this.elements.quickExplain.addEventListener('click', () => this.handleQuickAction('explain'));
    this.elements.quickTranslate.addEventListener('click', () => this.handleQuickAction('translate'));
    this.elements.quickProofread.addEventListener('click', () => this.handleQuickAction('proofread'));

    // Notes management
    this.elements.clearNotes.addEventListener('click', () => this.clearNotes());

    // Auto-save input
    this.elements.quickInput.addEventListener('input', this.debounce(() => {
      this.saveInputState();
    }, 500));

    // Listen for theme changes
    document.addEventListener('themeChanged', (e) => {
      this.updateThemeToggleText(e.detail.theme);
    });
  }

  setupThemes() {
    const themes = themeManager.getAvailableThemes();
    const currentTheme = themeManager.getCurrentTheme();
    
    this.elements.themeGrid.innerHTML = '';
    
    themes.forEach(theme => {
      const themePreview = themeManager.createThemePreview(theme.key);
      
      if (theme.key === currentTheme) {
        themePreview.style.borderColor = theme.colors.accent;
        themePreview.style.borderWidth = '3px';
      }
      
      themePreview.addEventListener('click', () => {
        this.selectTheme(theme.key);
      });
      
      this.elements.themeGrid.appendChild(themePreview);
    });
  }

  async selectTheme(themeName) {
    await themeManager.setTheme(themeName);
    this.setupThemes(); // Refresh theme grid
    this.elements.themesPanel.style.display = 'none';
    this.showMessage(`✅ ${themeManager.themes[themeName].name} theme applied!`, 'success');
  }

  toggleThemesPanel() {
    const isVisible = this.elements.themesPanel.style.display !== 'none';
    this.elements.themesPanel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      this.setupThemes(); // Refresh when opening
    }
  }

  async summarizeVideo() {
    this.showLoading('🎥 Looking for videos to summarize...');
    
    try {
      // Send message to content script to analyze video
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(activeTab.id, {
        action: 'analyzeVideo',
        options: { source: 'popup' }
      });

      if (response && response.success) {
        this.showResult(response.result);
      } else {
        this.showMessage('⚠️ No video found to summarize. Try opening a YouTube video or video page.', 'warning');
      }
    } catch (error) {
      console.error('Video summarization failed:', error);
      this.showMessage('❌ Video summarization failed. Make sure you\'re on a page with video content.', 'error');
    }
  }

  async showQuickNotes() {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getNotes', 
        filter: { limit: 5 } 
      });

      if (response.success && response.result.length > 0) {
        const notesHtml = response.result.map(note => `
          <div class="quick-note-item" data-note-id="${note.id}">
            <div class="note-type-small">${this.getTypeIcon(note.type)}</div>
            <div class="note-content-small">
              ${this.truncateText(note.processedText || note.originalText, 60)}
            </div>
            <div class="note-date-small">${this.formatDate(note.createdAt)}</div>
          </div>
        `).join('');
        
        this.showResult(`<div class="quick-notes-container">${notesHtml}</div>`);
      } else {
        this.showMessage('📝 No notes yet. Start by processing some text!', 'info');
      }
    } catch (error) {
      console.error('Failed to load quick notes:', error);
      this.showMessage('❌ Failed to load notes', 'error');
    }
  }

  updateThemeToggleText(theme) {
    const themeNames = {
      light: '🌙 Dark Mode',
      dark: '☀️ Light Mode',
      cyberpunk: '🌙 Dark Mode',
      forest: '🌙 Dark Mode', 
      ocean: '🌙 Dark Mode',
      rose: '🌙 Dark Mode'
    };
    
    this.elements.themeToggle.textContent = themeNames[theme] || '🌙 Dark Mode';
  }

  getTypeIcon(type) {
    const icons = {
      summarize: '📝',
      explain: '💡',
      translate: '🌐',
      rewrite: '✏️',
      proofread: '🔤',
      quiz: '❓',
      generateQuiz: '❓',
      generateStudyNotes: '📚',
      'video-summary': '🎥',
      saved: '💾'
    };
    return icons[type] || '📄';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  }

  async loadTheme() {
    try {
      const result = await chrome.storage.sync.get('theme');
      const theme = result.theme || 'light';
      this.setTheme(theme);
    } catch (error) {
      console.error('Failed to load theme:', error);
      this.setTheme('light');
    }
  }

  setTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    this.elements.themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  async toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    this.setTheme(newTheme);
    
    try {
      await chrome.storage.sync.set({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  async openNotebook() {
    try {
      await chrome.tabs.create({ url: chrome.runtime.getURL('notebook.html') });
      window.close();
    } catch (error) {
      console.error('Failed to open notebook:', error);
      this.showMessage('Failed to open notebook', 'error');
    }
  }

  async checkCapabilities() {
    this.showLoading('Checking AI capabilities...');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkCapabilities' });
      
      if (response.success) {
        const capabilities = response.result;
        const availableAPIs = Object.entries(capabilities)
          .filter(([_, available]) => available)
          .map(([api, _]) => api)
          .join(', ');
        
        const message = availableAPIs 
          ? `✅ Available APIs: ${availableAPIs}`
          : '⚠️ No AI APIs currently available. Please check Chrome flags and ensure Gemini Nano is enabled.';
        
        this.showMessage(message, availableAPIs ? 'success' : 'warning');
      } else {
        this.showMessage('❌ Failed to check capabilities', 'error');
      }
    } catch (error) {
      console.error('Capability check failed:', error);
      this.showMessage('❌ AI capability check failed', 'error');
    }
  }

  async handleQuickAction(action) {
    const text = this.elements.quickInput.value.trim();
    
    if (!text) {
      this.showMessage('⚠️ Please enter some text first', 'warning');
      this.elements.quickInput.focus();
      return;
    }

    this.showLoading(`${this.capitalizeFirst(action)}ing...`);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: action,
        text: text,
        options: { format: 'markdown' }
      });

      if (response.success) {
        this.showResult(response.result);
        this.loadRecentNotes(); // Refresh notes list
      } else {
        this.showMessage(`❌ ${this.capitalizeFirst(action)} failed: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
      this.showMessage(`❌ ${this.capitalizeFirst(action)} failed`, 'error');
    }
  }

  async loadRecentNotes() {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getNotes', 
        filter: { limit: 3 } 
      });

      if (response.success && response.result.length > 0) {
        this.renderRecentNotes(response.result);
      } else {
        this.elements.recentNotesList.innerHTML = '<p>No recent notes. Start by processing some text!</p>';
      }
    } catch (error) {
      console.error('Failed to load recent notes:', error);
    }
  }

  renderRecentNotes(notes) {
    const notesHTML = notes.map(note => `
      <div class="recent-note" data-note-id="${note.id}">
        <div class="note-header">
          <span class="note-type">${note.type}</span>
          <span class="note-date">${this.formatDate(note.createdAt)}</span>
        </div>
        <div class="note-preview">
          ${this.truncateText(note.processedText || note.originalText, 100)}
        </div>
      </div>
    `).join('');
    
    this.elements.recentNotesList.innerHTML = notesHTML;
  }

  async clearNotes() {
    if (!confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.local.set({ notes: [] });
      this.loadRecentNotes();
      this.showMessage('✅ All notes cleared', 'success');
    } catch (error) {
      console.error('Failed to clear notes:', error);
      this.showMessage('❌ Failed to clear notes', 'error');
    }
  }

  async saveInputState() {
    try {
      await chrome.storage.local.set({ 
        quickInputState: this.elements.quickInput.value 
      });
    } catch (error) {
      console.error('Failed to save input state:', error);
    }
  }

  async loadInputState() {
    try {
      const result = await chrome.storage.local.get('quickInputState');
      if (result.quickInputState) {
        this.elements.quickInput.value = result.quickInputState;
      }
    } catch (error) {
      console.error('Failed to load input state:', error);
    }
  }

  async checkAIStatus() {
    // Show initial status
    this.showMessage('🔄 Checking AI availability...', 'info');
    
    setTimeout(async () => {
      try {
        const isReady = pocketMentorAPI.isReady();
        if (isReady) {
          this.showMessage('✅ AI is ready for use', 'success');
        } else {
          this.showMessage('⚠️ AI initializing... Please wait', 'warning');
        }
      } catch (error) {
        this.showMessage('❌ AI unavailable. Check Chrome flags', 'error');
      }
    }, 1000);
  }

  showLoading(message) {
    this.isLoading = true;
    this.elements.quickOutput.innerHTML = `
      <div class="loading">
        <span class="spinner"></span>
        ${message}
      </div>
    `;
  }

  showResult(result) {
    this.isLoading = false;
    this.elements.quickOutput.innerHTML = `
      <div class="result-content">
        ${this.formatResult(result)}
      </div>
    `;
  }

  showMessage(message, type = 'info') {
    this.isLoading = false;
    this.elements.quickOutput.innerHTML = `
      <div class="status-message status-${type}">
        ${message}
      </div>
    `;
  }

  formatResult(result) {
    // Basic markdown-like formatting
    return result
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PocketMentorPopup();
});

// Add some basic styles for the popup-specific elements
const style = document.createElement('style');
style.textContent = `
  .recent-note {
    background: rgba(184, 134, 11, 0.1);
    border: 1px solid rgba(184, 134, 11, 0.3);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 8px;
    font-size: 0.85rem;
  }
  
  .recent-note:hover {
    background: rgba(184, 134, 11, 0.15);
  }
  
  .note-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  
  .note-type {
    background: var(--primary-gold);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
  }
  
  .note-date {
    font-size: 0.7rem;
    opacity: 0.7;
  }
  
  .note-preview {
    line-height: 1.4;
    opacity: 0.8;
  }
  
  .result-content {
    line-height: 1.6;
    font-size: 0.9rem;
  }
  
  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-style: italic;
    opacity: 0.8;
  }
`;
document.head.appendChild(style);