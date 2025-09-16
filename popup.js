// ===== Pocket Mentor+ Popup Script =====

const outputBox = document.getElementById("outputBox");
const userInput = document.getElementById("userInput");
const themeToggle = document.getElementById("themeToggle");

// --- Utility: Show Result ---
function showResult(text) {
  outputBox.textContent = text;
  outputBox.focus();
  // Trigger fade-in animation
  outputBox.style.animation = "none";
  void outputBox.offsetWidth;
  outputBox.style.animation = "fadeInResult 0.5s ease-in-out";
}

// --- AI Call ---
async function callAI(action, text) {
  if (!text) {
    showResult("⚠️ Please enter some text first.");
    return;
  }
  showResult("⏳ Processing...");
  try {
    const response = await chrome.runtime.sendMessage({ action, text });
    showResult(response?.result || "⚠️ No response from AI.");
  } catch (err) {
    console.error("AI error:", err);
    showResult("❌ Error communicating with AI.");
  }
}

// --- Attach Button Handlers ---
function attachButton(id, action) {
  document.getElementById(id).addEventListener("click", () => {
    callAI(action, userInput.value.trim());
  });
}

attachButton("summarizeBtn", "summarize");
attachButton("translateBtn", "translate");
attachButton("proofreadBtn", "proofread");
attachButton("rewriteBtn", "rewrite");

// --- Theme Handling ---
function setTheme(mode) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${mode}-theme`);
  themeToggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  chrome.storage.sync.set({ theme: mode });
}

themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  setTheme(newTheme);
});

// Load saved theme on startup
chrome.storage.sync.get("theme", (data) => {
  setTheme(data.theme || "light");
});

