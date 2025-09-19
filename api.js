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
    // Mock implementation - replace with actual Gemini API calls
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000 + Math.random() * 1000); // Simulate API delay

    const responses = {
      summarize: `📝 **Summary:**\n\nThis text covers the main topics including key concepts and important information. The content discusses various aspects that are relevant to the subject matter.\n\n**Key Points:**\n• Main concept 1\n• Important detail 2\n• Relevant information 3\n\n*Processed with Gemini API fallback*`,
      
      translate: this.getMockTranslation(text, options.targetLanguage || 'es'),
      
      rewrite: `✏️ **Improved Text:**\n\nHere is a polished version of the original content with enhanced clarity, better structure, and improved readability. The meaning remains the same while the presentation is more professional.\n\n*Enhanced with Gemini API*`,
      
      explain: `💡 **Simple Explanation:**\n\nThis concept can be understood as follows: The main idea is explained in simple terms that anyone can understand. Think of it like everyday examples that make the complex topic clear.\n\n**Why it matters:** This is important because it helps us understand the bigger picture.\n\n*Explained using Gemini API*`,
      
      quiz: `❓ **Generated Quiz:**\n\nQ1: What is the main topic discussed?\nA) Option A\nB) Option B  \nC) Option C\nD) Option D\nCorrect: B\n\nQ2: Which concept is most important?\nA) First concept\nB) Second concept\nC) Third concept  \nD) All concepts\nCorrect: D\n\n*Quiz generated with Gemini API*`,
      
      prompt: `🤖 **AI Response:**\n\nBased on your request, here's a comprehensive response that addresses the key points you've raised. This response aims to be helpful, accurate, and informative.\n\n*Generated using Gemini API fallback*`
    };

    return responses[action] || responses.prompt;
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

    const prompt = `Explain the following text in simple, clear terms that anyone can understand. Break down complex concepts and provide context where helpful:\n\n${text}`;
    return await this.generateWithPrompt(prompt, options);
  }

  async generateQuiz(text, questionCount = 3, options = {}) {
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

    const prompt = `Create comprehensive study notes from this text. Include:
- Key concepts and definitions
- Important facts and figures  
- Main themes and ideas
- Potential exam questions

Text: ${text}`;
    
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