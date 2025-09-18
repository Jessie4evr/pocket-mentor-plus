/* ===== Pocket Mentor+ 🎓✨ Notebook Application ===== */

import pocketMentorAPI from './api.js';

class PocketMentorNotebook {
  constructor() {
    this.elements = {};
    this.currentResult = null;
    this.notes = [];
    this.stats = {};
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    this.bindElements();
    this.attachEventListeners();
    await this.loadTheme();
    await this.checkAICapabilities();
    await this.loadNotes();
    await this.loadStats();
    this.setupCharCounter();
  }

  bindElements() {
    this.elements = {
      // Theme and controls
      themeToggle: document.getElementById('themeToggle'),
      aiStatusBanner: document.getElementById('aiStatusBanner'),
      
      // Input elements
      inputBox: document.getElementById('inputBox'),
      clearInput: document.getElementById('clearInput'),
      pasteFromClipboard: document.getElementById('pasteFromClipboard'),
      charCount: document.getElementById('charCount'),
      
      // Action buttons
      summarizeBtn: document.getElementById('summarizeBtn'),
      explainBtn: document.getElementById('explainBtn'),
      rewriteBtn: document.getElementById('rewriteBtn'),
      proofreadBtn: document.getElementById('proofreadBtn'),
      generateQuizBtn: document.getElementById('generateQuizBtn'),
      studyNotesBtn: document.getElementById('studyNotesBtn'),
      translateBtn: document.getElementById('translateBtn'),
      languageSelect: document.getElementById('languageSelect'),
      
      // Output elements
      outputBox: document.getElementById('outputBox'),
      saveResult: document.getElementById('saveResult'),
      copyResult: document.getElementById('copyResult'),
      
      // Notes elements
      notesContainer: document.getElementById('notesContainer'),
      notesFilter: document.getElementById('notesFilter'),
      refreshNotes: document.getElementById('refreshNotes'),
      exportNotes: document.getElementById('exportNotes'),
      clearAllNotes: document.getElementById('clearAllNotes'),
      
      // Stats elements
      totalNotes: document.getElementById('totalNotes'),
      totalSessions: document.getElementById('totalSessions'),
      totalProcessed: document.getElementById('totalProcessed')
    };
  }

  attachEventListeners() {
    // Theme toggle
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Input controls
    this.elements.clearInput.addEventListener('click', () => this.clearInput());
    this.elements.pasteFromClipboard.addEventListener('click', () => this.pasteFromClipboard());
    this.elements.inputBox.addEventListener('input', () => this.updateCharCount());

    // AI action buttons
    this.elements.summarizeBtn.addEventListener('click', () => this.handleAIAction('summarize'));
    this.elements.explainBtn.addEventListener('click', () => this.handleAIAction('explain'));
    this.elements.rewriteBtn.addEventListener('click', () => this.handleAIAction('rewrite'));
    this.elements.proofreadBtn.addEventListener('click', () => this.handleAIAction('proofread'));
    this.elements.generateQuizBtn.addEventListener('click', () => this.handleAIAction('generateQuiz'));
    this.elements.studyNotesBtn.addEventListener('click', () => this.handleAIAction('generateStudyNotes'));
    this.elements.translateBtn.addEventListener('click', () => this.handleTranslate());

    // Output controls
    this.elements.saveResult.addEventListener('click', () => this.saveCurrentResult());
    this.elements.copyResult.addEventListener('click', () => this.copyResult());

    // Notes controls
    this.elements.refreshNotes.addEventListener('click', () => this.loadNotes());
    this.elements.notesFilter.addEventListener('change', () => this.filterNotes());
    this.elements.exportNotes.addEventListener('click', () => this.exportNotes());
    this.elements.clearAllNotes.addEventListener('click', () => this.clearAllNotes());

    // Auto-save input
    this.elements.inputBox.addEventListener('input', this.debounce(() => {
      this.saveInputState();
    }, 1000));
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

  async checkAICapabilities() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkCapabilities' });
      
      if (response.success) {
        const capabilities = response.result;
        const availableCount = Object.values(capabilities).filter(Boolean).length;
        
        if (availableCount > 0) {
          this.elements.aiStatusBanner.className = 'status-message status-success';
          this.elements.aiStatusBanner.textContent = `✅ ${availableCount} AI capabilities available and ready!`;
          
          // Hide banner after 3 seconds
          setTimeout(() => {
            this.elements.aiStatusBanner.style.display = 'none';
          }, 3000);
        } else {
          this.elements.aiStatusBanner.className = 'status-message status-warning';
          this.elements.aiStatusBanner.innerHTML = `
            ⚠️ No AI capabilities detected. 
            <a href="chrome://flags/#optimization-guide-on-device-model" target="_blank" style="color: inherit; text-decoration: underline;">
              Enable Chrome AI flags
            </a> and restart Chrome.
          `;
        }
      } else {
        this.elements.aiStatusBanner.className = 'status-message status-error';
        this.elements.aiStatusBanner.textContent = '❌ Failed to check AI capabilities';
      }
    } catch (error) {
      console.error('AI capability check failed:', error);
      this.elements.aiStatusBanner.className = 'status-message status-error';
      this.elements.aiStatusBanner.textContent = '❌ AI capability check failed';
    }
  }

  setupCharCounter() {
    this.updateCharCount();
  }

  updateCharCount() {
    const count = this.elements.inputBox.value.length;
    this.elements.charCount.textContent = count.toLocaleString();
  }

  clearInput() {
    this.elements.inputBox.value = '';
    this.updateCharCount();
    this.elements.inputBox.focus();
  }

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.elements.inputBox.value = text;
      this.updateCharCount();
      this.elements.inputBox.focus();
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      this.showMessage('❌ Failed to paste. Please use Ctrl+V manually.', 'error');
    }
  }

  async handleAIAction(action) {
    const text = this.elements.inputBox.value.trim();
    
    if (!text) {
      this.showMessage('⚠️ Please enter some text first', 'warning');
      this.elements.inputBox.focus();
      return;
    }

    this.showLoading(`${this.capitalizeFirst(action)}ing your text...`);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: action,
        text: text,
        questionCount: action === 'generateQuiz' ? 5 : undefined,
        options: { 
          format: 'markdown',
          temperature: 0.7
        }
      });

      if (response.success) {
        this.currentResult = {
          type: action,
          originalText: text,
          processedText: response.result,
          timestamp: new Date().toISOString()
        };
        
        this.showResult(response.result);
        this.enableResultActions();
        await this.loadNotes(); // Refresh notes
        await this.loadStats(); // Refresh stats
      } else {
        this.showMessage(`❌ ${this.capitalizeFirst(action)} failed: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
      this.showMessage(`❌ ${this.capitalizeFirst(action)} failed. Please try again.`, 'error');
    }
  }

  async handleTranslate() {
    const targetLang = this.elements.languageSelect.value;
    const text = this.elements.inputBox.value.trim();
    
    if (!text) {
      this.showMessage('⚠️ Please enter some text first', 'warning');
      this.elements.inputBox.focus();
      return;
    }

    this.showLoading(`Translating to ${this.getLanguageName(targetLang)}...`);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        targetLang: targetLang,
        options: { format: 'plain-text' }
      });

      if (response.success) {
        this.currentResult = {
          type: 'translate',
          originalText: text,
          processedText: response.result,
          targetLanguage: targetLang,
          timestamp: new Date().toISOString()
        };
        
        this.showResult(response.result);
        this.enableResultActions();
        await this.loadNotes();
        await this.loadStats();
      } else {
        this.showMessage(`❌ Translation failed: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Translation failed:', error);
      this.showMessage('❌ Translation failed. Please try again.', 'error');
    }
  }

  showLoading(message) {
    this.isLoading = true;
    this.setButtonsDisabled(true);
    this.elements.outputBox.innerHTML = `
      <div class="loading" style="display: flex; align-items: center; gap: 10px; padding: 20px;">
        <div class="spinner"></div>
        <span>${message}</span>
      </div>
    `;
  }

  showResult(result) {
    this.isLoading = false;
    this.setButtonsDisabled(false);
    
    // Format the result for better display
    const formattedResult = this.formatResult(result);
    
    this.elements.outputBox.innerHTML = `
      <div class="result-content" style="line-height: 1.6;">
        ${formattedResult}
      </div>
    `;
    
    // Scroll to result
    this.elements.outputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showMessage(message, type = 'info') {
    this.isLoading = false;
    this.setButtonsDisabled(false);
    
    this.elements.outputBox.innerHTML = `
      <div class="status-message status-${type}" style="margin: 20px 0;">
        ${message}
      </div>
    `;
  }

  formatResult(result) {
    if (!result) return 'No result generated.';
    
    // Convert markdown-like formatting to HTML
    return result
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(184, 134, 11, 0.1); padding: 2px 4px; border-radius: 3px;">$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)/, '<p>$1')
      .replace(/(.*?)$/, '$1</p>');
  }

  setButtonsDisabled(disabled) {
    const buttons = [
      this.elements.summarizeBtn,
      this.elements.explainBtn,
      this.elements.rewriteBtn,
      this.elements.proofreadBtn,
      this.elements.generateQuizBtn,
      this.elements.studyNotesBtn,
      this.elements.translateBtn
    ];
    
    buttons.forEach(btn => {
      btn.disabled = disabled;
      if (disabled) {
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  enableResultActions() {
    this.elements.saveResult.disabled = false;
    this.elements.copyResult.disabled = false;
  }

  async saveCurrentResult() {
    if (!this.currentResult) return;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveNote',
        note: {
          ...this.currentResult,
          url: window.location.href,
          title: document.title
        }
      });

      if (response.success) {
        this.showMessage('✅ Result saved to your notes!', 'success');
        await this.loadNotes();
        await this.loadStats();
        
        // Clear current result to prevent duplicate saves
        this.currentResult = null;
        this.elements.saveResult.disabled = true;
      } else {
        this.showMessage('❌ Failed to save result', 'error');
      }
    } catch (error) {
      console.error('Failed to save result:', error);
      this.showMessage('❌ Failed to save result', 'error');
    }
  }

  async copyResult() {
    const resultContent = this.elements.outputBox.textContent || '';
    
    try {
      await navigator.clipboard.writeText(resultContent);
      this.showMessage('✅ Result copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy result:', error);
      this.showMessage('❌ Failed to copy result', 'error');
    }
  }

  async loadNotes() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getNotes' });
      
      if (response.success) {
        this.notes = response.result;
        this.renderNotes();
      } else {
        console.error('Failed to load notes:', response.error);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  renderNotes() {
    if (!this.notes || this.notes.length === 0) {
      this.elements.notesContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; opacity: 0.7;">
          <p>📝 No notes yet. Start by processing some text above!</p>
        </div>
      `;
      return;
    }

    const notesHTML = this.notes.map(note => `
      <div class="note-card fade-in" data-note-id="${note.id}">
        <div class="note-header">
          <span class="note-type">${this.getTypeIcon(note.type)} ${this.capitalizeFirst(note.type)}</span>
          <div>
            <span class="note-date">${this.formatDate(note.createdAt)}</span>
            <button class="delete-note" data-note-id="${note.id}" style="margin-left: 10px; background: none; border: none; cursor: pointer; opacity: 0.7;" title="Delete note">
              🗑️
            </button>
          </div>
        </div>
        <div class="note-content">
          <div style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px;">
            <strong>Original:</strong> ${this.truncateText(note.originalText, 100)}
          </div>
          <div>
            ${this.formatResult(this.truncateText(note.processedText, 200))}
          </div>
        </div>
        ${note.url ? `<div style="font-size: 0.75rem; opacity: 0.6; margin-top: 8px; border-top: 1px solid rgba(184, 134, 11, 0.2); padding-top: 8px;">From: ${note.title || note.url}</div>` : ''}
      </div>
    `).join('');
    
    this.elements.notesContainer.innerHTML = notesHTML;
    
    // Attach delete handlers
    this.elements.notesContainer.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNote(btn.dataset.noteId);
      });
    });
  }

  async deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'deleteNote',
        noteId: noteId
      });

      if (response.success) {
        await this.loadNotes();
        await this.loadStats();
        this.showMessage('✅ Note deleted', 'success');
      } else {
        this.showMessage('❌ Failed to delete note', 'error');
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      this.showMessage('❌ Failed to delete note', 'error');
    }
  }

  filterNotes() {
    const filterType = this.elements.notesFilter.value;
    
    if (!filterType) {
      this.renderNotes();
      return;
    }
    
    const filteredNotes = this.notes.filter(note => note.type === filterType);
    this.notes = filteredNotes;
    this.renderNotes();
  }

  async loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      
      if (response.success) {
        this.stats = response.result;
        this.renderStats();
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  renderStats() {
    if (this.elements.totalNotes) {
      this.elements.totalNotes.textContent = (this.stats.totalNotes || 0).toLocaleString();
    }
    if (this.elements.totalSessions) {
      this.elements.totalSessions.textContent = (this.stats.totalSessions || 0).toLocaleString();
    }
    if (this.elements.totalProcessed) {
      const words = Math.floor((this.stats.totalProcessedText || 0) / 5); // Estimate words
      this.elements.totalProcessed.textContent = words.toLocaleString();
    }
  }

  async exportNotes() {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'exportData',
        format: 'json' 
      });

      if (response.success) {
        const dataStr = response.result;
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pocket-mentor-notes-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('✅ Notes exported successfully!', 'success');
      } else {
        this.showMessage('❌ Failed to export notes', 'error');
      }
    } catch (error) {
      console.error('Failed to export notes:', error);
      this.showMessage('❌ Failed to export notes', 'error');
    }
  }

  async clearAllNotes() {
    if (!confirm('Are you sure you want to delete ALL notes? This cannot be undone.')) return;
    
    try {
      await chrome.storage.local.set({ notes: [] });
      await this.loadNotes();
      await this.loadStats();
      this.showMessage('✅ All notes cleared', 'success');
    } catch (error) {
      console.error('Failed to clear notes:', error);
      this.showMessage('❌ Failed to clear notes', 'error');
    }
  }

  async saveInputState() {
    try {
      await chrome.storage.local.set({ 
        notebookInputState: this.elements.inputBox.value 
      });
    } catch (error) {
      console.error('Failed to save input state:', error);
    }
  }

  // Utility Methods
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
      saved: '💾'
    };
    return icons[type] || '📄';
  }

  getLanguageName(code) {
    const languages = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
      ja: 'Japanese',
      hi: 'Hindi',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ar: 'Arabic'
    };
    return languages[code] || code.toUpperCase();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  }

  capitalizeFirst(str) {
    if (!str) return '';
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

// Initialize notebook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PocketMentorNotebook();
});

// Add additional styles for the notebook
const style = document.createElement('style');
style.textContent = `
  .stat-card {
    background: white;
    border: 2px solid var(--border-light);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .dark-theme .stat-card {
    background: #2a2a2a;
    border-color: var(--border-dark);
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-gold);
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .delete-note:hover {
    opacity: 1 !important;
    transform: scale(1.1);
  }
`;
document.head.appendChild(style);