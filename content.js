// ===== Pocket Mentor+ Content Script =====
console.log("✅ Pocket Mentor+ content script loaded.");

// --- Listen for messages from background.js (AI actions from context menu) ---
window.addEventListener("message", (event) => {
  if (event.source !== window) return; // Ignore messages not from this page
  const message = event.data;

  if (message.type === "AI_ACTION") {
    const { action, text } = message;

    // Forward action and text to background or popup
    chrome.runtime.sendMessage({ action, text }, (response) => {
      if (response?.result) {
        console.log(`AI result for "${action}":`, response.result);
      }
    });
  }
});

// --- Listen for messages from popup.js or background.js ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Return currently selected text if requested
  if (request.action === "highlightText") {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
    return;
  }

  // Optional: handle other direct content requests
  if (request.action && request.text) {
    console.log(`Content script received action: ${request.action}`, request.text);
    sendResponse({ status: "received" });
  }
});
