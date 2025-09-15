/* ===== Pocket Mentor+ 🎓✨ Notebook Script ===== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeBtn = document.getElementById("themeToggle");
  const textarea = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");

  // Buttons
  const summarizeBtn = document.getElementById("summarizeBtn");
  const explainBtn = document.getElementById("explainBtn");
  const rewriteBtn = document.getElementById("rewriteBtn");
  const proofreadBtn = document.getElementById("proofreadBtn");
  const translateBtn = document.getElementById("translateBtn");

  /* === Theme Toggle === */
  themeBtn.addEventListener("click", () => {
    if (body.classList.contains("light-theme")) {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      themeBtn.textContent = "☀️ Light Mode";
    } else {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      themeBtn.textContent = "🌙 Dark Mode";
    }
  });

  /* === Utility: Update Output === */
  function updateOutput(text) {
    outputBox.textContent = text;
  }

  /* === AI Wrappers === */
  async function runSummarizer(input) {
    if (!window.ai || !window.ai.summarizer) {
      updateOutput("⚠️ Summarizer API not available.");
      return;
    }
    try {
      const session = await window.ai.summarizer.create({ model: "gemini-nano" });
      const result = await session.summarize(input);
      updateOutput(result);
      await session.destroy();
    } catch (err) {
      updateOutput("❌ Summarizer Error: " + err.message);
    }
  }

  async function runExplain(input) {
    if (!window.ai || !window.ai.prompt) {
      updateOutput("⚠️ Prompt API not available.");
      return;
    }
    try {
      const session = await window.ai.prompt.create({ model: "gemini-nano" });
      const result = await session.prompt("Explain in simple terms:\n\n" + input);
      updateOutput(result);
      await session.destroy();
    } catch (err) {
      updateOutput("❌ Explain Error: " + err.message);
    }
  }

  async function runRewrite(input) {
    if (!window.ai || !window.ai.rewriter) {
      updateOutput("⚠️ Rewriter API not available.");
      return;
    }
    try {
      const session = await window.ai.rewriter.create({ model: "gemini-nano" });
      const result = await session.rewrite(input);
      updateOutput(result);
      await session.destroy();
    } catch (err) {
      updateOutput("❌ Rewriter Error: " + err.message);
    }
  }

  async function runProofread(input) {
    if (!window.ai || !window.ai.proofreader) {
      updateOutput("⚠️ Proofreader API not available.");
      return;
    }
    try {
      const session = await window.ai.proofreader.create({ model: "gemini-nano" });
      const result = await session.proofread(input);
      updateOutput(result);
      await session.destroy();
    } catch (err) {
      updateOutput("❌ Proofreader Error: " + err.message);
    }
  }

  async function runTranslate(input, targetLang = "es") {
    if (!window.ai || !window.ai.translator) {
      updateOutput("⚠️ Translator API not available.");
      return;
    }
    try {
      const session = await window.ai.translator.create({
        model: "gemini-nano",
        targetLanguage: targetLang
      });
      const result = await session.translate(input);
      updateOutput(result);
      await session.destroy();
    } catch (err) {
      updateOutput("❌ Translator Error: " + err.message);
    }
  }

  /* === Event Listeners === */
  summarizeBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runSummarizer(input);
  });

  explainBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runExplain(input);
  });

  rewriteBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runRewrite(input);
  });

  proofreadBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runProofread(input);
  });

  translateBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) return updateOutput("⚠️ Please enter some text first.");
    runTranslate(input, "es"); // default → Spanish (you can add dropdown later)
  });
});
