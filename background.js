/* ===== Pocket Mentor+ 🎓✨ Background Service Worker =====
   Handles context menus, AI processing, and inter-component communication
============================================================= */

// Import without using dynamic imports (service worker compatible)
importScripts('./gemini-config.js');
importScripts('./api.js');

// Global state
let isInitialized = false;

// --- Initialize Extension ---
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🎓 Pocket Mentor+ installed');
  
  await createContextMenus();
  await initializeStorage();
  
  isInitialized = true;
  
  // Check AI capabilities
  try {
    const capabilities = pocketMentorAPI.getCapabilities();
    console.log('✅ AI Capabilities:', capabilities);
  } catch (error) {
    console.warn('⚠️ AI capabilities check failed:', error);
  }
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
        result = await pocketMentorAPI.summarizeText(text);
        break;
      case "explain":
        result = await pocketMentorAPI.explainText(text);
        break;
      case "simplify":
        result = await pocketMentorAPI.rewriteText(text, 'casual');
        break;
      case "translate":
        const prefs = await chrome.storage.local.get('preferences');
        const targetLang = prefs.preferences?.defaultLanguage || 'es';
        result = await pocketMentorAPI.translateText(text, targetLang);
        break;
      case "quiz":
        result = await pocketMentorAPI.generateQuiz(text, 3);
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
          result = await pocketMentorAPI.summarizeText(request.text, request.options);
          break;
        case 'translate':
          result = await pocketMentorAPI.translateText(request.text, request.targetLang, request.options);
          break;
        case 'proofread':
          result = await pocketMentorAPI.proofreadText(request.text, request.options);
          break;
        case 'rewrite':
          result = await pocketMentorAPI.rewriteText(request.text, request.style, request.options);
          break;
        case 'explain':
          result = await pocketMentorAPI.explainText(request.text, request.options);
          break;
        case 'generateQuiz':
          result = await pocketMentorAPI.generateQuiz(request.text, request.questionCount, request.options);
          break;
        case 'generateStudyNotes':
          result = await pocketMentorAPI.generateStudyNotes(request.text, request.options);
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
          result = pocketMentorAPI.getCapabilities();
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