// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize with Pocket Mentor+",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "simplify",
    title: "Simplify with Pocket Mentor+",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "quiz",
    title: "Quiz Me with Pocket Mentor+",
    contexts: ["selection"]
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId && info.selectionText) {
    let result;

    if (info.menuItemId === "summarize") {
      result = await summarizeText(info.selectionText);
    } else if (info.menuItemId === "simplify") {
      result = await simplifyText(info.selectionText);
    } else if (info.menuItemId === "quiz") {
      result = await generateQuiz(info.selectionText);
    }

    // Send result to notebook
    chrome.storage.local.get({ notes: [] }, (data) => {
      const notes = data.notes;
      notes.push({ type: info.menuItemId, content: result });
      chrome.storage.local.set({ notes });
    });
  }
});

// Summarizer API
async function summarizeText(text) {
  const response = await chrome.ai.summarizer.summarize({ text });
  return response.summary;
}

// Rewriter API
async function simplifyText(text) {
  const response = await chrome.ai.rewriter.rewrite({
    text,
    style: "simple"
  });
  return response.output;
}

// Prompt API (Quiz Generator)
async function generateQuiz(text) {
  const response = await chrome.ai.prompt.generate({
    input: `Create 2 multiple-choice questions with answers based on this text:\n${text}`
  });
  return response.output;
}
