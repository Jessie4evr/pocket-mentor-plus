/* ===== Pocket Mentor+ 🎓✨ Notebook Application ===== */

import pocketMentorAPI from './api.js';
import geminiConfig from './gemini-config.js';
import themeManager from './theme-manager.js';

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
    await this.loadApiKey();
    this.setupCharCounter();
    this.setupThemes();
    
    // Initialize quick AI session for faster responses
    this.initializeQuickAI();
  }

  async initializeQuickAI() {
    // Pre-load AI session for faster response times
    try {
      if (typeof pocketMentorAPI !== 'undefined' && pocketMentorAPI.initializeQuickSession) {
        await pocketMentorAPI.initializeQuickSession();
        console.log('✅ Quick AI session initialized');
      }
    } catch (error) {
      console.warn('Quick AI initialization failed:', error);
    }
  }

  bindElements() {
    this.elements = {
      // Theme and controls
      themeToggle: document.getElementById('themeToggle'),
      themesBtn: document.getElementById('themesBtn'),
      themesPanel: document.getElementById('themesPanel'),
      themeGrid: document.getElementById('themeGrid'),
      closeThemesPanel: document.getElementById('closeThemesPanel'),
      videoSummaryBtn: document.getElementById('videoSummaryBtn'),
      checkCapabilities: document.getElementById('checkCapabilities'),
      quickNotes: document.getElementById('quickNotes'),
      aiStatusBanner: document.getElementById('aiStatusBanner'),
      
      // API Configuration
      apiConfigPanel: document.getElementById('apiConfigPanel'),
      geminiApiKey: document.getElementById('geminiApiKey'),
      saveApiKey: document.getElementById('saveApiKey'),
      
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
    // Theme controls
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.elements.themesBtn.addEventListener('click', () => this.toggleThemesPanel());
    this.elements.closeThemesPanel.addEventListener('click', () => this.closeThemesPanel());
    this.elements.videoSummaryBtn.addEventListener('click', () => this.analyzeVideo());
    this.elements.checkCapabilities.addEventListener('click', () => this.checkCapabilities());
    this.elements.quickNotes.addEventListener('click', () => this.showQuickNotes());

    // API Configuration
    this.elements.saveApiKey.addEventListener('click', () => this.saveApiKey());
    this.elements.geminiApiKey.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveApiKey();
      }
    });

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
          let statusText = `✅ Chrome Built-in AI ready! Available: `;
          const availableAPIs = [];
          
          if (capabilities.summarizer) availableAPIs.push('Summarizer');
          if (capabilities.writer) availableAPIs.push('Writer');
          if (capabilities.rewriter) availableAPIs.push('Rewriter');
          if (capabilities.translator) availableAPIs.push('Translator');
          if (capabilities.languageDetector) availableAPIs.push('Language Detector');
          if (capabilities.promptAPI) availableAPIs.push('Prompt API (Gemini Nano)');
          
          statusText += availableAPIs.join(', ');
          this.elements.aiStatusBanner.textContent = statusText;
          
          // Hide banner after 5 seconds
          setTimeout(() => {
            this.elements.aiStatusBanner.style.display = 'none';
          }, 5000);
        } else {
          this.elements.aiStatusBanner.className = 'status-message status-warning';
          this.elements.aiStatusBanner.innerHTML = `
            ⚠️ Chrome Built-in AI not available. Enable at chrome://flags/#optimization-guide-on-device-model and chrome://flags/#prompt-api-for-gemini-nano
            <button onclick="this.parentElement.style.display='none'" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 10px;">×</button>
          `;
          
          // Show API configuration panel
          this.elements.apiConfigPanel.style.display = 'block';
        }
      } else {
        this.elements.aiStatusBanner.className = 'status-message status-error';
        this.elements.aiStatusBanner.textContent = '❌ Failed to check AI capabilities';
        this.elements.apiConfigPanel.style.display = 'block';
      }
    } catch (error) {
      console.error('AI capability check failed:', error);
      this.elements.aiStatusBanner.className = 'status-message status-error';
      this.elements.aiStatusBanner.textContent = '❌ AI capability check failed';
      this.elements.apiConfigPanel.style.display = 'block';
    }
  }

  async saveApiKey() {
    const apiKey = this.elements.geminiApiKey.value.trim();
    
    if (!apiKey) {
      this.showMessage('⚠️ Please enter a valid API key', 'warning');
      return;
    }

    try {
      // Save to local storage
      await chrome.storage.local.set({ geminiApiKey: apiKey });
      
      // Configure the API
      await geminiConfig.setApiKey(apiKey);
      await pocketMentorAPI.setGeminiApiKey(apiKey);
      
      this.showMessage('✅ API key saved successfully!', 'success');
      
      // Hide the configuration panel
      this.elements.apiConfigPanel.style.display = 'none';
      
      // Update status banner
      this.elements.aiStatusBanner.className = 'status-message status-success';
      this.elements.aiStatusBanner.innerHTML = `
        ✅ Gemini API configured and ready! 
        <button onclick="document.getElementById('apiConfigPanel').style.display='block'" 
                style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 10px; text-decoration: underline;">
          Change Key
        </button>
      `;
      
    } catch (error) {
      console.error('Failed to save API key:', error);
      this.showMessage('❌ Failed to save API key', 'error');
    }
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.local.get('geminiApiKey');
      if (result.geminiApiKey) {
        this.elements.geminiApiKey.value = '••••••••••••••••'; // Masked display
        await geminiConfig.setApiKey(result.geminiApiKey);
        await pocketMentorAPI.setGeminiApiKey(result.geminiApiKey);
        console.log('🔑 Stored API key loaded');
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  }

  setupThemes() {
    const themes = themeManager.getAvailableThemes();
    const currentTheme = themeManager.getCurrentTheme();
    
    this.elements.themeGrid.innerHTML = '';
    
    themes.forEach(theme => {
      const themePreview = themeManager.createThemePreview(theme.key);
      
      if (theme.key === currentTheme) {
        themePreview.classList.add('active');
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
    this.closeThemesPanel();
    this.showMessage(`✅ ${themeManager.themes[themeName].name} theme applied!`, 'success');
  }

  toggleThemesPanel() {
    const isVisible = this.elements.themesPanel.style.display !== 'none';
    
    if (isVisible) {
      this.elements.themesPanel.style.display = 'none';
    } else {
      this.elements.themesPanel.style.display = 'block';
      this.setupThemes(); // Refresh when opening
    }
  }

  closeThemesPanel() {
    this.elements.themesPanel.style.display = 'none';
  }

  async analyzeVideo() {
    this.showLoading('🎥 Looking for videos to analyze...');
    
    try {
      // First try to get current tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!activeTab) {
        throw new Error('No active tab found');
      }

      // Check if we're on a video site
      const videoSites = ['youtube.com', 'vimeo.com', 'dailymotion.com'];
      const isVideoSite = videoSites.some(site => activeTab.url.includes(site));
      
      if (!isVideoSite) {
        this.showMessage('⚠️ Please navigate to a video page (YouTube, Vimeo, etc.) first', 'warning');
        return;
      }

      // Try to send message to content script
      try {
        const response = await chrome.tabs.sendMessage(activeTab.id, {
          action: 'analyzeVideo',
          options: { source: 'notebook' }
        });

        if (response && response.success) {
          this.showResult(response.result);
          return;
        }
      } catch (contentScriptError) {
        console.warn('Content script not available, using fallback:', contentScriptError);
      }

      // Fallback: generate mock video summary based on page info
      const videoTitle = activeTab.title || 'Video Content';
      const mockVideoText = `Video Analysis: ${videoTitle}

URL: ${activeTab.url}
Analyzed: ${new Date().toLocaleDateString()}

This video contains educational content that can be analyzed for key concepts, main topics, and learning objectives. The content provides valuable information for study and learning purposes.`;
      
      const response = await chrome.runtime.sendMessage({
        action: 'generateStudyNotes', 
        text: mockVideoText,
        options: { context: 'video-analysis' }
      });

      if (response && response.success) {
        this.showResult(`🎥 **Video Summary: ${videoTitle}**\n\n${response.result}\n\n*Analysis based on page information - Content script integration would provide more detailed video analysis*`);
      } else {
        // Final fallback with simple video summary
        this.showResult(`🎥 **Video Analysis: ${videoTitle}**

**📋 Video Information:**
• Title: ${videoTitle}
• URL: ${activeTab.url}
• Analyzed: ${new Date().toLocaleDateString()}

**💡 Analysis Summary:**
This video appears to contain educational content that can be valuable for learning. Based on the page context, the video likely covers important topics and concepts related to the subject matter.

**🎯 Study Recommendations:**
• Watch the video actively and take notes
• Pause frequently to process information
• Review key concepts multiple times
• Apply learned concepts to practice scenarios

*Basic video analysis - Configure content script permissions for detailed analysis*`);
      }
    } catch (error) {
      console.error('Video analysis failed:', error);
      this.showMessage('❌ Video analysis failed. Please ensure you\'re on a video page and try again.', 'error');
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

  async showQuickNotes() {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getNotes', 
        filter: { limit: 5 } 
      });

      if (response.success && response.result.length > 0) {
        const notesHtml = response.result.map(note => `
          <div class="quick-note-item" style="
            background: rgba(184, 134, 11, 0.1); 
            border: 1px solid rgba(184, 134, 11, 0.3); 
            border-radius: 8px; 
            padding: 12px; 
            margin-bottom: 8px;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 16px;">${this.getTypeIcon(note.type)}</span>
              <span style="font-weight: 600; color: var(--primary-gold);">${this.capitalizeFirst(note.type)}</span>
              <span style="margin-left: auto; font-size: 0.8rem; opacity: 0.7;">${this.formatDate(note.createdAt)}</span>
            </div>
            <div style="font-size: 0.9rem; line-height: 1.4;">
              ${this.truncateText(note.processedText || note.originalText, 120)}
            </div>
          </div>
        `).join('');
        
        this.showResult(`<div style="max-width: 100%;">${notesHtml}</div>`);
      } else {
        this.showMessage('📝 No notes yet. Start by processing some text!', 'info');
      }
    } catch (error) {
      console.error('Failed to load quick notes:', error);
      this.showMessage('❌ Failed to load notes', 'error');
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
      let questionCount = 5; // default
      
      // Ask for question count if generating quiz
      if (action === 'generateQuiz') {
        const userChoice = prompt('How many questions would you like? Enter 10 or 25 (default: 10)', '10');
        questionCount = parseInt(userChoice) || 10;
        if (questionCount !== 10 && questionCount !== 25) {
          questionCount = 10; // default to 10 if invalid input
        }
      }
      
      const response = await chrome.runtime.sendMessage({
        action: action,
        text: text,
        questionCount: questionCount,
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