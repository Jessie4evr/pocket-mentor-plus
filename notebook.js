/* ===== Pocket Mentor+ 🎓✨ Notebook Script ===== */

import {
  summarizeText,
  translateText,
  proofreadText,
  rewriteText,
  explainText
} from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeBtn = document.getElementById("themeToggle");
  const textarea = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const languageSelect = document.getElementById("languageSelect");

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

  /* === Generic Handler === */
  async function handleAI(actionFn, ...args) {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");

    try {
      updateOutput("⏳ Processing...");
      const result = await actionFn(input, ...args);
      updateOutput(result);
    } catch (err) {
      updateOutput(`❌ Error: ${err.message}`);
    }
  }

  /* === Button Event Listeners === */
  buttons.summarize.addEventListener("click", () => handleAI(summarizeText));
  buttons.explain.addEventListener("click", () => handleAI(explainText));
  buttons.rewrite.addEventListener("click", () => handleAI(rewriteText));
  buttons.proofread.addEventListener("click", () => handleAI(proofreadText));
  buttons.translate.addEventListener("click", () => {
    const targetLang = languageSelect.value || "es";
    handleAI(translateText, targetLang);
  });
});

