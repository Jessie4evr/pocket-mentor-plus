# pocket-mentor-plus
🎓 Pocket Mentor+: Your AI-powered study and writing assistant, built with Chrome’s on-device AI. Summarize, translate, proofread, and learn, all in your browser.

# Pocket Mentor+ 🎓✨
Your AI-powered learning & productivity assistant, built with Chrome’s Built-in AI Challenge 2025 APIs.

## Overview
Pocket Mentor+ is a **Chrome Extension** that transforms any webpage into a personal tutor and productivity coach.  
It combines summarization, translation, rewriting, and proofing into one seamless sidebar — helping students, professionals, and lifelong learners work smarter, not harder.  

### Key Features
- 📝 **Summarizer API** – condense long articles, research, or notes into clear insights.  
- 🌐 **Translator API** – instantly translate text into multiple languages for global learning.  
- ✏️ **Writer & Rewriter APIs** – draft original ideas or polish existing text.  
- 🔤 **Proofreader API** – check grammar and improve clarity on the fly.  
- 💡 **Prompt API** – multimodal AI prompting (text, image, audio input support).  

Built to run **client-side with Gemini Nano**, ensuring:  
- ✅ Privacy-first (no user data leaves the device)  
- ✅ Offline-ready (works without internet)  
- ✅ Cost-efficient (no server or quota costs)  
✅ Dark/Light themes – Switch with a single click.
✅ Integrated notebook – Save, organize, and revisit AI-processed notes.
✅ Context menus – Right-click selected text to summarize, simplify, or quiz.
---

## Demo Video
📺 [Watch on YouTube](https://your-demo-link-here.com)  
*(3 min demo showcasing features & workflow)*  

---

## Screenshots
*(Add screenshots of your extension here)*

---

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/pocket-mentor-plus.git
   cd pocket-mentor-plus


Pocket-Mentor-Plus/
│
├── assets/                 # Logos & icons
├── background/             # Context menu + AI API handlers
├── popup/                  # Popup UI & scripts
├── notebook/               # Notebook UI & scripts
├── content/                # Optional content scripts
├── api/                    # AI wrapper functions
├── manifest.json           # Chrome extension configuration
└── README.md               # Documentation

Installation

1. Clone or download this repository.
2. Open Chrome → chrome://extensions/
3. Enable Developer Mode.
4. Click Load unpacked → Select Pocket-Mentor-Plus/ folder.
5. Pin the extension to your toolbar for quick access.

Usage

Popup:
1. Click the Pocket Mentor+ icon.
2. Paste or type text.
3. Use action buttons: Summarize, Translate, Rewrite, Proofread.
4. Toggle Dark/Light mode if needed.

Notebook:

1. Open the notebook from the extension.
2. Input text and select actions like Summarize, Explain, Rewrite, Proofread.
3. Select a target language for translations.
4. View results in the output panel and save them locally.

Context Menu:

Highlight text on any webpage → Right-click → Choose: Summarize, Simplify, Quiz.
Results are automatically saved to your notebook.

AI Integration

Gemini Nano APIs via window.ai.
Client-side only — No external servers required.
Supports Summarizer, Translator, Rewriter, Proofreader, and Prompt endpoints.
Can be extended for additional AI tasks in api/api.js.
