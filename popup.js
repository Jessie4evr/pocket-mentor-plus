// ===== Pocket Mentor+ Popup Script =====

// Grab elements
const inputBox = document.getElementById("userInput");
const outputBox = document.getElementById("outputBox");

// Button handlers
document.getElementById("summarizeBtn").addEventListener("click", () => {
  processText("summarize");
});

document.getElementById("translateBtn").addEventListener("click", () => {
  processText("translate");
});

document.getElementById("proofreadBtn").addEventListener("click", () => {
  processText("proofread");
});

document.getElementById("rewriteBtn").addEventListener("click", () => {
  processText("rewrite");
});

// Core function
function processText(action) {
  const text = inputBox.value.trim();

  if (!text) {
    outputBox.innerText = "⚠️ Please enter some text first.";
    return;
  }

  // Show loading
  outputBox.innerText = "⏳ Processing...";

  // Placeholder: Replace with Chrome Built-in AI APIs
  setTimeout(() => {
    let result = "";

    switch (action) {
      case "summarize":
        result = `📝 (Summarized) → ${text.slice(0, 60)}...`;
        break;
      case "translate":
        result = `🌐 (Translated) → ${text.toUpperCase()}`;
        break;
      case "proofread":
        result = `🔤 (Proofread) → ${text.replace("teh", "the")}`;
        break;
      case "rewrite":
        result = `✏️ (Rewritten) → ${text.split(" ").reverse().join(" ")}`;
        break;
    }

    outputBox.innerText = result;
  }, 1000);
}
