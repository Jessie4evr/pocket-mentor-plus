/* ===== Pocket Mentor+ 🎓✨ Background Script =====
   Handles context menus + AI API calls (Summarize, Simplify, Quiz)
=================================================== */

// Create context menu items on install
chrome.runtime.onInstalled.addListener(() => {
  const menuItems = [
    { id: "summarize", title: "Summarize with Pocket Mentor+" },
    { id: "simplify", title: "Simplify with Pocket Mentor+" },
    { id: "quiz", title: "Quiz Me with Pocket Mentor+" }
  ];

  menuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ["selection"]
    });
  });

  console.log("✅ Context menus created for Pocket Mentor+");
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (!info.menuItemId || !info.selectionText) return;

  let result;

  try {
    if (info.menuItemId === "summarize") {
      result = await summarizeText(info.selectionText);
    } else if (info.menuItemId === "simplify") {
      result = await simplifyText(info.selectionText);
    } else if (info.menuItemId === "quiz") {
      result = await generateQuiz(info.selectionText);
    }

    if (result) {
      // Save note to storage
      chrome.storage.local.get({ notes: [] }, (data) => {
        const notes = data.notes;
        notes.push({
          type: info.menuItemId,
          content: result,
          timestamp: new Date().toISOString()
        });
        chrome.storage.local.set({ notes }, () => {
          console.log(`📝 Saved ${info.menuItemId} result to notebook.`);
        });
      });
    }
  } catch (error) {
    console.error("⚠️ Error handling context menu action:", error);
  }
});

/* ===== AI API Functions ===== */

// Summarizer API
async function summarizeText(text) {
  const response = await chrome.ai.summarizer.summarize({ text });
  return response.summary || "No summary generated.";
}

// Rewriter API
async function simplifyText(text) {
  const response = await chrome.ai.rewriter.rewrite({
    text,
    style: "simple"
  });
  return response.output || "No simplified version generated.";
}

// Prompt API (Quiz Generator)
async function generateQuiz(text) {
  const response = await chrome.ai.prompt.generate({
    input: `Create 2 multiple-choice questions with correct answers based on this text:\n${text}`
  });
  return response.output || "No quiz generated.";
}

}
