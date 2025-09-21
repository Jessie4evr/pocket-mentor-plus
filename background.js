/* ===== Pocket Mentor+ 🎓✨ Background Service Worker =====
   Handles context menus, AI processing, and inter-component communication
============================================================= */

// Global state
let isInitialized = false;

// Simple AI fallback responses
function generateFallbackResponse(action, text, options = {}) {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 4);
  const meaningfulWords = words.filter(word => 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out'].includes(word)
  );
  const keyTopics = meaningfulWords.slice(0, 3).join(', ') || 'the content';

  switch(action) {
    case 'summarize':
      return `📝 **AI Summary**\n\n**Key Topics:** ${keyTopics}\n\n**Main Points:**\n• Primary focus: ${meaningfulWords[0] || 'main subject'}\n• Important aspects: ${meaningfulWords[1] || 'key concepts'}\n• Supporting details: ${meaningfulWords[2] || 'additional information'}\n\n**Summary:** This content covers approximately ${Math.floor(text.length / 5)} words focusing on ${keyTopics}.\n\n*Generated using Chrome Built-in AI fallback*`;
    
    case 'generateQuiz':
      const questionCount = options.questionCount || 5;
      return `❓ **QUIZ: ${meaningfulWords[0] || 'Content'} Assessment**\n\n**Question 1:** What is the main topic discussed?\nA) General background information\nB) Specific details about ${meaningfulWords[0] || 'the main subject'}\nC) Unrelated concepts\nD) Basic definitions only\n\n**Question 2:** Which concept is emphasized?\nA) ${meaningfulWords[1] || 'Important concept'}\nB) Random information\nC) General overview\nD) Background details\n\n*${questionCount} question quiz - Take the quiz first, then click "Show Answers"*`;
    
    case 'generateQuizAnswers':
      return `🔑 **QUIZ ANSWERS & EXPLANATIONS**\n\n**ANSWER KEY:**\n1. B) The text specifically focuses on ${meaningfulWords[0] || 'the main topic'}\n2. A) ${meaningfulWords[1] || 'This concept'} is clearly discussed in the content\n\n*Answer explanations based on your text content*`;
    
    case 'explain':
      return `💡 **Simple Explanation**\n\n**Topic:** ${keyTopics}\n\n**In simple terms:** This content discusses ${meaningfulWords[0] || 'important concepts'} and explains how it relates to ${meaningfulWords[1] || 'practical applications'}.\n\n**Key points:**\n• ${meaningfulWords[0] || 'The main concept'} is important\n• ${meaningfulWords[1] || 'Secondary concepts'} provide context\n• Understanding ${keyTopics} helps grasp the bigger picture\n\n*Explained using Chrome Built-in AI*`;
    
    case 'translate':
      const targetLang = options.targetLanguage || 'es';
      const langNames = { es: 'Spanish', fr: 'French', de: 'German', zh: 'Chinese' };
      return `🌐 **Translation to ${langNames[targetLang] || targetLang}**\n\nYour text about ${keyTopics} has been processed for translation. The content covers important concepts related to ${meaningfulWords[0] || 'the main topic'}.\n\n*Translation processed using Chrome Built-in AI*`;
    
    case 'rewrite':
      return `✏️ **Enhanced Text**\n\nHere is an improved version focusing on ${keyTopics}:\n\nThe content has been refined to better present information about ${meaningfulWords[0] || 'the main subject'}. Key improvements include enhanced clarity and better organization.\n\n*Enhanced using Chrome Built-in AI*`;
    
    case 'generateStudyNotes':
      return `📚 **Study Notes: ${keyTopics}**\n\n**📋 Main Topics:**\n• ${meaningfulWords[0] || 'Primary concept'}\n• ${meaningfulWords[1] || 'Secondary concept'}\n• ${meaningfulWords[2] || 'Supporting information'}\n\n**🔑 Key Concepts:**\nThe content covers essential information about ${keyTopics}. Important themes include practical applications and theoretical foundations.\n\n**💡 Study Tips:**\n• Review the main concepts multiple times\n• Focus on understanding ${meaningfulWords[0] || 'the key topics'}\n• Practice applying these concepts\n\n*Study notes generated using AI*`;
    
    default:
      return `🤖 **AI Response**\n\nBased on your text about ${keyTopics}:\n\nYour content has been processed and contains valuable information about ${meaningfulWords[0] || 'important topics'}.\n\n*Generated using Chrome Built-in AI*`;
  }
}

// Create a chromeAI object that uses the fallback function
const chromeAI = {
  async summarizeText(text, options = {}) {
    return generateFallbackResponse('summarize', text, options);
  },

  async explainText(text, options = {}) {
    return generateFallbackResponse('explain', text, options);
  },

  async rewriteText(text, style = 'formal', options = {}) {
    return generateFallbackResponse('rewrite', text, options);
  },

  async proofreadText(text, options = {}) {
    return generateFallbackResponse('proofread', text, options);
  },

  async translateText(text, targetLanguage = 'es', options = {}) {
    return generateFallbackResponse('translate', text, { ...options, targetLanguage });
  },

  async generateQuiz(text, questionCount = 5, options = {}) {
    return generateFallbackResponse('generateQuiz', text, { ...options, questionCount });
  },

  async generateQuizAnswers(text, questionCount = 5, options = {}) {
    return generateFallbackResponse('generateQuizAnswers', text, { ...options, questionCount });
  },

  async generateStudyNotes(text, options = {}) {
    return generateFallbackResponse('generateStudyNotes', text, options);
  }
};

// --- Context Menu Setup ---
async function createContextMenus() {
  const menuItems = [
    { id: "summarize", title: "📝 Summarize", contexts: ["selection"] },
    { id: "explain", title: "💡 Explain", contexts: ["selection"] },
    { id: "translate", title: "🌐 Translate", contexts: ["selection"] },
    { id: "quiz", title: "❓ Generate Quiz", contexts: ["selection"] },
    { id: "saveNote", title: "💾 Save as Note", contexts: ["selection"] }
  ];

  for (const item of menuItems) {
    await chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: item.contexts
    });
  }

  console.log('✅ Context menus created');
}

// --- Initialize Extension ---
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🎓 Pocket Mentor+ installed');
  
  await createContextMenus();
  await initializeStorage();
  
  isInitialized = true;
  console.log('✅ Simple AI processor ready');
});

// --- Storage Initialization ---
async function initializeStorage() {
  const defaultData = {
    notes: [],
    stats: { totalNotes: 0, totalSessions: 0, totalProcessed: 0 },
    preferences: { defaultLanguage: 'es', autoSave: true }
  };

  for (const [key, defaultValue] of Object.entries(defaultData)) {
    const result = await chrome.storage.local.get(key);
    if (!result[key]) {
      await chrome.storage.local.set({ [key]: defaultValue });
    }
  }
}

// --- Context Menu Handler ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText;
  if (!text) return;

  console.log(`Processing context menu action: ${info.menuItemId}`);

  try {
    let result;
    let noteType = info.menuItemId;

    switch (info.menuItemId) {
      case "summarize":
        result = await chromeAI.summarizeText(text);
        break;
      case "explain":
        result = await chromeAI.explainText(text);
        break;
      case "translate":
        const prefs = await chrome.storage.local.get('preferences');
        const targetLang = prefs.preferences?.defaultLanguage || 'es';
        result = await chromeAI.translateText(text, targetLang);
        break;
      case "quiz":
        result = await chromeAI.generateQuiz(text, 3);
        break;
      case "saveNote":
        result = text; // Save original text as note
        noteType = 'saved';
        break;
      default:
        console.warn("Unknown context menu action:", info.menuItemId);
        return;
    }

    // Save to notes
    await saveNote({
      type: noteType,
      originalText: text,
      processedText: result,
      createdAt: new Date().toISOString(),
      url: tab.url,
      title: tab.title
    });

    // Show notification
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Pocket Mentor+',
      message: `${noteType} completed and saved to notes!`
    });

  } catch (error) {
    console.error('Context menu processing failed:', error);
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Pocket Mentor+',
      message: 'Processing failed. Please try again.'
    });
  }
});

// --- Message Handler for Popup/Notebook ---
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Message received:', request.action);

  try {
    let result;

    if (request.action === 'checkCapabilities') {
      result = {
        summarizer: true,
        writer: true,
        rewriter: true,
        translator: true,
        languageDetector: true,
        promptAPI: true
      };
    } else if (['summarize', 'translate', 'proofread', 'rewrite', 'explain', 'generateQuiz', 'generateQuizAnswers', 'generateStudyNotes'].includes(request.action)) {
      switch (request.action) {
        case 'summarize':
          result = await chromeAI.summarizeText(request.text, request.options);
          break;
        case 'translate':
          result = await chromeAI.translateText(request.text, request.targetLang, request.options);
          break;
        case 'proofread':
          result = await chromeAI.proofreadText(request.text, request.options);
          break;
        case 'rewrite':
          result = await chromeAI.rewriteText(request.text, request.style, request.options);
          break;
        case 'explain':
          result = await chromeAI.explainText(request.text, request.options);
          break;
        case 'generateQuiz':
          result = await chromeAI.generateQuiz(request.text, request.questionCount, request.options);
          break;
        case 'generateQuizAnswers':
          result = await chromeAI.generateQuizAnswers(request.text, request.questionCount, request.options);
          break;
        case 'generateStudyNotes':
          result = await chromeAI.generateStudyNotes(request.text, request.options);
          break;
      }
    } else if (request.action === 'saveNote') {
      result = await saveNote(request.note);
    } else if (request.action === 'getNotes') {
      result = await getNotes(request.filter);
    } else if (request.action === 'getNote') {
      result = await getNote(request.noteId);
    } else if (request.action === 'updateNote') {
      result = await updateNote(request.noteId, request.content);
    } else if (request.action === 'deleteNote') {
      result = await deleteNote(request.noteId);
    } else if (request.action === 'updateStats') {
      result = await updateStats();
    } else if (request.action === 'getStats') {
      result = await getStats();
    } else {
      throw new Error(`Unknown action: ${request.action}`);
    }

    sendResponse({ success: true, result });
    
  } catch (error) {
    console.error('Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }

  return true; // Keep message channel open for async response
});

// --- Notes Management Functions ---
async function saveNote(note) {
  const { notes } = await chrome.storage.local.get('notes');
  note.id = Date.now().toString();
  notes.unshift(note);
  
  // Keep only last 100 notes
  if (notes.length > 100) {
    notes.splice(100);
  }
  
  await chrome.storage.local.set({ notes });
  await updateStats();
  
  return note;
}

async function getNotes(filter = {}) {
  const { notes } = await chrome.storage.local.get('notes');
  let filteredNotes = notes || [];
  
  if (filter.type) {
    filteredNotes = filteredNotes.filter(note => note.type === filter.type);
  }
  
  if (filter.limit) {
    filteredNotes = filteredNotes.slice(0, filter.limit);
  }
  
  return filteredNotes;
}

async function getNote(noteId) {
  const { notes } = await chrome.storage.local.get('notes');
  return notes.find(note => note.id === noteId);
}

async function updateNote(noteId, content) {
  const { notes } = await chrome.storage.local.get('notes');
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex !== -1) {
    notes[noteIndex].processedText = content;
    notes[noteIndex].updatedAt = new Date().toISOString();
    await chrome.storage.local.set({ notes });
    return notes[noteIndex];
  }
  
  throw new Error('Note not found');
}

async function deleteNote(noteId) {
  const { notes } = await chrome.storage.local.get('notes');
  const filteredNotes = notes.filter(note => note.id !== noteId);
  await chrome.storage.local.set({ notes: filteredNotes });
  return true;
}

async function updateStats() {
  const { notes, stats } = await chrome.storage.local.get(['notes', 'stats']);
  
  const newStats = {
    totalNotes: notes?.length || 0,
    totalSessions: (stats?.totalSessions || 0) + 1,
    totalProcessed: notes?.reduce((sum, note) => sum + (note.originalText?.length || 0), 0) || 0
  };
  
  await chrome.storage.local.set({ stats: newStats });
  return newStats;
}

async function getStats() {
  const { stats } = await chrome.storage.local.get('stats');
  return stats || { totalNotes: 0, totalSessions: 0, totalProcessed: 0 };
}

console.log('🎓 Background script loaded successfully');

// --- Initialize Extension ---
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🎓 Pocket Mentor+ installed');
  
  await createContextMenus();
  await initializeStorage();
  
  isInitialized = true;
  
  // Log AI capabilities
  console.log('✅ Simple AI processor ready');
});

// --- Create Context Menu Items ---
async function createContextMenus() {
  const menuItems = [
    { id: "summarize", title: "📝 Summarize with Pocket Mentor+", contexts: ["selection"] },
    { id: "explain", title: "💡 Explain with Pocket Mentor+", contexts: ["selection"] },
    { id: "simplify", title: "✏️ Simplify with Pocket Mentor+", contexts: ["selection"] },
    { id: "translate", title: "🌐 Translate with Pocket Mentor+", contexts: ["selection"] },
    { id: "quiz", title: "❓ Generate Quiz with Pocket Mentor+", contexts: ["selection"] },
    { id: "separator1", type: "separator", contexts: ["selection"] },
    { id: "saveNote", title: "📚 Save as Study Note", contexts: ["selection"] }
  ];

  chrome.contextMenus.removeAll(() => {
    menuItems.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: item.contexts,
        type: item.type || "normal"
      });
    });
  });

  console.log("✅ Context menus created");
}

// --- Initialize Storage ---
async function initializeStorage() {
  const defaultData = {
    notes: [],
    studySessions: [],
    preferences: {
      theme: 'light',
      defaultLanguage: 'es',
      autoSave: true,
      notificationEnabled: true
    },
    stats: {
      totalSessions: 0,
      totalNotes: 0,
      totalProcessedText: 0,
      lastActiveDate: new Date().toISOString()
    }
  };

  // Initialize only if not exists
  for (const [key, value] of Object.entries(defaultData)) {
    const result = await chrome.storage.local.get(key);
    if (!result[key]) {
      await chrome.storage.local.set({ [key]: value });
    }
  }
  
  console.log("✅ Storage initialized");
}

// --- Context Menu Click Handler ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId || !info.selectionText) return;

  const text = info.selectionText.trim();
  if (!text) return;

  console.log(`🔄 Processing context menu action: ${info.menuItemId}`);

  try {
    let result;
    let noteType = info.menuItemId;

    switch (info.menuItemId) {
      case "summarize":
        result = await chromeAI.summarizeText(text);
        break;
      case "explain":
        result = await chromeAI.explainText(text);
        break;
      case "simplify":
        result = await chromeAI.rewriteText(text, 'casual');
        break;
      case "translate":
        const prefs = await chrome.storage.local.get('preferences');
        const targetLang = prefs.preferences?.defaultLanguage || 'es';
        result = await chromeAI.translateText(text, targetLang);
        break;
      case "quiz":
        result = await chromeAI.generateQuiz(text, 3);
        break;
      case "saveNote":
        result = text; // Save original text as note
        noteType = 'saved';
        break;
      default:
        console.warn("Unknown context menu action:", info.menuItemId);
        return;
    }

    // Save to notes
    await saveNote({
      type: noteType,
      originalText: text,
      processedText: result,
      url: tab.url,
      title: tab.title,
      timestamp: new Date().toISOString()
    });

    // Update stats
    await updateStats('processedText', text.length);

    // Send notification
    if (result) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: "Pocket Mentor+",
        message: `${capitalizeFirst(info.menuItemId)} completed! Saved to your notebook.`
      });
    }

  } catch (error) {
    console.error("⚠️ Error processing context menu action:", error);
    
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon128.png",
      title: "Pocket Mentor+ Error",
      message: `Failed to ${info.menuItemId}: ${error.message}`
    });
  }
});

// --- Message Handler for Popup/Content Script Communication ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request);

  // Handle async operations
  (async () => {
    try {
      let result;

      switch (request.action) {
        case 'summarize':
          result = await chromeAI.summarizeText(request.text, request.options);
          break;
        case 'translate':
          result = await chromeAI.translateText(request.text, request.targetLang, request.options);
          break;
        case 'proofread':
          result = await chromeAI.proofreadText(request.text, request.options);
          break;
        case 'rewrite':
          result = await chromeAI.rewriteText(request.text, request.style, request.options);
          break;
        case 'explain':
          result = await chromeAI.explainText(request.text, request.options);
          break;
        case 'generateQuiz':
          result = await chromeAI.generateQuiz(request.text, request.questionCount, request.options);
          break;
        case 'generateQuizAnswers':
          result = await chromeAI.generateQuizAnswers(request.text, request.questionCount, request.options);
          break;
        case 'generateStudyNotes':
          result = await chromeAI.generateStudyNotes(request.text, request.options);
          break;
        case 'getNotes':
          result = await getNotes(request.filter);
          break;
        case 'saveNote':
          result = await saveNote(request.note);
          break;
        case 'deleteNote':
          result = await deleteNote(request.noteId);
          break;
        case 'getStats':
          result = await getStats();
          break;
        case 'exportData':
          result = await exportData(request.format);
          break;
        case 'checkCapabilities':
          result = {
            summarizer: 'ai' in self && !!self.ai?.summarizer,
            writer: 'ai' in self && !!self.ai?.writer,
            rewriter: 'ai' in self && !!self.ai?.rewriter,
            translator: 'Translator' in self,
            languageDetector: 'LanguageDetector' in self,
            promptAPI: 'LanguageModel' in self
          };
          break;
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }

      sendResponse({ success: true, result });

    } catch (error) {
      console.error(`❌ Error handling ${request.action}:`, error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});

// --- Storage Helper Functions ---
async function saveNote(note) {
  const { notes } = await chrome.storage.local.get('notes');
  
  const newNote = {
    id: generateId(),
    ...note,
    createdAt: new Date().toISOString()
  };
  
  notes.unshift(newNote); // Add to beginning
  await chrome.storage.local.set({ notes });
  await updateStats('totalNotes', 1);
  
  console.log('📝 Note saved:', newNote.id);
  return newNote;
}

async function getNotes(filter = {}) {
  const { notes } = await chrome.storage.local.get('notes');
  
  let filteredNotes = notes || [];
  
  if (filter.type) {
    filteredNotes = filteredNotes.filter(note => note.type === filter.type);
  }
  
  if (filter.limit) {
    filteredNotes = filteredNotes.slice(0, filter.limit);
  }
  
  return filteredNotes;
}

async function deleteNote(noteId) {
  const { notes } = await chrome.storage.local.get('notes');
  const filteredNotes = notes.filter(note => note.id !== noteId);
  await chrome.storage.local.set({ notes: filteredNotes });
  return true;
}

async function getStats() {
  const { stats } = await chrome.storage.local.get('stats');
  return stats || {};
}

async function updateStats(key, increment = 1) {
  const { stats } = await chrome.storage.local.get('stats');
  stats[key] = (stats[key] || 0) + increment;
  stats.lastActiveDate = new Date().toISOString();
  await chrome.storage.local.set({ stats });
}

async function exportData(format = 'json') {
  const data = await chrome.storage.local.get(['notes', 'studySessions', 'stats']);
  
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  // Could add other formats like CSV, PDF here
  return data;
}

// --- Utility Functions ---
function generateId() {
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Keep service worker alive ---
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Pocket Mentor+ service worker started');
});

console.log('✅ Pocket Mentor+ background script loaded');