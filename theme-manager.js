// ===== Pocket Mentor+ Theme Manager 🎨✨ =====
// Advanced theme system with multiple beautiful themes

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themes = {
      light: {
        name: '☀️ Light',
        colors: {
          primary: '#b8860b',
          primaryDark: '#996515',
          primaryLight: '#daa520',
          background: '#fafafa',
          surface: '#ffffff',
          text: '#2c2c2c',
          textLight: '#6c757d',
          accent: '#007bff',
          success: '#28a745',
          warning: '#ffc107',
          error: '#dc3545'
        }
      },
      dark: {
        name: '🌙 Dark',
        colors: {
          primary: '#daa520',
          primaryDark: '#b8860b',
          primaryLight: '#ffd700',
          background: '#1a1a1a',
          surface: '#2a2a2a',
          text: '#f3f3f3',
          textLight: '#b0b0b0',
          accent: '#4dabf7',
          success: '#51cf66',
          warning: '#ffd43b',
          error: '#ff6b6b'
        }
      },
      cyberpunk: {
        name: '🚀 Cyberpunk',
        colors: {
          primary: '#00ffff',
          primaryDark: '#008b8b',
          primaryLight: '#7fffd4',
          background: '#0a0a0a',
          surface: '#1a1a1a',
          text: '#00ffff',
          textLight: '#00cccc',
          accent: '#ff0080',
          success: '#00ff41',
          warning: '#ffff00',
          error: '#ff004d'
        }
      },
      forest: {
        name: '🌲 Forest',
        colors: {
          primary: '#2d5016',
          primaryDark: '#1e3a0f',
          primaryLight: '#4a7c59',
          background: '#f0f8f0',
          surface: '#ffffff',
          text: '#1a2e1a',
          textLight: '#5a6b5a',
          accent: '#228b22',
          success: '#32cd32',
          warning: '#ffa500',
          error: '#dc143c'
        }
      },
      ocean: {
        name: '🌊 Ocean',
        colors: {
          primary: '#006994',
          primaryDark: '#004d6b',
          primaryLight: '#0087bd',
          background: '#f0f8ff',
          surface: '#ffffff',
          text: '#003854',
          textLight: '#5a7a8a',
          accent: '#00bcd4',
          success: '#26c6da',
          warning: '#ff9800',
          error: '#f44336'
        }
      },
      rose: {
        name: '🌹 Rose Quartz',
        colors: {
          primary: '#d4637a',
          primaryDark: '#b85450',
          primaryLight: '#e8a4b0',
          background: '#fdf2f8',
          surface: '#ffffff',
          text: '#4a1c2b',
          textLight: '#8a5a6a',
          accent: '#ec4899',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        }
      }
    };
    
    this.init();
  }

  init() {
    this.loadCurrentTheme();
    this.createThemeStyles();
  }

  async loadCurrentTheme() {
    try {
      const result = await chrome.storage.sync.get('currentTheme');
      this.currentTheme = result.currentTheme || 'light';
    } catch (error) {
      console.error('Failed to load current theme:', error);
      this.currentTheme = 'light';
    }
  }

  async setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.error(`Theme ${themeName} not found`);
      return;
    }

    this.currentTheme = themeName;
    
    try {
      await chrome.storage.sync.set({ currentTheme: themeName });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }

    this.applyTheme(themeName);
    this.notifyThemeChange(themeName);
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    const root = document.documentElement;

    // Remove existing theme classes
    document.body.classList.remove(
      'light-theme', 'dark-theme', 'cyberpunk-theme', 
      'forest-theme', 'ocean-theme', 'rose-theme'
    );

    // Add new theme class
    document.body.classList.add(`${themeName}-theme`);

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply theme-specific styles
    this.applyThemeSpecificStyles(themeName);
  }

  applyThemeSpecificStyles(themeName) {
    // Remove existing theme style elements
    const existingStyles = document.querySelectorAll('.theme-specific-styles');
    existingStyles.forEach(style => style.remove());

    const styleElement = document.createElement('style');
    styleElement.className = 'theme-specific-styles';
    
    switch(themeName) {
      case 'cyberpunk':
        styleElement.textContent = this.getCyberpunkStyles();
        break;
      case 'forest':
        styleElement.textContent = this.getForestStyles();
        break;
      case 'ocean':
        styleElement.textContent = this.getOceanStyles();
        break;
      case 'rose':
        styleElement.textContent = this.getRoseStyles();
        break;
      default:
        styleElement.textContent = this.getDefaultStyles();
    }

    document.head.appendChild(styleElement);
  }

  getCyberpunkStyles() {
    return `
      .cyberpunk-theme {
        background: 
          radial-gradient(ellipse at top, #001a33 0%, #0a0a0a 50%),
          linear-gradient(45deg, transparent 49%, #333333 49%, #333333 51%, transparent 51%),
          linear-gradient(-45deg, transparent 49%, #333333 49%, #333333 51%, transparent 51%);
        background-size: 100% 100%, 20px 20px, 20px 20px;
        font-family: 'Courier New', 'Monaco', monospace;
      }

      .cyberpunk-theme .popup-container,
      .cyberpunk-theme .quick-actions,
      .cyberpunk-theme .input-section,
      .cyberpunk-theme .output-section {
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid var(--color-primary);
        box-shadow: 
          0 0 20px var(--color-primary),
          inset 0 0 20px rgba(0, 255, 255, 0.1);
        backdrop-filter: none;
      }

      .cyberpunk-theme .popup-header,
      .cyberpunk-theme .app-header {
        background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        text-shadow: 0 0 10px currentColor;
        animation: headerGlow 2s ease-in-out infinite alternate;
      }

      @keyframes headerGlow {
        from { box-shadow: 0 0 20px var(--color-primary); }
        to { box-shadow: 0 0 30px var(--color-accent); }
      }

      .cyberpunk-theme button {
        background: transparent;
        border: 2px solid var(--color-primary);
        color: var(--color-primary);
        text-shadow: 0 0 5px currentColor;
        box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.1);
      }

      .cyberpunk-theme button:hover {
        background: rgba(0, 255, 255, 0.1);
        box-shadow: 0 0 20px var(--color-primary);
        transform: translateY(-2px);
      }

      .cyberpunk-theme .primary-btn {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .cyberpunk-theme .primary-btn:hover {
        box-shadow: 0 0 20px var(--color-accent);
      }

      .cyberpunk-theme textarea,
      .cyberpunk-theme input {
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid var(--color-primary);
        color: var(--color-success);
        font-family: 'Courier New', monospace;
      }

      .cyberpunk-theme #outputBox,
      .cyberpunk-theme #quickOutput {
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid var(--color-success);
        color: var(--color-success);
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 3px currentColor;
      }
    `;
  }

  getForestStyles() {
    return `
      .forest-theme {
        background: 
          linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%),
          url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234a7c59' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E");
      }

      .forest-theme .popup-container,
      .forest-theme .quick-actions,
      .forest-theme .input-section,
      .forest-theme .output-section {
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid rgba(45, 80, 22, 0.2);
        box-shadow: 
          0 8px 32px rgba(45, 80, 22, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      .forest-theme .popup-header,
      .forest-theme .app-header {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primaryLight));
        box-shadow: 
          0 8px 32px rgba(45, 80, 22, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .forest-theme button {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primaryLight));
        border: none;
        color: white;
        box-shadow: 0 4px 16px rgba(45, 80, 22, 0.3);
      }

      .forest-theme button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(45, 80, 22, 0.4);
      }

      .forest-theme .secondary-btn {
        background: linear-gradient(135deg, var(--color-accent), #32cd32);
        box-shadow: 0 4px 16px rgba(34, 139, 34, 0.3);
      }

      .forest-theme textarea,
      .forest-theme input {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(45, 80, 22, 0.3);
        color: var(--color-text);
      }

      .forest-theme textarea:focus,
      .forest-theme input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(45, 80, 22, 0.15);
      }
    `;
  }

  getOceanStyles() {
    return `
      .ocean-theme {
        background: 
          linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%),
          radial-gradient(ellipse at top, rgba(0, 188, 212, 0.1) 0%, transparent 50%);
      }

      .ocean-theme .popup-container,
      .ocean-theme .quick-actions,
      .ocean-theme .input-section,
      .ocean-theme .output-section {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(0, 105, 148, 0.2);
        box-shadow: 
          0 8px 32px rgba(0, 105, 148, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
      }

      .ocean-theme .popup-header,
      .ocean-theme .app-header {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primaryLight));
        box-shadow: 
          0 8px 32px rgba(0, 105, 148, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .ocean-theme button {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primaryLight));
        border: none;
        color: white;
        box-shadow: 0 4px 16px rgba(0, 105, 148, 0.3);
      }

      .ocean-theme button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 105, 148, 0.4);
      }

      .ocean-theme .secondary-btn {
        background: linear-gradient(135deg, var(--color-accent), #26c6da);
        box-shadow: 0 4px 16px rgba(0, 188, 212, 0.3);
      }

      .ocean-theme textarea,
      .ocean-theme input {
        background: rgba(255, 255, 255, 0.8);
        border: 2px solid rgba(0, 105, 148, 0.3);
        color: var(--color-text);
      }

      .ocean-theme textarea:focus,
      .ocean-theme input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(0, 105, 148, 0.15);
      }

      .ocean-theme #outputBox,
      .ocean-theme #quickOutput {
        background: rgba(240, 248, 255, 0.8);
        border: 1px solid rgba(0, 105, 148, 0.2);
      }
    `;
  }

  getRoseStyles() {
    return `
      .rose-theme {
        background: 
          linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%),
          radial-gradient(ellipse at top, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
      }

      .rose-theme .popup-container,
      .rose-theme .quick-actions,
      .rose-theme .input-section,
      .rose-theme .output-section {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(212, 99, 122, 0.2);
        box-shadow: 
          0 8px 32px rgba(212, 99, 122, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      .rose-theme .popup-header,
      .rose-theme .app-header {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primaryLight));
        box-shadow: 
          0 8px 32px rgba(212, 99, 122, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .rose-theme button {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primaryLight));
        border: none;
        color: white;
        box-shadow: 0 4px 16px rgba(212, 99, 122, 0.3);
      }

      .rose-theme button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(212, 99, 122, 0.4);
      }

      .rose-theme .secondary-btn {
        background: linear-gradient(135deg, var(--color-accent), #f472b6);
        box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
      }

      .rose-theme textarea,
      .rose-theme input {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(212, 99, 122, 0.3);
        color: var(--color-text);
      }

      .rose-theme textarea:focus,
      .rose-theme input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(212, 99, 122, 0.15);
      }

      .rose-theme #outputBox,
      .rose-theme #quickOutput {
        background: rgba(253, 242, 248, 0.8);
        border: 1px solid rgba(212, 99, 122, 0.2);
      }
    `;
  }

  getDefaultStyles() {
    return `
      /* Default theme styles */
    `;
  }

  createThemeStyles() {
    const baseStyles = `
      :root {
        --color-primary: ${this.themes[this.currentTheme].colors.primary};
        --color-primaryDark: ${this.themes[this.currentTheme].colors.primaryDark};
        --color-primaryLight: ${this.themes[this.currentTheme].colors.primaryLight};
        --color-background: ${this.themes[this.currentTheme].colors.background};
        --color-surface: ${this.themes[this.currentTheme].colors.surface};
        --color-text: ${this.themes[this.currentTheme].colors.text};
        --color-textLight: ${this.themes[this.currentTheme].colors.textLight};
        --color-accent: ${this.themes[this.currentTheme].colors.accent};
        --color-success: ${this.themes[this.currentTheme].colors.success};
        --color-warning: ${this.themes[this.currentTheme].colors.warning};
        --color-error: ${this.themes[this.currentTheme].colors.error};
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.className = 'theme-base-styles';
    styleElement.textContent = baseStyles;
    document.head.appendChild(styleElement);
  }

  notifyThemeChange(themeName) {
    // Dispatch custom event for theme change
    const event = new CustomEvent('themeChanged', {
      detail: { 
        theme: themeName, 
        colors: this.themes[themeName].colors 
      }
    });
    document.dispatchEvent(event);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      name: this.themes[key].name,
      colors: this.themes[key].colors
    }));
  }

  createThemePreview(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return null;

    const preview = document.createElement('div');
    preview.className = 'theme-preview';
    preview.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      background: ${theme.colors.surface};
      border: 2px solid ${theme.colors.primary};
      color: ${theme.colors.text};
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 500;
    `;

    preview.innerHTML = `
      <div style="
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
      "></div>
      <span>${theme.name}</span>
    `;

    preview.addEventListener('mouseenter', () => {
      preview.style.transform = 'scale(1.05)';
      preview.style.boxShadow = `0 4px 16px ${theme.colors.primary}40`;
    });

    preview.addEventListener('mouseleave', () => {
      preview.style.transform = 'scale(1)';
      preview.style.boxShadow = 'none';
    });

    return preview;
  }
}

// Create global theme manager instance
const themeManager = new ThemeManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = themeManager;
}

export default themeManager;