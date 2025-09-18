# Pocket Mentor+ Chrome Extension - Installation Guide

## Quick Setup

1. **Create Extension Folder**
   ```bash
   mkdir pocket-mentor-plus
   cd pocket-mentor-plus
   ```

2. **Enable Chrome AI Flags**
   - Navigate to `chrome://flags/#optimization-guide-on-device-model`
   - Set to **"Enabled BypassPerfRequirement"**
   - Navigate to `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to **"Enabled"**
   - **Restart Chrome completely**

3. **Load Extension**
   - Go to `chrome://extensions/`
   - Enable **"Developer mode"** (top right toggle)
   - Click **"Load unpacked"**
   - Select your `pocket-mentor-plus` folder
   - Extension icon should appear in toolbar!

4. **Test Functionality**
   - Click the extension icon for popup interface
   - Select text on any webpage and right-click for AI options
   - Try keyboard shortcuts: Alt+S, Alt+E, Alt+T, Alt+P

## File Structure Required
```
pocket-mentor-plus/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── notebook.html
├── notebook.js
├── content.js
├── api.js
├── styles.css
├── icon16.png
├── icon48.png
├── icon128.png
└── README.md
```

## Features
- ✅ AI Summarization (Gemini Nano)
- ✅ 10+ Language Translation
- ✅ Text Explanation & Simplification
- ✅ Grammar & Style Proofreading
- ✅ Quiz Generation from any text
- ✅ Comprehensive Study Notes
- ✅ Context Menu Integration
- ✅ Keyboard Shortcuts
- ✅ Dark/Light Themes
- ✅ Notes Export (JSON)

## Troubleshooting
- **AI not working?** Ensure Chrome flags are enabled and Chrome restarted
- **Extension not loading?** Check Developer mode is enabled
- **No context menu?** Refresh webpages after loading extension
- **Performance issues?** Close unnecessary tabs (AI requires memory)

Built for Chrome Built-in AI Challenge 2025 🎓✨