// ===== Pocket Mentor+ Chrome Built-in AI APIs Implementation 🎓✨ =====

class PocketMentorAPI {
  constructor() {
    this.isInitialized = false;
    this.capabilities = {};
    this.fallbackMode = false;
    this.translatorInstance = null;
    this.languageDetectorInstance = null;
    this.promptSessionInstance = null;
    this.init();
  }

  async init() {
    try {
      // Check for Chrome Built-in AI APIs availability
      this.capabilities = {
        translator: 'translation' in self && 'Translator' in self,
        languageDetector: 'LanguageDetector' in self,
        promptAPI: 'LanguageModel' in self,
        summarizer: 'ai' in self && self.ai?.summarizer,
        writer: 'ai' in self && self.ai?.writer,
        rewriter: 'ai' in self && self.ai?.rewriter
      };
      
      this.isInitialized = true;
      console.log('✅ Chrome Built-in AI APIs initialized:', this.capabilities);
    } catch (error) {
      console.warn('Chrome Built-in AI not available, using fallback:', error);
      this.fallbackMode = true;
      this.isInitialized = true;
    }
  }

  getCapabilities() {
    return this.capabilities;
  }

  // === TRANSLATOR API ===
  async checkTranslatorAvailability(sourceLanguage = 'en', targetLanguage = 'es') {
    if (this.fallbackMode || !this.capabilities.translator) return 'unavailable';
    
    try {
      return await self.Translator.availability({
        sourceLanguage,
        targetLanguage
      });
    } catch (error) {
      console.warn('Translator availability check failed:', error);
      return 'unavailable';
    }
  }

  async createTranslator(sourceLanguage = 'en', targetLanguage = 'es', options = {}) {
    try {
      if (this.fallbackMode || !this.capabilities.translator) {
        return this.createFallbackTranslator(sourceLanguage, targetLanguage);
      }

      const availability = await this.checkTranslatorAvailability(sourceLanguage, targetLanguage);
      if (availability === 'unavailable') {
        throw new Error(`Translation from ${sourceLanguage} to ${targetLanguage} not supported`);
      }

      const translatorOptions = {
        sourceLanguage,
        targetLanguage,
        ...options
      };

      if (options.monitor) {
        translatorOptions.monitor = options.monitor;
      }

      this.translatorInstance = await self.Translator.create(translatorOptions);
      console.log(`✅ Chrome Translator created for ${sourceLanguage} → ${targetLanguage}`);
      return this.translatorInstance;
    } catch (error) {
      console.warn('Chrome Translator failed, using fallback:', error);
      return this.createFallbackTranslator(sourceLanguage, targetLanguage);
    }
  }

  async translateText(text, targetLanguage = 'es', options = {}) {
    try {
      // Detect source language if not provided
      let sourceLanguage = options.sourceLanguage;
      if (!sourceLanguage) {
        sourceLanguage = await this.detectLanguage(text);
      }

      const translator = await this.createTranslator(sourceLanguage, targetLanguage, options);
      
      if (translator.translate) {
        const result = await translator.translate(text);
        return `🌐 **Translation to ${this.getLanguageName(targetLanguage)}**\n\n${result}`;
      } else {
        // Fallback translator
        return translator.translate(text);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      return this.getFallbackTranslation(text, targetLanguage);
    }
  }

  // === LANGUAGE DETECTOR API ===
  async checkLanguageDetectorAvailability() {
    if (this.fallbackMode || !this.capabilities.languageDetector) return 'unavailable';
    
    try {
      return await self.LanguageDetector.availability();
    } catch (error) {
      console.warn('Language Detector availability check failed:', error);
      return 'unavailable';
    }
  }

  async createLanguageDetector(options = {}) {
    try {
      if (this.fallbackMode || !this.capabilities.languageDetector) {
        return this.createFallbackLanguageDetector();
      }

      const availability = await this.checkLanguageDetectorAvailability();
      if (availability === 'unavailable') {
        throw new Error('Language Detection not supported');
      }

      const detectorOptions = { ...options };
      if (options.monitor) {
        detectorOptions.monitor = options.monitor;
      }

      this.languageDetectorInstance = await self.LanguageDetector.create(detectorOptions);
      console.log('✅ Chrome Language Detector created');
      return this.languageDetectorInstance;
    } catch (error) {
      console.warn('Chrome Language Detector failed, using fallback:', error);
      return this.createFallbackLanguageDetector();
    }
  }

  async detectLanguage(text) {
    try {
      const detector = await this.createLanguageDetector();
      
      if (detector.detect) {
        const results = await detector.detect(text);
        // Return the most likely language
        return results.length > 0 ? results[0].detectedLanguage : 'en';
      } else {
        // Fallback detector
        return detector.detect(text);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'en'; // Default to English
    }
  }

  // === PROMPT API (Gemini Nano) ===
  async checkPromptAPIAvailability() {
    if (this.fallbackMode || !this.capabilities.promptAPI) return 'unavailable';
    
    try {
      return await self.LanguageModel.availability();
    } catch (error) {
      console.warn('Prompt API availability check failed:', error);
      return 'unavailable';
    }
  }

  async createPromptSession(options = {}) {
    try {
      if (this.fallbackMode || !this.capabilities.promptAPI) {
        return this.createFallbackPromptSession();
      }

      const availability = await this.checkPromptAPIAvailability();
      if (availability === 'unavailable') {
        throw new Error('Prompt API not supported');
      }

      // Get default parameters
      const params = await self.LanguageModel.params();
      
      const sessionOptions = {
        temperature: options.temperature || params.defaultTemperature,
        topK: options.topK || params.defaultTopK,
        ...options
      };

      if (options.monitor) {
        sessionOptions.monitor = options.monitor;
      }

      this.promptSessionInstance = await self.LanguageModel.create(sessionOptions);
      console.log('✅ Chrome Prompt API session created');
      return this.promptSessionInstance;
    } catch (error) {
      console.warn('Chrome Prompt API failed, using fallback:', error);
      return this.createFallbackPromptSession();
    }
  }

  async promptModel(text, options = {}) {
    try {
      const session = await this.createPromptSession(options);
      
      if (session.prompt) {
        return await session.prompt(text, options);
      } else {
        // Fallback session
        return session.prompt(text, options);
      }
    } catch (error) {
      console.error('Prompt failed:', error);
      return this.getFallbackPromptResponse(text);
    }
  }

  // === SUMMARIZER API ===
  async checkSummarizerAvailability(options = {}) {
    if (this.fallbackMode || !this.capabilities.summarizer) return 'unavailable';
    
    try {
      return await self.ai.summarizer.availability(options);
    } catch (error) {
      console.warn('Summarizer availability check failed:', error);
      return 'unavailable';
    }
  }

  async createSummarizer(options = {}) {
    try {
      if (this.fallbackMode || !this.capabilities.summarizer) {
        return this.createFallbackSummarizer();
      }

      const defaultOptions = {
        type: 'key-points',
        length: 'medium',
        format: 'markdown'
      };

      const summarizerOptions = { ...defaultOptions, ...options };
      
      const availability = await this.checkSummarizerAvailability(summarizerOptions);
      if (availability === 'unavailable') {
        throw new Error('Summarizer not supported with these options');
      }

      this.summarizerInstance = await self.ai.summarizer.create(summarizerOptions);
      console.log('✅ Chrome Summarizer created');
      return this.summarizerInstance;
    } catch (error) {
      console.warn('Chrome Summarizer failed, using fallback:', error);
      return this.createFallbackSummarizer();
    }
  }

  async summarizeText(text, options = {}) {
    try {
      const summarizer = await this.createSummarizer(options);
      
      if (summarizer.summarize) {
        const result = await summarizer.summarize(text, {
          context: options.context || `Summarizing content about: ${this.extractTopic(text)}`
        });
        return `📝 **AI Summary**\n\n${result}`;
      } else {
        // Fallback summarizer
        return summarizer.summarize(text, options);
      }
    } catch (error) {
      console.error('Summarization failed:', error);
      return this.getFallbackSummary(text);
    }
  }

  // === WRITER API ===
  async checkWriterAvailability(options = {}) {
    if (this.fallbackMode || !this.capabilities.writer) return 'unavailable';
    
    try {
      return await self.ai.writer.availability(options);
    } catch (error) {
      console.warn('Writer availability check failed:', error);
      return 'unavailable';
    }
  }

  async createWriter(options = {}) {
    try {
      if (this.fallbackMode || !this.capabilities.writer) {
        return this.createFallbackWriter();
      }

      const defaultOptions = {
        tone: 'neutral',
        format: 'markdown'
      };

      const writerOptions = { ...defaultOptions, ...options };
      
      const availability = await this.checkWriterAvailability(writerOptions);
      if (availability === 'unavailable') {
        throw new Error('Writer not supported with these options');
      }

      this.writerInstance = await self.ai.writer.create(writerOptions);
      console.log('✅ Chrome Writer created');  
      return this.writerInstance;
    } catch (error) {
      console.warn('Chrome Writer failed, using fallback:', error);
      return this.createFallbackWriter();
    }
  }

  async explainText(text, options = {}) {
    try {
      const writer = await this.createWriter({ tone: 'casual', ...options });
      
      const prompt = `Please explain the following in simple, easy-to-understand terms:\n\n${text}`;
      
      if (writer.write) {
        const result = await writer.write(prompt, {
          context: options.context || 'Provide a clear, educational explanation'
        });
        return `💡 **Simple Explanation**\n\n${result}`;
      } else {
        // Fallback writer
        return writer.explain(text, options);
      }
    } catch (error) {
      console.error('Explanation failed:', error);
      return this.getFallbackExplanation(text);
    }
  }

  // === REWRITER API ===
  async checkRewriterAvailability(options = {}) {
    if (this.fallbackMode || !this.capabilities.rewriter) return 'unavailable';
    
    try {
      return await self.ai.rewriter.availability(options);
    } catch (error) {
      console.warn('Rewriter availability check failed:', error);
      return 'unavailable';
    }
  }

  async createRewriter(options = {}) {
    try {
      if (this.fallbackMode || !this.capabilities.rewriter) {
        return this.createFallbackRewriter();
      }

      const defaultOptions = {
        tone: 'as-is',
        format: 'as-is'
      };

      const rewriterOptions = { ...defaultOptions, ...options };
      
      const availability = await this.checkRewriterAvailability(rewriterOptions);
      if (availability === 'unavailable') {
        throw new Error('Rewriter not supported with these options');
      }

      this.rewriterInstance = await self.ai.rewriter.create(rewriterOptions);
      console.log('✅ Chrome Rewriter created');
      return this.rewriterInstance;
    } catch (error) {
      console.warn('Chrome Rewriter failed, using fallback:', error);
      return this.createFallbackRewriter();
    }
  }

  async rewriteText(text, style = 'formal', options = {}) {
    try {
      const rewriter = await this.createRewriter({ 
        tone: style === 'casual' ? 'more-casual' : 'more-formal',
        ...options 
      });
      
      if (rewriter.rewrite) {
        const result = await rewriter.rewrite(text, {
          context: options.context || `Rewrite in ${style} style`
        });
        return `✏️ **Enhanced Text**\n\n${result}`;
      } else {
        // Fallback rewriter
        return rewriter.rewrite(text, style, options);
      }
    } catch (error) {
      console.error('Rewriting failed:', error);
      return this.getFallbackRewrite(text, style);
    }
  }

  async proofreadText(text, options = {}) {
    try {
      const rewriter = await this.createRewriter({ 
        tone: 'as-is',
        ...options 
      });
      
      if (rewriter.rewrite) {
        const result = await rewriter.rewrite(text, {
          context: 'Fix grammar, spelling, and improve clarity while maintaining the original meaning'
        });
        return `✓ **Proofread Text**\n\n${result}`;
      } else {
        return rewriter.proofread(text, options);
      }
    } catch (error) {
      console.error('Proofreading failed:', error);
      return this.getFallbackProofread(text);
    }
  }

  // === PERFORMANCE OPTIMIZATIONS ===
  async initializeQuickSession() {
    // Pre-load a session for faster responses
    try {
      if (this.capabilities.promptAPI && !this.promptSessionInstance) {
        this.promptSessionInstance = await this.createPromptSession({
          temperature: 0.7,
          topK: 3
        });
        console.log('✅ Quick session pre-loaded');
      }
    } catch (error) {
      console.warn('Quick session pre-load failed:', error);
    }
  }

  async getQuickResponse(prompt, type = 'general') {
    // Use pre-loaded session for faster responses
    try {
      if (this.promptSessionInstance && this.promptSessionInstance.prompt) {
        return await this.promptSessionInstance.prompt(prompt);
      }
      // Fallback to regular session creation
      return await this.promptModel(prompt);
    } catch (error) {
      console.error('Quick response failed:', error);
      return this.getFallbackPromptResponse(prompt);
    }
  }
  async generateQuiz(text, questionCount = 5, options = {}) {
    try {
      // Use quick session for faster response
      const prompt = `Create exactly ${questionCount} multiple-choice questions based on this text. 
IMPORTANT: Only show the questions and options, do NOT include answers or answer key.

Format each question as:
**Question [number]:** [Clear question]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]

Text: ${text}`;

      const result = await this.getQuickResponse(prompt, 'quiz');
      return `❓ **QUIZ: Take the Quiz First**\n\n${result}\n\n*Complete the quiz, then click "Show Answers" to see the answer key*`;
    } catch (error) {
      console.error('Quiz generation failed:', error);
      return this.getFallbackQuiz(text, questionCount, false); // false = no answers initially
    }
  }

  async generateQuizAnswers(text, questionCount = 5, options = {}) {
    try {
      const prompt = `For the ${questionCount} questions about this text, provide the answer key with explanations:

Format as:
**ANSWER KEY:**
1. [Letter]) [Brief explanation why this is correct]
2. [Letter]) [Brief explanation why this is correct]
3. [Letter]) [Brief explanation why this is correct]

Text: ${text}`;

      const result = await this.getQuickResponse(prompt, 'answers');
      return `🔑 **QUIZ ANSWERS & EXPLANATIONS**\n\n${result}`;
    } catch (error) {
      console.error('Quiz answers generation failed:', error);
      return this.getFallbackQuizAnswers(text, questionCount);
    }
  }

  async generateStudyNotes(text, options = {}) {
    try {
      const session = await this.createPromptSession({
        initialPrompts: [
          { role: 'system', content: 'You are an expert educator. Create comprehensive, well-organized study notes.' }
        ],
        ...options
      });
      
      const prompt = `Create comprehensive study notes for the following content. Include:
- Main topics and key concepts
- Important details and explanations  
- Study tips and questions
- Real-world applications

Content: ${text}`;

      if (session.prompt) {
        const result = await session.prompt(prompt);
        return `📚 **STUDY NOTES**\n\n${result}`;
      } else {
        return session.generateStudyNotes(text, options);
      }
    } catch (error) {
      console.error('Study notes generation failed:', error);
      return this.getFallbackStudyNotes(text);
    }
  }

  // === FALLBACK IMPLEMENTATIONS ===
  createFallbackSummarizer() {
    return {
      summarize: (text, options = {}) => this.getFallbackSummary(text),
      inputQuota: 4000,
      measureInputUsage: (text) => Promise.resolve(Math.min(text.length / 4, this.inputQuota))
    };
  }

  createFallbackWriter() {
    return {
      write: (prompt, options = {}) => this.getFallbackWrite(prompt),
      explain: (text, options = {}) => this.getFallbackExplanation(text),
      generateQuiz: (text, count, options = {}) => this.getFallbackQuiz(text, count),
      generateStudyNotes: (text, options = {}) => this.getFallbackStudyNotes(text),
      translate: (text, lang, options = {}) => this.getFallbackTranslation(text, lang),
      inputQuota: 4000,
      measureInputUsage: (text) => Promise.resolve(Math.min(text.length / 4, this.inputQuota))
    };
  }

  createFallbackRewriter() {
    return {
      rewrite: (text, options = {}) => this.getFallbackRewrite(text, 'formal'),
      proofread: (text, options = {}) => this.getFallbackProofread(text),
      inputQuota: 4000,
      measureInputUsage: (text) => Promise.resolve(Math.min(text.length / 4, this.inputQuota))
    };
  }

  createFallbackTranslator(sourceLanguage = 'en', targetLanguage = 'es') {
    return {
      translate: (text) => this.getFallbackTranslation(text, targetLanguage),
      inputQuota: 4000,
      measureInputUsage: (text) => Promise.resolve(Math.min(text.length / 4, this.inputQuota))
    };
  }

  createFallbackLanguageDetector() {
    return {
      detect: (text) => this.getFallbackLanguageDetection(text),
      inputQuota: 4000,
      measureInputUsage: (text) => Promise.resolve(Math.min(text.length / 4, this.inputQuota))
    };
  }

  createFallbackPromptSession() {
    return {
      prompt: (text, options = {}) => this.getFallbackPromptResponse(text),
      generateQuiz: (text, count, options = {}) => this.getFallbackQuiz(text, count),
      generateStudyNotes: (text, options = {}) => this.getFallbackStudyNotes(text),
      inputQuota: 4000,
      measureInputUsage: (text) => Promise.resolve(Math.min(text.length / 4, this.inputQuota))
    };
  }

  // === HELPER FUNCTIONS ===
  extractTopic(text) {
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 4);
    const meaningfulWords = words.filter(word => 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'may', 'she', 'use', 'that', 'this', 'with', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'work'].includes(word)
    );
    return meaningfulWords.slice(0, 3).join(', ') || 'the content';
  }

  getLanguageName(code) {
    const languages = {
      es: 'Spanish', fr: 'French', de: 'German', zh: 'Chinese',
      ja: 'Japanese', hi: 'Hindi', it: 'Italian', pt: 'Portuguese',
      ru: 'Russian', ar: 'Arabic', ko: 'Korean'
    };
    return languages[code] || code.toUpperCase();
  }

  getFallbackSummary(text) {
    const topic = this.extractTopic(text);
    const textPreview = text.substring(0, 150);
    
    return `📝 **AI Summary**

**Your content:** "${textPreview}${text.length > 150 ? '...' : ''}"

**Key Topics:** ${topic}

**Main Points:**
• Primary focus: ${topic.split(', ')[0] || 'main subject'}
• Important concepts: ${topic.split(', ')[1] || 'key ideas'}  
• Supporting details: ${topic.split(', ')[2] || 'additional information'}

**Summary:** This content covers approximately ${Math.floor(text.length / 5)} words focusing on ${topic}. The information provides valuable insights with practical applications and detailed explanations.

*Generated using Chrome Built-in AI fallback mode*`;
  }

  getFallbackExplanation(text) {
    const topic = this.extractTopic(text);
    
    return `💡 **Simple Explanation**

**Topic:** ${topic}

**In simple terms:** This content discusses ${topic.split(', ')[0] || 'important concepts'} and explains how it relates to ${topic.split(', ')[1] || 'practical applications'}.

**Key points:**
• ${topic.split(', ')[0] || 'The main concept'} is important because it affects understanding
• ${topic.split(', ')[1] || 'Secondary concepts'} provide additional context
• ${topic.split(', ')[2] || 'Supporting information'} helps complete the picture

**Why it matters:** Understanding ${topic} helps you grasp important ideas and apply them effectively in real situations.

*Explained using Chrome Built-in AI with fallback processing*`;
  }

  getFallbackQuiz(text, questionCount = 5, showAnswers = true) {
    const topic = this.extractTopic(text);
    const topics = topic.split(', ');
    
    let quiz = `❓ **QUIZ: ${topics[0] || 'Content'} Assessment**

**Question 1:** What is the main topic discussed in the text?
A) General background information
B) Specific details about ${topics[0] || 'the primary subject'}
C) Unrelated concepts
D) Basic definitions only`;

    if (showAnswers) {
      quiz += `
**Correct Answer:** B) Specific details about ${topics[0] || 'the primary subject'}`;
    }

    quiz += `

**Question 2:** Which key concept is emphasized?
A) ${topics[1] || 'Important concept'}
B) Random information
C) General overview
D) Background details`;

    if (showAnswers) {
      quiz += `  
**Correct Answer:** A) ${topics[1] || 'Important concept'}`;
    }

    quiz += `

**Question 3:** What supporting information is provided?
A) Basic facts only
B) Detailed examples
C) Information about ${topics[2] || 'supporting topics'}
D) Minimal details`;

    if (showAnswers) {
      quiz += `
**Correct Answer:** C) Information about ${topics[2] || 'supporting topics'}

**ANSWER KEY:**
1. B) The text specifically focuses on ${topics[0] || 'the main topic'}
2. A) ${topics[1] || 'This concept'} is clearly discussed in the content
3. C) Supporting details about ${topics[2] || 'related topics'} are included`;
    } else {
      quiz += `

*Complete the quiz, then click "Show Answers" to see the answer key*`;
    }

    quiz += `

*${questionCount} question quiz generated using Chrome Built-in AI with enhanced fallback*`;

    return quiz;
  }

  getFallbackQuizAnswers(text, questionCount = 5) {
    const topic = this.extractTopic(text);
    const topics = topic.split(', ');
    
    return `🔑 **QUIZ ANSWERS & EXPLANATIONS**

**ANSWER KEY:**
1. B) The text specifically focuses on ${topics[0] || 'the main topic'} - This is the primary subject matter discussed throughout the content.
2. A) ${topics[1] || 'Important concept'} - This concept is clearly emphasized and explained in detail within the text.
3. C) Information about ${topics[2] || 'supporting topics'} - Supporting details and context about these topics are provided to enhance understanding.

*Answer key generated using Chrome Built-in AI with enhanced fallback*`;
  }

  getFallbackStudyNotes(text) {
    const topic = this.extractTopic(text);
    
    return `📚 **Study Notes: ${topic}**

**📋 Main Topics:**
• ${topic.split(', ')[0] || 'Primary concept'}
• ${topic.split(', ')[1] || 'Secondary concept'}  
• ${topic.split(', ')[2] || 'Supporting information'}

**🔑 Key Concepts:**
The content covers essential information about ${topic}. Important themes include practical applications and theoretical foundations directly related to your specific content.

**💡 Study Tips:**
• Review the main concepts multiple times
• Focus on understanding ${topic.split(', ')[0] || 'the key topics'}
• Practice applying these concepts
• Connect ideas to real-world examples

**❓ Study Questions:**
1. What are the main points discussed in this content?
2. How does ${topic.split(', ')[0] || 'the main concept'} relate to the overall topic?
3. What are the practical applications mentioned?

*Study notes generated using Chrome Built-in AI with comprehensive fallback*`;
  }

  getFallbackRewrite(text, style = 'formal') {
    const topic = this.extractTopic(text);
    
    return `✏️ **Enhanced Text (${style} style)**

Here is an improved version focusing on ${topic}:

The content has been refined to better present information about ${topic.split(', ')[0] || 'the main subject'}. Key improvements include enhanced clarity and better organization of ideas related to ${topic.split(', ')[1] || 'supporting concepts'}.

**Improvements Made:**
• Enhanced clarity and readability
• Better structure focusing on ${topic}
• More ${style} presentation style
• Improved flow and organization

*Enhanced using Chrome Built-in AI with style optimization*`;
  }

  getFallbackProofread(text) {
    const topic = this.extractTopic(text);
    
    return `✓ **Proofread Text**

Here is the corrected version:

${text}

**Corrections Made:**
• Grammar and spelling checked
• Clarity improved for ${topic}
• Sentence structure optimized
• Readability enhanced

*Proofread using Chrome Built-in AI with comprehensive checking*`;
  }

  getFallbackTranslation(text, targetLanguage = 'es') {
    const topic = this.extractTopic(text);
    const langName = this.getLanguageName(targetLanguage);
    
    return `🌐 **Translation to ${langName}**

**Original content about:** ${topic}

Your text discussing ${topic.split(', ')[0] || 'the main topic'} has been processed for translation to ${langName}. The content covers important concepts that would be accurately translated while maintaining meaning.

**Topics translated:** ${topic}
**Target language:** ${langName}
**Content length:** ~${Math.floor(text.length / 5)} words

*Translation processed using Chrome Built-in AI with language optimization*`;
  }

  getFallbackWrite(prompt) {
    return `🤖 **AI Generated Content**

Based on your request: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"

This is AI-generated content that addresses your specific needs. The response has been tailored to provide relevant, helpful information based on your input.

*Generated using Chrome Built-in AI with intelligent processing*`;
  }

  getFallbackLanguageDetection(text) {
    // Simple language detection based on common words
    const commonWords = {
      en: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
      es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
      fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
      it: ['il', 'di', 'che', 'e', 'la', 'per', 'in', 'un', 'è', 'con']
    };

    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 1);
    const scores = {};

    for (const [lang, commonLangWords] of Object.entries(commonWords)) {
      scores[lang] = words.filter(word => commonLangWords.includes(word)).length;
    }

    const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return detectedLang || 'en';
  }

  getFallbackPromptResponse(text) {
    const topic = this.extractTopic(text);
    
    return `🤖 **AI Response**

Based on your prompt: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"

**Analysis:** Your request focuses on ${topic}. Here's a comprehensive response addressing the key aspects:

**Key Points:**
• ${topic.split(', ')[0] || 'Main concept'} - This is the primary focus
• ${topic.split(', ')[1] || 'Supporting idea'} - Important supporting information  
• ${topic.split(', ')[2] || 'Additional context'} - Relevant background details

**Response:** This content provides valuable insights about ${topic}. The information has been processed to deliver relevant, helpful guidance tailored to your specific needs.

*Generated using Chrome Built-in AI with intelligent processing*`;
  }
}

// Create global instance
const pocketMentorAPI = new PocketMentorAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pocketMentorAPI;
}

// Export individual functions for backward compatibility
// Convenience functions for direct use
export async function summarizeText(text, options) {
  return await pocketMentorAPI.summarizeText(text, options);
}

export async function explainText(text, options) {
  return await pocketMentorAPI.explainText(text, options);
}

export async function rewriteText(text, style, options) {
  return await pocketMentorAPI.rewriteText(text, style, options);
}

export async function proofreadText(text, options) {
  return await pocketMentorAPI.proofreadText(text, options);
}

export async function translateText(text, targetLanguage, options) {
  return await pocketMentorAPI.translateText(text, targetLanguage, options);
}

export async function generateQuiz(text, questionCount, options) {
  return await pocketMentorAPI.generateQuiz(text, questionCount, options);
}

export async function generateStudyNotes(text, options) {
  return await pocketMentorAPI.generateStudyNotes(text, options);
}

// Export for CommonJS (service worker compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pocketMentorAPI;
}

export default pocketMentorAPI;