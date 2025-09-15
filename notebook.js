/* ===== Pocket Mentor+ 🎓✨ Notebook Script ===== */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeBtn = document.getElementById("themeToggle");
  const textarea = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");

  // Buttons
  const summarizeBtn = document.getElementById("summarizeBtn");
  const explainBtn = document.getElementById("explainBtn");

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

  /* === Call Chrome Built-in AI Prompt API === */
  async function runAI(task, inputText) {
    if (!window.ai || !window.ai.prompt) {
      updateOutput("⚠️ Built-in AI not available in this environment.");
      return;
    }

    try {
      const session = await window.ai.prompt.create({
        model: "gemini-nano", // lightweight client-side model
      });

      const result = await session.prompt(`${task} the following text:\n\n${inputText}`);
      updateOutput(result);

      await session.destroy();
    } catch (err) {
      updateOutput("❌ Error: " + err.message);
    }
  }

  /* === Summarize Button === */
  summarizeBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) {
      updateOutput("⚠️ Please enter some text first.");
      return;
    }
    runAI("Summarize", input);
  });

  /* === Explain Button === */
  explainBtn.addEventListener("click", () => {
    const input = textarea.value.trim();
    if (!input) {
      updateOutput("⚠️ Please enter some text first.");
      return;
    }
    runAI("Explain in simple terms", input);
  });
});
