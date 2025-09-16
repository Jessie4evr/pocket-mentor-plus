// ===== Pocket Mentor+ Content Script =====
console.log("✅ Pocket Mentor+ content script loaded.");

/* --- Listen for messages from window (page) --- */
window.addEventListener("message", (event) => {
  if (event.source !== window) return; // Ignore messages not from this page
  const message = event.data;

  if (message?.type === "AI_ACTION" && message.action && message.text) {
    // Forward action and text to background
    chrome.runtime.sendMessage(
      { action: message.action, text: message.text },
      (response) => {
        if (response?.result) {
          console.log(`🧠 AI result for "${message.action}":`, response.result);
          // Optionally, post the result back to page
          window.postMessage(
            { type: "AI_RESULT", action: message.action, result: response.result },
            "*"
          );
        } else {
          console.warn(`⚠️ No AI result returned for "${message.action}"`);
        }
      }
    );
  }
});

/* --- Listen for messages from popup.js or background.js --- */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request?.action) return;

  // Return currently selected text if requested
  if (request.action === "highlightText") {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
    return;
  }

  // Handle other actions forwarded to content script
  if (request.text) {
    console.log(`📨 Content script received action: "${request.action}"`, request.text);
    sendResponse({ status: "received" });
  }
});
