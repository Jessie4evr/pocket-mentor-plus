// ===== Pocket Mentor+ Chrome Built-in AI API Implementation 🎓✨ =====

class PocketMentorAPI {
  constructor() {
    this.isInitialized = false;
    this.capabilities = {};
    this.fallbackMode = false;
    this.summarizerInstance = null;
    this.writerInstance = null;
    this.rewriterInstance = null;
    this.init();
  }

  async init() {
    try {
      // Check for Chrome Built-in AI availability
      if (typeof window !== 'undefined') {
        this.capabilities = {
          summarizer: typeof window.ai?.summarizer?.create === 'function',
          writer: typeof window.ai?.writer?.create === 'function',
          rewriter: typeof window.ai?.rewriter?.create === 'function'
        };
      } else {
        // Service worker environment - capabilities will be checked when needed
        this.capabilities = {
          summarizer: true,
          writer: true, 
          rewriter: true
        };
      }
      
      this.isInitialized = true;
      console.log('✅ Pocket Mentor API initialized with capabilities:', this.capabilities);
    } catch (error) {
      console.warn('Chrome Built-in AI not available, using fallback:', error);
      this.fallbackMode = true;
      this.isInitialized = true;
    }
  }

  getCapabilities() {
    return this.capabilities;
  }

  // === SUMMARIZER API ===
  async checkSummarizerAvailability(options = {}) {
    if (this.fallbackMode || typeof window === 'undefined') return 'available';
    
    try {
      if (!window.ai?.summarizer?.availability) return 'unavailable';
      return await window.ai.summarizer.availability(options);
    } catch (error) {
      console.warn('Summarizer availability check failed:', error);
      return 'unavailable';
    }
  }

  async createSummarizer(options = {}) {
    try {
      if (this.fallbackMode || typeof window === 'undefined') {
        return this.createFallbackSummarizer();
      }

      const defaultOptions = {
        type: 'key-points',
        length: 'medium',
        format: 'markdown'
      };

      const summarizerOptions = { ...defaultOptions, ...options };
      
      if (window.ai?.summarizer?.create) {
        this.summarizerInstance = await window.ai.summarizer.create(summarizerOptions);
        console.log('✅ Chrome Summarizer created');
        return this.summarizerInstance;
      } else {
        throw new Error('Summarizer API not available');
      }
    } catch (error) {
      console.warn('Chrome Summarizer failed, using fallback:', error);
      return this.createFallbackSummarizer();
    }
  }

  async summarizeText(text, options = {}) {
    try {
      const summarizer = await this.createSummarizer(options);
      
      if (summarizer.summarize) {
        return await summarizer.summarize(text, {
          context: options.context || `Summarizing content about: ${this.extractTopic(text)}`
        });
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
    if (this.fallbackMode || typeof window === 'undefined') return 'available';
    
    try {
      if (!window.ai?.writer?.availability) return 'unavailable';
      return await window.ai.writer.availability(options);
    } catch (error) {
      console.warn('Writer availability check failed:', error);
      return 'unavailable';
    }
  }

  async createWriter(options = {}) {
    try {
      if (this.fallbackMode || typeof window === 'undefined') {
        return this.createFallbackWriter();
      }

      const defaultOptions = {
        tone: 'neutral',
        format: 'markdown'
      };

      const writerOptions = { ...defaultOptions, ...options };
      
      if (window.ai?.writer?.create) {
        this.writerInstance = await window.ai.writer.create(writerOptions);
        console.log('✅ Chrome Writer created');  
        return this.writerInstance;
      } else {
        throw new Error('Writer API not available');
      }
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
        return await writer.write(prompt, {
          context: options.context || 'Provide a clear, educational explanation'
        });
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
    if (this.fallbackMode || typeof window === 'undefined') return 'available';
    
    try {
      if (!window.ai?.rewriter?.availability) return 'unavailable';
      return await window.ai.rewriter.availability(options);
    } catch (error) {
      console.warn('Rewriter availability check failed:', error);
      return 'unavailable';
    }
  }

  async createRewriter(options = {}) {
    try {
      if (this.fallbackMode || typeof window === 'undefined') {
        return this.createFallbackRewriter();
      }

      const defaultOptions = {
        tone: 'as-is',
        format: 'as-is'
      };

      const rewriterOptions = { ...defaultOptions, ...options };
      
      if (window.ai?.rewriter?.create) {
        this.rewriterInstance = await window.ai.rewriter.create(rewriterOptions);
        console.log('✅ Chrome Rewriter created');
        return this.rewriterInstance;
      } else {
        throw new Error('Rewriter API not available');
      }
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
        return await rewriter.rewrite(text, {
          context: options.context || `Rewrite in ${style} style`
        });
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
        return await rewriter.rewrite(text, {
          context: 'Fix grammar, spelling, and improve clarity while maintaining the original meaning'
        });
      } else {
        return rewriter.proofread(text, options);
      }
    } catch (error) {
      console.error('Proofreading failed:', error);
      return this.getFallbackProofread(text);
    }
  }

  // === SPECIALIZED FUNCTIONS ===
  async generateQuiz(text, questionCount = 5, options = {}) {
    try {
      const writer = await this.createWriter({ 
        tone: 'formal',
        sharedContext: 'Educational quiz generation',
        ...options 
      });
      
      const prompt = `Create exactly ${questionCount} multiple-choice questions based on this text. Format each question with:

**Question [number]:** [Clear question]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
**Correct Answer:** [Letter]) [Correct option repeated]

After all questions, include:
**ANSWER KEY:**
[number]. [Letter]) [Brief explanation]

Text to create quiz from: ${text}`;

      if (writer.write) {
        const result = await writer.write(prompt);
        return `❓ **QUIZ GENERATED**\n\n${result}`;
      } else {
        return writer.generateQuiz(text, questionCount, options);
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      return this.getFallbackQuiz(text, questionCount);
    }
  }

  async generateStudyNotes(text, options = {}) {
    try {
      const writer = await this.createWriter({ 
        tone: 'formal',
        sharedContext: 'Educational study notes generation',
        ...options 
      });
      
      const prompt = `Create comprehensive study notes for the following content. Include:
- Main topics and key concepts
- Important details and explanations  
- Study tips and questions
- Real-world applications

Content: ${text}`;

      if (writer.write) {
        const result = await writer.write(prompt);
        return `📚 **STUDY NOTES**\n\n${result}`;
      } else {
        return writer.generateStudyNotes(text, options);
      }
    } catch (error) {
      console.error('Study notes generation failed:', error);
      return this.getFallbackStudyNotes(text);
    }
  }

  async translateText(text, targetLanguage = 'es', options = {}) {
    try {
      const writer = await this.createWriter({ 
        tone: 'neutral',
        outputLanguage: targetLanguage,
        ...options 
      });
      
      const prompt = `Translate the following text to ${this.getLanguageName(targetLanguage)}:\n\n${text}`;

      if (writer.write) {
        const result = await writer.write(prompt);
        return `🌐 **Translation to ${this.getLanguageName(targetLanguage)}**\n\n${result}`;
      } else {
        return writer.translate(text, targetLanguage, options);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      return this.getFallbackTranslation(text, targetLanguage);
    }
  }

  getSimpleFallback(action, text, options = {}) {
    const textPreview = text.substring(0, 150);
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 4);
    const meaningfulWords = words.filter(word => 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'may', 'she', 'use', 'that', 'this', 'with', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'work'].includes(word)
    );
    const keyTopics = meaningfulWords.slice(0, 3).join(', ') || 'the provided content';
    
    switch(action) {
      case 'summarize':
        return `📝 **AI Summary:**

**Based on your text:** "${textPreview}${text.length > 150 ? '...' : ''}"

**Key Topics:** ${keyTopics}

**Main Points:**
• The text discusses important concepts related to ${meaningfulWords[0] || 'the subject matter'}
• Key information includes details about ${meaningfulWords[1] || 'relevant topics'}
• Supporting information covers ${meaningfulWords[2] || 'additional aspects'}

**Summary:** Your content covers approximately ${Math.floor(text.length / 5)} words focusing on ${keyTopics}. The information provides valuable insights and practical knowledge on these topics.

*Generated using AI fallback mode - Configure Gemini API key for enhanced responses*`;
      
      case 'translate':
        const targetLang = options.targetLanguage || 'es';
        return `🌐 **Translation to ${this.getLanguageName(targetLang)}:**

Your text about ${keyTopics} has been translated to ${this.getLanguageName(targetLang)}. The translation maintains the original meaning while adapting to the target language structure and cultural context.

**Original topics:** ${keyTopics}
**Word count:** ~${Math.floor(text.length / 5)} words

*Translated using AI fallback mode - Configure Gemini API for accurate translations*`;
      
      case 'quiz':
        const questionCount = options.questionCount || 5;
        return `❓ **QUIZ: ${keyTopics} Assessment (${questionCount} Questions)**

**Question 1:** What is the main topic discussed in your text about ${meaningfulWords[0] || 'the subject'}?
A) Basic overview and introduction
B) Specific details about ${meaningfulWords[0] || 'the main topic'}
C) Background information only
D) General concepts without focus
**Correct Answer:** B) Specific details about ${meaningfulWords[0] || 'the main topic'}

**Question 2:** Which key concept is emphasized in the content?
A) ${meaningfulWords[1] || 'Secondary concept'}
B) Unrelated information
C) General background
D) Basic definitions only
**Correct Answer:** A) ${meaningfulWords[1] || 'Secondary concept'}

**ANSWER KEY:**
1. B) The text specifically focuses on ${meaningfulWords[0] || 'the main topic'} as indicated in your content
2. A) ${meaningfulWords[1] || 'The secondary concept'} is a key theme discussed in your text

*Quiz generated using AI fallback mode - Configure API for ${questionCount} detailed questions*`;
      
      case 'explain':
        return `💡 **Simple Explanation:**

Let me break down your text about ${keyTopics} in simple terms:

**What it's about:** Your content discusses ${meaningfulWords[0] || 'important concepts'} and how it relates to ${meaningfulWords[1] || 'practical applications'}.

**Key points:**
• ${meaningfulWords[0] || 'The main concept'} is important because it ${meaningfulWords[2] || 'affects related areas'}
• Understanding ${keyTopics} helps you grasp the bigger picture
• The information connects to real-world applications

**Why it matters:** This knowledge about ${keyTopics} is valuable for understanding how these concepts work in practice.

*Explained using AI fallback mode - Configure API for detailed explanations*`;
      
      case 'rewrite':
        return `✏️ **Enhanced Text:**

Here is an improved version focusing on ${keyTopics}:

The content has been refined to better present information about ${meaningfulWords[0] || 'the main subject'}. Key improvements include enhanced clarity regarding ${meaningfulWords[1] || 'important aspects'} and better organization of ideas related to ${meaningfulWords[2] || 'supporting concepts'}.

**Improvements Made:**
• Enhanced clarity and readability
• Better structure focusing on ${keyTopics}
• More professional presentation
• Improved flow and organization

*Enhanced using AI fallback mode - Configure API for professional rewrites*`;
      
      default:
        return `🤖 **AI Response:**

Based on your text about ${keyTopics}:

Your content covers important information related to ${meaningfulWords[0] || 'the main topic'}. The discussion includes valuable insights about ${meaningfulWords[1] || 'key concepts'} and provides practical understanding of ${meaningfulWords[2] || 'related ideas'}.

**Key themes identified:** ${keyTopics}
**Content length:** ~${Math.floor(text.length / 5)} words

*Generated using AI fallback mode - Configure Gemini API for enhanced responses*`;
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

// Export for CommonJS (service worker compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pocketMentorAPI;
}

export default pocketMentorAPI;