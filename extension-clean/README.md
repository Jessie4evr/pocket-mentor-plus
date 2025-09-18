# Pocket Mentor+ 🎓✨
Your AI-powered study and writing assistant, built with Chrome's Built-in AI Challenge 2025 APIs.

Transform any webpage into your personal tutor with privacy-first, offline-ready AI processing.

---

## 🌟 Overview

Pocket Mentor+ is a **Chrome Extension** that leverages Chrome's built-in AI capabilities to provide intelligent text processing directly in your browser. Whether you're a student, researcher, or professional, this extension helps you understand, process, and learn from any text on the web.

**🔥 Key Highlights:**
- ✅ **Privacy-First**: All processing happens locally on your device
- ✅ **Offline-Ready**: Works without internet connection after initial setup
- ✅ **Zero Cost**: No API fees or subscriptions required
- ✅ **Fast & Efficient**: Powered by Chrome's optimized Gemini Nano model
- ✅ **Universal**: Works on any webpage with text

---

## 🚀 Features

### Core AI Capabilities
- 📝 **Smart Summarization** – Condense articles, papers, and documents into key insights
- 💡 **Simple Explanations** – Get complex concepts explained in easy-to-understand language
- 🌐 **Instant Translation** – Translate text into 10+ languages (Spanish, French, German, Chinese, Japanese, Hindi, Italian, Portuguese, Russian, Arabic)
- ✏️ **AI Proofreading** – Fix grammar, improve clarity, and enhance writing style
- 🔄 **Text Rewriting** – Polish and restructure text for better readability
- ❓ **Quiz Generation** – Create interactive quizzes from any text for studying
- 📚 **Study Notes** – Generate comprehensive study notes automatically

### User Experience
- 🎯 **Context Menu Integration** – Right-click any selected text for instant processing
- ⌨️ **Keyboard Shortcuts** – Quick actions with Alt+S, Alt+E, Alt+T, Alt+P
- 📱 **Dual Interface** – Quick popup for fast actions + full notebook for comprehensive work
- 🌙 **Dark/Light Themes** – Toggle between themes with one click
- 💾 **Smart Notes Management** – Automatically save, organize, and search your processed content
- 📊 **Study Statistics** – Track your learning progress and usage patterns
- 📥 **Export Functionality** – Export notes as JSON for backup or sharing

---

## 📥 Installation

### Prerequisites
- **Chrome 127+** with experimental AI features
- **8GB+ RAM** recommended for optimal performance
- **Developer Mode** enabled for unpacked extension loading

### Step-by-Step Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-username/pocket-mentor-plus.git
   cd pocket-mentor-plus
   ```
   Or download the ZIP file from the [website](#) and extract it.

2. **Enable Chrome AI Features**
   - Navigate to `chrome://flags/#optimization-guide-on-device-model`
   - Set to **"Enabled BypassPerfRequirement"**
   - Navigate to `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to **"Enabled"**
   - **Restart Chrome** completely

3. **Load the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **"Developer mode"** in the top right corner
   - Click **"Load unpacked"** and select the downloaded/cloned folder
   - The Pocket Mentor+ icon should appear in your toolbar

4. **Verify Installation**
   - Click the extension icon to open the popup
   - Check AI status (it may take a few minutes to initialize)
   - Try processing some text to confirm functionality

---

## 🎯 Usage

### Quick Actions (Popup)
1. Click the Pocket Mentor+ icon in the toolbar
2. Paste or type text in the input area
3. Click any action button (Summarize, Explain, Translate, Proofread)
4. View results and save to notes if desired

### Context Menu (Right-Click)
1. Select any text on any webpage
2. Right-click to open context menu
3. Choose a Pocket Mentor+ action
4. Results are automatically saved to your notebook

### Keyboard Shortcuts
- **Alt + S**: Quick summarize selected text  
- **Alt + E**: Quick explain selected text  
- **Alt + T**: Quick translate selected text  
- **Alt + P**: Quick proofread selected text  

### Full Notebook Interface
1. Click "Open Notebook" in the popup, or
2. Open a new tab and go to: `chrome-extension://[extension-id]/notebook.html`
3. Access all features, manage notes, view statistics, and export data

---

## 🛠️ Troubleshooting

### AI Features Not Working
- Ensure Chrome flags are enabled and Chrome is restarted
- Check that Chrome version is 127 or newer
- Wait 5-10 minutes after enabling flags for models to download
- Verify sufficient RAM (8GB+ recommended)

### Extension Not Loading
- Ensure Developer mode is enabled in chrome://extensions/
- Check that you're loading the correct folder (should contain manifest.json)
- Look for error messages in the Extensions page

### Performance Issues
- Close unnecessary tabs to free up memory
- Disable other extensions temporarily to test
- Check Chrome Task Manager (Shift+Esc) for memory usage

---

## 📊 Features in Detail

### Smart Summarization
- Multiple summary types (key points, abstract, bullet points)
- Adjustable summary length
- Works with articles, research papers, long documents
- Preserves important context and main ideas

### Instant Translation
**Supported Languages:**
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)  
- 🇩🇪 German (Deutsch)
- 🇨🇳 Chinese (中文)
- 🇯🇵 Japanese (日本語)
- 🇮🇳 Hindi (हिंदी)
- 🇮🇹 Italian (Italiano)
- 🇵🇹 Portuguese (Português)
- 🇷🇺 Russian (Русский)
- 🇸🇦 Arabic (العربية)

### Quiz Generation
- Multiple-choice questions with correct answers
- Adjustable number of questions (1-10)
- Based on key concepts and facts from source text
- Perfect for study preparation and knowledge testing

### Study Notes Organization
- Automatic categorization by AI action type
- Search and filter functionality
- Export to JSON format
- Statistics tracking (total notes, study time, words processed)

---

## 🔒 Privacy & Security

- **100% Local Processing**: No data ever leaves your device
- **No Tracking**: Extension doesn't collect or transmit personal data
- **Offline Capable**: Works without internet after initial setup
- **Open Source**: Full source code available for audit
- **No External APIs**: Uses only Chrome's built-in AI capabilities

---

## 🧩 Technical Details

### Built With
- **Manifest V3** Chrome Extension
- **Chrome Built-in AI APIs** (Gemini Nano)
- **Vanilla JavaScript** (ES6+ modules)
- **CSS3** with custom properties and animations
- **Local Storage API** for data persistence

### Browser Compatibility
- **Chrome 127+** (Required for AI features)
- **Chromium-based browsers** with AI flag support
- **Not compatible** with Firefox, Safari, or older Chrome versions

### Performance
- **Memory Usage**: ~50-100MB (varies with AI model size)
- **Processing Speed**: 1-5 seconds for most operations
- **Storage**: <1MB for extension files, variable for user notes

---

## 🚀 Roadmap

### Upcoming Features
- [ ] **Image Analysis**: OCR and image description capabilities
- [ ] **PDF Processing**: Direct PDF text extraction and analysis
- [ ] **Voice Input**: Speech-to-text for hands-free operation
- [ ] **Study Sessions**: Pomodoro timer with AI-powered breaks
- [ ] **Collaborative Notes**: Share and sync notes across devices
- [ ] **Advanced Export**: PDF, Word, and Markdown export formats

### Under Consideration
- [ ] **Custom AI Prompts**: User-defined AI instructions
- [ ] **Integration APIs**: Connect with note-taking apps
- [ ] **Mobile Companion**: Mobile app for cross-device sync
- [ ] **Accessibility**: Enhanced screen reader support

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/your-username/pocket-mentor-plus.git
cd pocket-mentor-plus
# Load extension in Chrome for testing
# Make changes and reload extension
```

### Bug Reports & Feature Requests
- Use [GitHub Issues](https://github.com/your-username/pocket-mentor-plus/issues)
- Include Chrome version, OS, and detailed steps to reproduce
- Search existing issues before creating new ones

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Chrome Built-in AI Team** for providing the foundation APIs
- **Gemini Nano** for powering the AI capabilities  
- **Chrome Extensions Team** for Manifest V3 and platform support
- **Open Source Community** for inspiration and feedback

---

## 📞 Support

- **Documentation**: [Read the full docs](#)
- **Issues**: [GitHub Issues](https://github.com/your-username/pocket-mentor-plus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/pocket-mentor-plus/discussions)
- **Website**: [Visit our website](#)

---

**Built with ❤️ for the Chrome Built-in AI Challenge 2025**

*Empowering learners worldwide with privacy-first, on-device AI technology.*