// ===== Pocket Mentor+ Content Script =====

// Currently just placeholder — can inject functions into page or interact with page text
console.log("✅ Pocket Mentor+ content script loaded.");

// Example: Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightText") {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  }
});
