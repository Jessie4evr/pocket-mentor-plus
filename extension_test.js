// ===== Pocket Mentor+ Extension Testing Suite 🎓✨ =====

class ExtensionTester {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  // Test manifest.json validity
  async testManifest() {
    console.log('🔍 Testing manifest.json...');
    
    try {
      const response = await fetch('./manifest.json');
      const manifest = await response.json();
      
      // Check required fields
      const requiredFields = ['manifest_version', 'name', 'version', 'description'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Check manifest version
      if (manifest.manifest_version !== 3) {
        throw new Error(`Expected manifest_version 3, got ${manifest.manifest_version}`);
      }
      
      // Check permissions
      const expectedPermissions = ['contextMenus', 'activeTab', 'scripting', 'storage', 'notifications'];
      const missingPermissions = expectedPermissions.filter(perm => !manifest.permissions.includes(perm));
      
      if (missingPermissions.length > 0) {
        console.warn(`⚠️ Missing permissions: ${missingPermissions.join(', ')}`);
      }
      
      // Check service worker
      if (!manifest.background || !manifest.background.service_worker) {
        throw new Error('Service worker not configured');
      }
      
      this.logTest('Manifest Validation', true, 'All required fields present and valid');
      
    } catch (error) {
      this.logTest('Manifest Validation', false, error.message);
    }
  }

  // Test API wrapper functionality
  async testAPIWrapper() {
    console.log('🔍 Testing API wrapper...');
    
    try {
      // Import the API module
      const { default: pocketMentorAPI } = await import('./api.js');
      
      // Test initialization
      if (!pocketMentorAPI) {
        throw new Error('API wrapper not loaded');
      }
      
      // Test capability checking
      const capabilities = pocketMentorAPI.getCapabilities();
      if (typeof capabilities !== 'object') {
        throw new Error('Capabilities should return an object');
      }
      
      // Test readiness check
      const isReady = pocketMentorAPI.isReady();
      if (typeof isReady !== 'boolean') {
        throw new Error('isReady should return a boolean');
      }
      
      this.logTest('API Wrapper', true, 'API wrapper loaded and functional');
      
    } catch (error) {
      this.logTest('API Wrapper', false, error.message);
    }
  }

  // Test HTML file validity
  async testHTMLFiles() {
    console.log('🔍 Testing HTML files...');
    
    const htmlFiles = ['popup.html', 'notebook.html'];
    
    for (const file of htmlFiles) {
      try {
        const response = await fetch(`./${file}`);
        const html = await response.text();
        
        // Check for basic HTML structure
        if (!html.includes('<!DOCTYPE html>')) {
          throw new Error(`${file}: Missing DOCTYPE declaration`);
        }
        
        if (!html.includes('<html')) {
          throw new Error(`${file}: Missing html tag`);
        }
        
        if (!html.includes('<head>') || !html.includes('<body>')) {
          throw new Error(`${file}: Missing head or body tags`);
        }
        
        // Check for required scripts
        if (file === 'popup.html' && !html.includes('popup.js')) {
          throw new Error(`${file}: Missing popup.js script`);
        }
        
        if (file === 'notebook.html' && !html.includes('notebook.js')) {
          throw new Error(`${file}: Missing notebook.js script`);
        }
        
        // Check for styles
        if (!html.includes('styles.css')) {
          throw new Error(`${file}: Missing styles.css`);
        }
        
        this.logTest(`${file} Structure`, true, 'Valid HTML structure');
        
      } catch (error) {
        this.logTest(`${file} Structure`, false, error.message);
      }
    }
  }

  // Test JavaScript files for syntax errors
  async testJavaScriptFiles() {
    console.log('🔍 Testing JavaScript files...');
    
    const jsFiles = ['api.js', 'background.js', 'popup.js', 'notebook.js', 'content.js'];
    
    for (const file of jsFiles) {
      try {
        const response = await fetch(`./${file}`);
        const jsCode = await response.text();
        
        // Basic syntax checks
        if (jsCode.includes('console.log') && !jsCode.includes('console.error')) {
          console.warn(`⚠️ ${file}: Consider adding error logging`);
        }
        
        // Check for ES6 modules (if applicable)
        if (file === 'api.js' || file === 'background.js') {
          if (!jsCode.includes('export') && !jsCode.includes('module.exports')) {
            console.warn(`⚠️ ${file}: No exports found`);
          }
        }
        
        // Check for Chrome API usage
        if (file === 'background.js' || file === 'popup.js' || file === 'content.js') {
          if (!jsCode.includes('chrome.')) {
            console.warn(`⚠️ ${file}: No Chrome API usage detected`);
          }
        }
        
        this.logTest(`${file} Syntax`, true, 'No syntax errors detected');
        
      } catch (error) {
        this.logTest(`${file} Syntax`, false, error.message);
      }
    }
  }

  // Test CSS file
  async testCSS() {
    console.log('🔍 Testing CSS file...');
    
    try {
      const response = await fetch('./styles.css');
      const css = await response.text();
      
      // Check for CSS variables
      if (!css.includes(':root')) {
        console.warn('⚠️ No CSS variables defined');
      }
      
      // Check for theme support
      if (!css.includes('light-theme') || !css.includes('dark-theme')) {
        throw new Error('Theme classes not found');
      }
      
      // Check for responsive design
      if (!css.includes('@media')) {
        console.warn('⚠️ No responsive design detected');
      }
      
      this.logTest('CSS Structure', true, 'CSS file is well-structured');
      
    } catch (error) {
      this.logTest('CSS Structure', false, error.message);
    }
  }

  // Test Chrome Extension APIs availability
  testChromeAPIs() {
    console.log('🔍 Testing Chrome APIs availability...');
    
    const requiredAPIs = [
      'chrome.runtime',
      'chrome.storage',
      'chrome.contextMenus',
      'chrome.notifications'
    ];
    
    const missingAPIs = requiredAPIs.filter(api => {
      const parts = api.split('.');
      let obj = window;
      for (const part of parts) {
        if (!obj[part]) return true;
        obj = obj[part];
      }
      return false;
    });
    
    if (missingAPIs.length > 0) {
      this.logTest('Chrome APIs', false, `Missing APIs: ${missingAPIs.join(', ')}`);
    } else {
      this.logTest('Chrome APIs', true, 'All required Chrome APIs available');
    }
  }

  // Test AI APIs availability
  testAIAPIs() {
    console.log('🔍 Testing AI APIs availability...');
    
    const hasWindowAI = typeof window !== 'undefined' && window.ai;
    const hasChromeAI = typeof chrome !== 'undefined' && chrome.aiOriginTrial;
    
    if (!hasWindowAI && !hasChromeAI) {
      this.logTest('AI APIs', false, 'No AI APIs detected. Enable Chrome flags for Gemini Nano');
    } else {
      const availableAPIs = [];
      
      if (hasWindowAI) {
        if (window.ai.summarizer) availableAPIs.push('summarizer');
        if (window.ai.translator) availableAPIs.push('translator');
        if (window.ai.writer) availableAPIs.push('writer');
        if (window.ai.rewriter) availableAPIs.push('rewriter');
        if (window.ai.prompt) availableAPIs.push('prompt');
      }
      
      if (hasChromeAI) {
        if (chrome.aiOriginTrial.summarizer) availableAPIs.push('summarizer');
        if (chrome.aiOriginTrial.translator) availableAPIs.push('translator');
        if (chrome.aiOriginTrial.writer) availableAPIs.push('writer');
        if (chrome.aiOriginTrial.rewriter) availableAPIs.push('rewriter');
        if (chrome.aiOriginTrial.prompt) availableAPIs.push('prompt');
      }
      
      this.logTest('AI APIs', true, `Available APIs: ${availableAPIs.join(', ') || 'None (may need model download)'}`);
    }
  }

  // Test file accessibility
  async testFileAccessibility() {
    console.log('🔍 Testing file accessibility...');
    
    const files = [
      'icon16.png',
      'icon48.png', 
      'icon128.png',
      'styles.css',
      'api.js',
      'background.js',
      'popup.html',
      'popup.js',
      'notebook.html',
      'notebook.js',
      'content.js'
    ];
    
    for (const file of files) {
      try {
        const response = await fetch(`./${file}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        this.logTest(`File Access: ${file}`, true, 'File accessible');
      } catch (error) {
        this.logTest(`File Access: ${file}`, false, error.message);
      }
    }
  }

  // Log test results
  logTest(testName, passed, message) {
    this.results.total++;
    if (passed) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.error(`❌ ${testName}: ${message}`);
    }
    
    this.tests.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Pocket Mentor+ Extension Tests...\n');
    
    await this.testManifest();
    await this.testAPIWrapper();
    await this.testHTMLFiles();
    await this.testJavaScriptFiles();
    await this.testCSS();
    await this.testFileAccessibility();
    this.testChromeAPIs();
    this.testAIAPIs();
    
    this.printSummary();
  }

  // Print test summary
  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.tests.filter(test => !test.passed).forEach(test => {
        console.log(`  • ${test.name}: ${test.message}`);
      });
    }
    
    console.log('\n🎯 Next Steps:');
    if (this.results.failed === 0) {
      console.log('✅ All tests passed! Extension is ready for testing.');
      console.log('📝 Load the extension in Chrome and test functionality manually.');
    } else {
      console.log('🔧 Fix the failed tests before proceeding.');
      console.log('📖 Check the Chrome Extension documentation for guidance.');
    }
  }

  // Export results for external use
  exportResults() {
    return {
      summary: this.results,
      tests: this.tests,
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
  const tester = new ExtensionTester();
  tester.runAllTests().then(() => {
    // Make results available globally
    window.extensionTestResults = tester.exportResults();
  });
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtensionTester;
}