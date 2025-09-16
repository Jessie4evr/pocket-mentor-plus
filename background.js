/* ===== Pocket Mentor+ 🎓✨ Background Script =====
   Handles context menus + AI API calls (Summarize, Simplify, Quiz)
=================================================== */

// --- Create context menu items on install ---
chrome.runtime.onInstalled.addListener(() => {
  const menuItems = [
    { id: "summarize", title: "📝 Summarize with Pocket Mentor+" },
    { id: "simplify", title: "✏️ Simplify with Pocket Mentor+" },
    { id: "quiz", title: "❓ Quiz Me with Pocket Mentor+" }
  ];

  chrome.contextMenus.removeAll(() => {
    menuItems.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ["selection"]
      });
    });
  });

  console.log("✅ Pocket Mentor+ context menus created");
});

// --- Listen for context menu clicks ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId || !info.selectionText) return;

  const text = info.selectionText.trim();
  if (!text) return;

  try {
    let result;

    switch (info.menuItemId) {
      case "summarize":
        result = await summarizeText(text);
        break;
      case "simplify":
        result = await simplifyText(text);
        break;
      case "quiz":
        result = await generateQuiz(text);
        break;
      default:
        console.warn("Unknown context menu action:", info.menuItemId);
        return;
    }

    // Save result to local storage
    chrome.storage.local.get({ notes: [] }, (data) => {
      const notes = data.notes;
      notes.push({
        type: info.menuItemId,
        content: result,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ notes }, () => {
        console.log(`📝 Saved ${info.menuItemId} result to Pocket Mentor+ notebook`);
      });
    });

    // Optionally: notify user
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Pocket Mentor+",
      message: `${info.menuItemId.charAt(0).toUpperCase() + info.menuItemId.slice(1)} completed!`
    });

  } catch (error) {
    console.error("⚠️ Error processing context menu action:", error);
  }
});

/* ===== AI API Functions ===== */

// Summarizer API
async function summarizeText(text) {
  try {
    const response = await chrome.ai.summarizer.summarize({ text });
    return response.summary || "No summary generated.";
  } catch (err) {
    console.error("Summarizer error:", err);
    return "⚠️ Failed to summarize text.";
  }
}

// Simplifier / Rewriter API
async function simplifyText(text) {
  try {
    const response = await chrome.ai.rewriter.rewrite({ text, style: "simple" });
    return response.output || "No simplified version generated.";
  } catch (err) {
    console.error("Simplifier error:", err);
    return "⚠️ Failed to simplify text.";
  }
}

// Quiz Generator API
async function generateQuiz(text) {
  try {
    const response = await chrome.ai.prompt.generate({
      input: `Create 2 multiple-choice questions with correct answers based on this text:\n${text}`
    });
    return response.output || "No quiz generated.";
  } catch (err) {
    console.error("Quiz generator error:", err);
    return "⚠️ Failed to generate quiz.";
  }
}

