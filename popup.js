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

// Theme toggle button
const themeToggle = document.getElementById("themeToggle");

// Load saved theme
chrome.storage.sync.get("theme", (data) => {
  const currentTheme = data.theme || "light";
  setTheme(currentTheme);
});

// Toggle theme on click
themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  setTheme(newTheme);
  chrome.storage.sync.set({ theme: newTheme });
});

// Function to apply theme
function setTheme(mode) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${mode}-theme`);
  themeToggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}
