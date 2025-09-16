// ===== Pocket Mentor+ Popup Script =====

// Utility: Update results box
function showResult(text) {
  const box = document.getElementById("outputBox");
  box.textContent = text;
}

// Utility: Send request to AI via background.js
async function callAI(action, text) {
  showResult("⏳ Processing...");

  try {
    const response = await chrome.runtime.sendMessage({ action, text });

    if (response && response.result) {
      showResult(response.result);
    } else {
      showResult("⚠️ No response from AI.");
    }
  } catch (err) {
    console.error("AI error:", err);
    showResult("❌ Error communicating with AI.");
  }
}

// ===== Button Handlers =====
function attachButton(id, action) {
  document.getElementById(id).addEventListener("click", () => {
    const text = document.getElementById("userInput").value.trim();
    if (text) {
      callAI(action, text);
    } else {
      showResult("⚠️ Please enter some text first.");
    }
  });
}

attachButton("summarizeBtn", "summarize");
attachButton("translateBtn", "translate");
attachButton("proofreadBtn", "proofread");
attachButton("rewriteBtn", "rewrite");

// ===== Theme Toggle with Persistence =====
const themeToggle = document.getElementById("themeToggle");

// Load saved theme
chrome.storage.sync.get("theme", (data) => {
  const currentTheme = data.theme || "light";
  setTheme(currentTheme);
});

// Toggle theme on click
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-theme");
  const newTheme = isDark ? "light" : "dark";
  setTheme(newTheme);
  chrome.storage.sync.set({ theme: newTheme });
});

// Apply theme
function setTheme(mode) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${mode}-theme`);
  themeToggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

