/* ===== Pocket Mentor+ 🎓✨ Notebook Script ===== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeBtn = document.getElementById("themeToggle");
  const textarea = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const languageSelect = document.getElementById("languageSelect");

  // Buttons
  const buttons = {
    summarize: document.getElementById("summarizeBtn"),
    explain: document.getElementById("explainBtn"),
    rewrite: document.getElementById("rewriteBtn"),
    proofread: document.getElementById("proofreadBtn"),
    translate: document.getElementById("translateBtn")
  };

  /* === Theme Handling === */
  function setTheme(mode) {
    body.classList.remove("light-theme", "dark-theme");
    body.classList.add(`${mode}-theme`);
    themeBtn.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    chrome.storage.sync.set({ theme: mode });
  }

  // Load saved theme
  chrome.storage.sync.get("theme", (data) => setTheme(data.theme || "light"));

  themeBtn.addEventListener("click", () => {
    const newMode = body.classList.contains("dark-theme") ? "light" : "dark";
    setTheme(newMode);
  });

  /* === Output Utility === */
  function updateOutput(text) {
    outputBox.textContent = text;
    outputBox.focus();
    outputBox.style.animation = "none";
    void outputBox.offsetWidth; // force reflow
    outputBox.style.animation = "fadeInResult 0.5s ease-in-out";
  }

  /* === AI Wrappers === */
  async function runAI(api, input, options = {}) {
    if (!window.ai || !window.ai[api]) {
      updateOutput(`⚠️ ${api.charAt(0).toUpperCase() + api.slice(1)} API not available.`);
      return;
    }

    try {
      const session = await window.ai[api].create({ model: "gemini-nano", ...options });
      let result;

      switch (api) {
        case "summarizer":
          result = await session.summarize(input);
          break;
        case "prompt":
          result = await session.prompt(`Explain in simple terms:\n\n${input}`);
          break;
        case "rewriter":
          result = await session.rewrite(input);
          break;
        case "proofreader":
          result = await session.proofread(input);
          break;
        case "translator":
          result = await session.translate(input);
          break;
        default:
          result = "⚠️ Unknown AI action.";
      }

      updateOutput(result);
      await session.destroy();
    } catch (err) {
      updateOutput(`❌ ${api.charAt(0).toUpperCase() + api.slice(1)} Error: ${err.message}`);
    }
  }

  /* === Event Listeners for Buttons === */
  buttons.summarize.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runAI("summarizer", input);
  });

  buttons.explain.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runAI("prompt", input);
  });

  buttons.rewrite.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runAI("rewriter", input);
  });

  buttons.proofread.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runAI("proofreader", input);
  });

  buttons.translate.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");

    const targetLang = languageSelect.value || "es";
    runAI("translator", input, { targetLanguage: targetLang });
  });
});

