// ===== Pocket Mentor+ Popup Script =====
import { summarizeText, translateText, proofreadText, writeText } from "../utils/api.js";

// Grab elements
const inputBox = document.getElementById("userInput");
const outputBox = document.getElementById("outputBox");

// Button handlers
document.getElementById("summarizeBtn").addEventListener("click", () => processText("summarize"));
document.getElementById("translateBtn").addEventListener("click", () => processText("translate"));
document.getElementById("proofreadBtn").addEventListener("click", () => processText("proofread"));
document.getElementById("rewriteBtn").addEventListener("click", () => processText("rewrite"));

// Core function
async function processText(action) {
    const text = inputBox.value.trim();

    if (!text) {
        outputBox.innerText = "⚠️ Please enter some text first.";
        return;
    }

    outputBox.innerText = "⏳ Processing...";

    try {
        let result = "";

        switch (action) {
            case "summarize":
                result = await summarizeText(text);
                break;
            case "translate":
                result = await translateText(text, "es"); // Example: Spanish
                break;
            case "proofread":
                result = await proofreadText(text);
                break;
            case "rewrite":
                result = await writeText(text, "polished");
                break;
        }

        outputBox.innerText = result || "⚠️ No result returned.";
    } catch (err) {
        console.error(err);
        outputBox.innerText = "❌ Error processing text. Try again.";
    }
}

// ===== Theme Toggle =====
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

// Apply theme
function setTheme(mode) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${mode}-theme`);
    themeToggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}
