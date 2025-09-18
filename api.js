// ===== Pocket Mentor+ API Wrappers 🎓✨ =====
// Client-side wrappers for Chrome Built-in AI APIs (Gemini Nano)

class PocketMentorAPI {
  constructor() {
    this.isInitialized = false;
    this.capabilities = {};
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
      }
    } catch (error) {
      console.warn('Chrome Built-in AI not available:', error);
      this.isInitialized = false;
    }
  }

  async checkCapability(apiName) {
    if (!this.isInitialized) {
      throw new Error(`AI capabilities not initialized. Please ensure Chrome Built-in AI is enabled.`);
    }
    
    if (!this.capabilities[apiName]) {
      throw new Error(`${apiName} API not available. Please check Chrome flags and AI model status.`);
    }
    
    return true;
  }

  async createSession(apiName, options = {}) {
    await this.checkCapability(apiName);
    
    const aiAPI = window.ai || chrome.aiOriginTrial;
    
    try {
      const session = await aiAPI[apiName].create(options);
      return session;
    } catch (error) {
      throw new Error(`Failed to create ${apiName} session: ${error.message}`);
    }
  }

  async summarizeText(text, options = {}) {
    try {
      const session = await this.createSession('summarizer', {
        model: 'gemini-nano',
        type: options.type || 'key-points',
        format: options.format || 'markdown',
        length: options.length || 'medium'
      });
      
      const result = await session.summarize(text);
      await session.destroy();
      
      return result || "Unable to generate summary.";
    } catch (error) {
      console.error('Summarization error:', error);
      return `⚠️ Summarization failed: ${error.message}`;
    }
  }

  async translateText(text, targetLang = 'es', options = {}) {
    try {
      const session = await this.createSession('translator', {
        sourceLanguage: options.sourceLanguage || 'en',
        targetLanguage: targetLang
      });
      
      const result = await session.translate(text);
      await session.destroy();
      
      return result || "Unable to translate text.";
    } catch (error) {
      console.error('Translation error:', error);
      return `⚠️ Translation failed: ${error.message}`;
    }
  }

  async proofreadText(text, options = {}) {
    try {
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
      // Fallback to prompt API
      return await this.generateWithPrompt(`Proofread and correct this text, fixing grammar, spelling, and clarity issues:\n\n${text}`);
    }
  }

  async rewriteText(text, style = 'polished', options = {}) {
    try {
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
      return `⚠️ Rewriting failed: ${error.message}`;
    }
  }

  async explainText(text, options = {}) {
    const prompt = `Explain the following text in simple, clear terms that anyone can understand. Break down complex concepts and provide context where helpful:\n\n${text}`;
    return await this.generateWithPrompt(prompt, options);
  }

  async generateQuiz(text, questionCount = 3, options = {}) {
    const prompt = `Create ${questionCount} multiple-choice questions based on the following text. Format as:

Q1: [Question]
A) [Option A]
B) [Option B]  
C) [Option C]
D) [Option D]
Correct: [Letter]

Text: ${text}`;
    
    return await this.generateWithPrompt(prompt, options);
  }

  async generateStudyNotes(text, options = {}) {
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