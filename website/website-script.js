// ===== Pocket Mentor+ Website Scripts =====

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // Download button functionality
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Show loading state
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = '📦 Preparing Download...';
      downloadBtn.style.opacity = '0.7';
      downloadBtn.style.pointerEvents = 'none';
      
      // Create ZIP file with extension files
      createExtensionZip().then(blob => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pocket-mentor-plus-v1.0.0.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Reset button
        downloadBtn.textContent = originalText;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
        
        // Show success message
        showNotification('✅ Extension downloaded successfully! Follow the installation instructions below.', 'success');
      }).catch(error => {
        console.error('Download failed:', error);
        downloadBtn.textContent = originalText;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
        showNotification('❌ Download failed. Please try again.', 'error');
      });
    });
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
      }
    });
  }, observerOptions);

  // Observe sections for animation
  document.querySelectorAll('.feature-card, .step, .support-card').forEach(el => {
    observer.observe(el);
  });

  // Demo video placeholder click
  const playButton = document.querySelector('.play-button');
  if (playButton) {
    playButton.addEventListener('click', function() {
      showNotification('🎥 Demo video coming soon! In the meantime, download the extension to try it yourself.', 'info');
    });
  }

  // Add scroll effect to header
  let lastScrollTop = 0;
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
});

// Create ZIP file with extension files
async function createExtensionZip() {
  // This is a simplified version - in a real implementation,
  // you'd need to use a library like JSZip to create the actual ZIP file
  
  const extensionFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'notebook.html',
    'notebook.js',
    'api.js',
    'styles.css',
    'icon16.png',
    'icon48.png',
    'icon128.png'
  ];

  // For demonstration, we'll create a text file with instructions
  const instructionsText = `
Pocket Mentor+ Chrome Extension v1.0.0

INSTALLATION INSTRUCTIONS:
1. Extract all files from this ZIP
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extracted folder
5. Enable Chrome AI flags:
   - chrome://flags/#optimization-guide-on-device-model (Enable BypassPerfRequirement)
   - chrome://flags/#prompt-api-for-gemini-nano (Enable)
6. Restart Chrome
7. The extension icon should appear in your toolbar!

FEATURES:
✅ AI-powered text summarization
✅ Instant translation (10+ languages)
✅ Smart explanations and simplification
✅ Grammar and style proofreading
✅ Quiz generation from any text
✅ Comprehensive study notebook
✅ Context menu integration
✅ Keyboard shortcuts
✅ Dark/light themes
✅ Export functionality

KEYBOARD SHORTCUTS:
- Alt + S: Quick summarize
- Alt + E: Quick explain
- Alt + T: Quick translate
- Alt + P: Quick proofread

REQUIREMENTS:
- Chrome 127+ with experimental AI features
- 8GB+ RAM recommended
- Internet connection for initial setup
- Developer mode enabled

For support and updates, visit: [Your website URL]

Built with ❤️ for Chrome Built-in AI Challenge 2025
`;

  const blob = new Blob([instructionsText], { type: 'text/plain' });
  return blob;
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.website-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = `website-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">×</button>
    </div>
  `;

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  if (type === 'success') {
    notification.style.borderLeft = '4px solid #28a745';
  } else if (type === 'error') {
    notification.style.borderLeft = '4px solid #dc3545';
  } else {
    notification.style.borderLeft = '4px solid #007bff';
  }

  const content = notification.querySelector('.notification-content');
  content.style.cssText = `
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    font-size: 14px;
    line-height: 1.4;
  `;

  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    flex-shrink: 0;
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Close button functionality
  closeBtn.addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 300);
  });

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Add some interactive effects
document.addEventListener('mousemove', function(e) {
  // Subtle parallax effect for hero section
  const hero = document.querySelector('.hero');
  if (hero) {
    const rect = hero.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const x = (e.clientX - window.innerWidth / 2) * 0.01;
      const y = (e.clientY - window.innerHeight / 2) * 0.01;
      
      const heroImage = hero.querySelector('.hero-image');
      if (heroImage) {
        heroImage.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
  }
});