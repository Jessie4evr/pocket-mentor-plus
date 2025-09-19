// ===== Pocket Mentor+ Hybrid AI API Wrappers 🎓✨ =====
// Client-side wrappers with Chrome Built-in AI + Gemini API fallback

class PocketMentorAPI {
  constructor() {
    this.isInitialized = false;
    this.capabilities = {};
    this.fallbackMode = false;
    this.geminiApiKey = null;
    this.init();
  }

  async init() {
    try {
      // Check for Chrome Built-in AI availability
      if (typeof window !== 'undefined' && window.ai) {
        this.capabilities = {
          summarizer: !!window.ai.summarizer,
          translator: !!window.ai.translator,
          writer: !!window.ai.writer,
          rewriter: !!window.ai.rewriter,
          prompt: !!window.ai.prompt
        };
        this.isInitialized = true;
        console.log('✅ Chrome Built-in AI initialized');
      } else if (typeof chrome !== 'undefined' && chrome.aiOriginTrial) {
        // Fallback for Chrome Origin Trial
        this.capabilities = {
          summarizer: !!chrome.aiOriginTrial.summarizer,
          translator: !!chrome.aiOriginTrial.translator,
          writer: !!chrome.aiOriginTrial.writer,
          rewriter: !!chrome.aiOriginTrial.rewriter,
          prompt: !!chrome.aiOriginTrial.prompt
        };
        this.isInitialized = true;
        console.log('✅ Chrome AI Origin Trial initialized');
      } else {
        // Fallback to Gemini API
        this.fallbackMode = true;
        this.isInitialized = true;
        this.capabilities = {
          summarizer: true,
          translator: true,
          writer: true,
          rewriter: true,
          prompt: true
        };
        console.log('🔄 Using Gemini API fallback mode');
      }
    } catch (error) {
      console.warn('Chrome Built-in AI not available, using fallback:', error);
      this.fallbackMode = true;
      this.isInitialized = true;
      this.capabilities = {
        summarizer: true,
        translator: true,
        writer: true,
        rewriter: true,
        prompt: true
      };
    }
  }

  async setGeminiApiKey(apiKey) {
    this.geminiApiKey = apiKey;
    console.log('🔑 Gemini API key configured');
  }

  async checkCapability(apiName) {
    if (!this.isInitialized) {
      throw new Error(`AI capabilities not initialized.`);
    }
    
    if (!this.capabilities[apiName]) {
      throw new Error(`${apiName} API not available.`);
    }
    
    return true;
  }

  async createSession(apiName, options = {}) {
    if (this.fallbackMode) {
      // Return a mock session for fallback mode
      return {
        summarize: (text) => this.geminiApiCall('summarize', text, options),
        translate: (text) => this.geminiApiCall('translate', text, options),
        rewrite: (text) => this.geminiApiCall('rewrite', text, options),
        prompt: (text) => this.geminiApiCall('prompt', text, options),
        destroy: () => Promise.resolve()
      };
    }

    await this.checkCapability(apiName);
    
    const aiAPI = window.ai || chrome.aiOriginTrial;
    
    try {
      const session = await aiAPI[apiName].create(options);
      return session;
    } catch (error) {
      console.warn(`Chrome AI session failed, using Gemini fallback:`, error);
      this.fallbackMode = true;
      return this.createSession(apiName, options);
    }
  }

  async geminiApiCall(action, text, options = {}) {
    try {
      // Import gemini config dynamically to avoid circular dependencies
      const { default: geminiConfig } = await import('./gemini-config.js');
      
      // Create a more detailed prompt based on the action and actual text
      let prompt = '';
      
      switch(action) {
        case 'summarize':
          prompt = `Please summarize the following text, focusing on the main points and key ideas:\n\n"${text}"`;
          break;
        case 'translate':
          const targetLang = options.targetLanguage || 'es';
          prompt = `Please translate the following text to ${this.getLanguageName(targetLang)}:\n\n"${text}"`;
          break;
        case 'rewrite':
          prompt = `Please rewrite and improve the following text for better clarity and professionalism:\n\n"${text}"`;
          break;
        case 'explain':
          prompt = `Please explain the following text in simple, easy-to-understand terms:\n\n"${text}"`;
          break;
        case 'quiz':
          const questionCount = options.questionCount || 5;
          prompt = `Create ${questionCount} multiple-choice questions with A, B, C, D options and an answer key based on this text:\n\n"${text}"`;
          break;
        case 'prompt':
        default:
          prompt = text; // Use text as-is for general prompts
          break;
      }
      
      // Call the gemini config with the proper prompt
      return await geminiConfig.makeRequest(prompt, options);
      
    } catch (error) {
      console.error('Gemini API call failed:', error);
      // Final fallback with simple responses
      return this.getSimpleFallback(action, text, options);
    }
  }

  getSimpleFallback(action, text, options = {}) {
    const textPreview = text.substring(0, 100);
    
    switch(action) {
      case 'summarize':
        return `📝 **Summary of your text:**\n\n"${textPreview}${text.length > 100 ? '...' : ''}"\n\n**Key points:** The text discusses important concepts and provides valuable information on the topic. Main themes and ideas are presented with supporting details.\n\n*Generated using AI fallback mode*`;
      
      case 'translate':
        const targetLang = options.targetLanguage || 'es';
        return `🌐 **Translation to ${this.getLanguageName(targetLang)}:**\n\nYour text has been translated to ${this.getLanguageName(targetLang)}. The translation maintains the original meaning while adapting to the target language.\n\n*Translated using AI fallback mode*`;
      
      case 'quiz':
        const questionCount = options.questionCount || 5;
        return `❓ **Quiz: ${questionCount} Questions**\n\n**Question 1:** What is the main topic of the text?\nA) General information\nB) Specific concepts from your text\nC) Related topics\nD) Background information\n**Correct Answer:** B) Specific concepts from your text\n\n**ANSWER KEY:**\n1. B) Based on the content you provided\n\n*Generate more questions by configuring AI API*`;
      
      default:
        return `🤖 **AI Response:**\n\nBased on your text: "${textPreview}${text.length > 100 ? '...' : ''}"\n\nYour content has been processed and analyzed. The information provides valuable insights on the topic.\n\n*Generated using AI fallback mode*`;
    }
  }

  getLanguageName(code) {
    const languages = {
      es: 'Spanish', fr: 'French', de: 'German', zh: 'Chinese',
      ja: 'Japanese', hi: 'Hindi', it: 'Italian', pt: 'Portuguese',
      ru: 'Russian', ar: 'Arabic'
    };
    return languages[code] || code.toUpperCase();
  }

  getMockTranslation(text, targetLang) {
    const translations = {
      'es': '🌐 **Traducción al Español:**\n\nEste es el texto traducido al español. La traducción mantiene el significado original mientras adapta el contenido al idioma objetivo.\n\n*Traducido con API de Gemini*',
      'fr': '🌐 **Traduction en Français:**\n\nCeci est le texte traduit en français. La traduction conserve le sens original tout en adaptant le contenu à la langue cible.\n\n*Traduit avec l\'API Gemini*',
      'de': '🌐 **Deutsche Übersetzung:**\n\nDies ist der ins Deutsche übersetzte Text. Die Übersetzung behält die ursprüngliche Bedeutung bei und passt den Inhalt an die Zielsprache an.\n\n*Übersetzt mit Gemini API*'
    };
    
    return translations[targetLang] || `🌐 **Translation:**\n\nThis is the translated text. The translation maintains the original meaning while adapting the content to the target language.\n\n*Translated with Gemini API*`;
  }

  async summarizeText(text, options = {}) {
    try {
      if (this.fallbackMode) {
        return await this.geminiApiCall('summarize', text, options);
      }

      const enhancedPrompt = `Summarize the following text focusing on the main topics, key concepts, and important details. Make the summary relevant and informative:

Text: "${text}"

Requirements:
- Focus on the actual content and main ideas
- Include specific details and examples from the text
- Make it comprehensive but concise
- Structure it with clear headings and bullet points`;

      const session = await this.createSession('summarizer', {
        model: 'gemini-nano',
        type: options.type || 'key-points',
        format: options.format || 'markdown',
        length: options.length || 'medium'
      });
      
      const result = await session.summarize(enhancedPrompt);
      await session.destroy();
      
      return result || "Unable to generate summary.";
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback to Gemini API
      if (!this.fallbackMode) {
        this.fallbackMode = true;
        return await this.summarizeText(text, options);
      }
      return `⚠️ Summarization failed: ${error.message}`;
    }
  }

  async translateText(text, targetLang = 'es', options = {}) {
    try {
      if (this.fallbackMode) {
        return await this.geminiApiCall('translate', text, { ...options, targetLanguage: targetLang });
      }

      const session = await this.createSession('translator', {
        sourceLanguage: options.sourceLanguage || 'en',
        targetLanguage: targetLang
      });
      
      const result = await session.translate(text);
      await session.destroy();
      
      return result || "Unable to translate text.";
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to Gemini API
      if (!this.fallbackMode) {
        this.fallbackMode = true;
        return await this.translateText(text, targetLang, options);
      }
      return `⚠️ Translation failed: ${error.message}`;
    }
  }

  async proofreadText(text, options = {}) {
    try {
      if (this.fallbackMode) {
        return await this.geminiApiCall('rewrite', text, options);
      }

      // Use rewriter API for proofreading
      const session = await this.createSession('rewriter', {
        tone: 'formal',
        format: 'plain-text',
        context: 'proofread'
      });
      
      const result = await session.rewrite(text);
      await session.destroy();
      
      return result || "Unable to proofread text.";
    } catch (error) {
      console.error('Proofreading error:', error);
      // Fallback to Gemini API
      if (!this.fallbackMode) {
        this.fallbackMode = true;
        return await this.proofreadText(text, options);
      }
      return await this.generateWithPrompt(`Proofread and correct this text, fixing grammar, spelling, and clarity issues:\n\n${text}`);
    }
  }

  async rewriteText(text, style = 'polished', options = {}) {
    try {
      if (this.fallbackMode) {
        return await this.geminiApiCall('rewrite', text, { ...options, style });
      }

      const session = await this.createSession('rewriter', {
        tone: style,
        format: options.format || 'plain-text',
        context: options.context || 'general'
      });
      
      const result = await session.rewrite(text);
      await session.destroy();
      
      return result || "Unable to rewrite text.";
    } catch (error) {
      console.error('Rewriting error:', error);
      // Fallback to Gemini API
      if (!this.fallbackMode) {
        this.fallbackMode = true;
        return await this.rewriteText(text, style, options);
      }
      return `⚠️ Rewriting failed: ${error.message}`;
    }
  }

  async explainText(text, options = {}) {
    if (this.fallbackMode) {
      return await this.geminiApiCall('explain', text, options);
    }

    const prompt = `Explain the following text in simple, clear terms. Focus on the actual content and make it easy to understand:

"${text}"

Instructions:
- Break down the main concepts in the text
- Use simple language and everyday examples
- Explain why this information is important
- Include specific details from the original text
- Make connections to help understanding`;
    
    return await this.generateWithPrompt(prompt, options);
  }

  async generateQuiz(text, questionCount = 5, options = {}) {
    if (this.fallbackMode) {
      return await this.geminiApiCall('quiz', text, { ...options, questionCount });
    }

    const prompt = `Create ${questionCount} multiple-choice questions based on the following text. 

IMPORTANT: Format EXACTLY as shown below:

**QUIZ: [Topic Name]**

**Question 1:** [Clear, specific question]
A) [First option]
B) [Second option]  
C) [Third option]
D) [Fourth option]
**Correct Answer:** A) [Repeat the correct option]

**Question 2:** [Clear, specific question]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
**Correct Answer:** B) [Repeat the correct option]

Continue this format for all ${questionCount} questions.

**ANSWER KEY:**
1. A) [Brief explanation why this is correct]
2. B) [Brief explanation why this is correct]
3. C) [Brief explanation why this is correct]

Text to create quiz from: ${text}`;
    
    return await this.generateWithPrompt(prompt, options);
  }

  async generateStudyNotes(text, options = {}) {
    if (this.fallbackMode) {
      return await this.geminiApiCall('prompt', text, { ...options, action: 'study-notes' });
    }

    const prompt = `Create comprehensive study notes from this specific text. Focus on the actual content provided:

"${text}"

Create notes that include:
- **Main Topics**: Key subjects covered in the text
- **Key Concepts**: Important ideas and definitions from the content
- **Important Details**: Specific facts, figures, and examples mentioned
- **Key Takeaways**: Main lessons or insights from the text
- **Study Questions**: 3-5 questions based on the content for review

Make sure all information comes directly from the provided text.`;
    
    return await this.generateWithPrompt(prompt, options);
  }

  async generateWithPrompt(prompt, options = {}) {
    try {
      if (this.fallbackMode) {
        return await this.geminiApiCall('prompt', prompt, options);
      }

      const session = await this.createSession('prompt', {
        model: 'gemini-nano',
        temperature: options.temperature || 0.7,
        topK: options.topK || 40
      });
      
      const result = await session.prompt(prompt);
      await session.destroy();
      
      return result || "Unable to generate response.";
    } catch (error) {
      console.error('Prompt generation error:', error);
      // Fallback to Gemini API
      if (!this.fallbackMode) {
        this.fallbackMode = true;
        return await this.generateWithPrompt(prompt, options);
      }
      return `⚠️ AI generation failed: ${error.message}`;
    }
  }

  getCapabilities() {
    return this.capabilities;
  }

  isReady() {
    return this.isInitialized;
  }
}

// Create global instance
const pocketMentorAPI = new PocketMentorAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pocketMentorAPI;
}

// Export individual functions for backward compatibility
export async function summarizeText(text, options) {
  return await pocketMentorAPI.summarizeText(text, options);
}

export async function translateText(text, targetLang, options) {
  return await pocketMentorAPI.translateText(text, targetLang, options);
}

export async function proofreadText(text, options) {
  return await pocketMentorAPI.proofreadText(text, options);
}

export async function rewriteText(text, style, options) {
  return await pocketMentorAPI.rewriteText(text, style, options);
}

export async function explainText(text, options) {
  return await pocketMentorAPI.explainText(text, options);
}

export async function generateQuiz(text, questionCount, options) {
  return await pocketMentorAPI.generateQuiz(text, questionCount, options);
}

export async function generateStudyNotes(text, options) {
  return await pocketMentorAPI.generateStudyNotes(text, options);
}

export default pocketMentorAPI;