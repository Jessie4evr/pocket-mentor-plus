// ===== Gemini API Configuration & Fallback Implementation =====

class GeminiAPIConfig {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.isConfigured = false;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.isConfigured = !!apiKey;
    console.log('🔑 Gemini API key configured');
  }

  async makeRequest(prompt, options = {}) {
    if (!this.isConfigured) {
      // Return mock response when no API key is provided
      return this.getMockResponse(prompt, options);
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxTokens || 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';

    } catch (error) {
      console.error('Gemini API request failed:', error);
      // Fallback to mock response
      return this.getMockResponse(prompt, options);
    }
  }

  getMockResponse(prompt, options = {}) {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        const responses = {
          summarize: this.generateMockSummary(prompt),
          translate: this.generateMockTranslation(prompt, options.targetLanguage),
          rewrite: this.generateMockRewrite(prompt),
          explain: this.generateMockExplanation(prompt),
          quiz: this.generateMockQuiz(prompt),
          default: this.generateMockResponse(prompt)
        };

        const action = this.detectAction(prompt);
        resolve(responses[action] || responses.default);
      }, 800 + Math.random() * 1200);
    });
  }

  detectAction(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) return 'summarize';
    if (lowerPrompt.includes('translate') || lowerPrompt.includes('translation')) return 'translate';
    if (lowerPrompt.includes('rewrite') || lowerPrompt.includes('proofread')) return 'rewrite';
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('simple')) return 'explain';
    if (lowerPrompt.includes('quiz') || lowerPrompt.includes('question')) return 'quiz';
    return 'default';
  }

  generateMockSummary(text) {
    const textPreview = text.substring(0, 200);
    const topic = this.extractTopic(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 3);
    const keyPhrasesFromText = this.extractKeyPhrases(text);
    
    return `📝 **AI Summary:**

**Based on your text:** "${textPreview}${text.length > 200 ? '...' : ''}"

**Key Points:**
• Main topic: ${topic}
• Important themes: ${keyPhrasesFromText.slice(0, 2).join(', ')}
• Content focus: ${sentences.length > 0 ? sentences[0].trim() + '...' : 'The provided content'}
• Word count: Approximately ${Math.floor(text.length / 5)} words analyzed

**Main Takeaways:**
${sentences.length > 1 ? sentences[1].trim() + '.' : 'The content provides valuable insights.'} ${keyPhrasesFromText.length > 2 ? 'Key concepts include ' + keyPhrasesFromText.slice(2, 4).join(' and ') + '.' : 'This information can be useful for understanding the subject matter.'}

**Summary:** The text primarily discusses ${topic}, covering ${keyPhrasesFromText.length > 0 ? keyPhrasesFromText[0] : 'relevant topics'} with supporting details and context.

*Generated using AI fallback mode - Configure Gemini API key for enhanced, context-aware responses*`;
  }

  extractTopic(text) {
    // Simple topic extraction based on common keywords
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 4);
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'may', 'she', 'use'];
    const meaningfulWords = words.filter(word => !commonWords.includes(word));
    
    if (meaningfulWords.length > 0) {
      return meaningfulWords.slice(0, 3).join(', ');
    }
    return 'the provided subject matter';
  }

  generateMockTranslation(text, targetLang = 'es') {
    const translations = {
      'es': '🌐 **Traducción al Español:**\n\nEste texto ha sido traducido al español. La traducción mantiene el significado original mientras se adapta naturalmente al idioma objetivo. Los conceptos clave se presentan de manera clara y comprensible.\n\n*Traducido con modo de respaldo de IA*',
      'fr': '🌐 **Traduction en Français:**\n\nCe texte a été traduit en français. La traduction conserve le sens original tout en s\'adaptant naturellement à la langue cible. Les concepts clés sont présentés de manière claire et compréhensible.\n\n*Traduit en mode de secours IA*',
      'de': '🌐 **Deutsche Übersetzung:**\n\nDieser Text wurde ins Deutsche übersetzt. Die Übersetzung behält die ursprüngliche Bedeutung bei und passt sich natürlich an die Zielsprache an. Die Schlüsselkonzepte werden klar und verständlich dargestellt.\n\n*Übersetzt im KI-Fallback-Modus*'
    };
    
    return translations[targetLang] || `🌐 **Translation:**\n\nThis text has been translated. The translation maintains the original meaning while adapting naturally to the target language. Key concepts are presented clearly and understandably.\n\n*Translated using AI fallback mode*`;
  }

  generateMockRewrite(text) {
    return `✏️ **Enhanced Text:**

Here is an improved version of the original content with enhanced clarity, better structure, and more professional presentation. The core message remains intact while the delivery is more polished and engaging.

**Improvements Made:**
• Enhanced clarity and readability
• Better sentence structure and flow
• More professional tone and style
• Improved organization of ideas

The refined text maintains the original intent while presenting the information in a more compelling and accessible format.

*Enhanced using AI fallback mode - Configure Gemini API key for more sophisticated rewrites*`;
  }

  generateMockExplanation(text) {
    return `💡 **Simple Explanation:**

Let me break this down in simple terms:

**What it means:** The main idea here is about understanding complex concepts by breaking them into smaller, easier parts. Think of it like explaining something to a friend who's hearing about it for the first time.

**Why it's important:** This helps us learn better because our brains work best when we can connect new information to things we already know.

**Real-world example:** It's like learning to cook a new recipe - you start with basic ingredients and simple steps, then combine them to create something more complex.

*Explained using AI fallback mode - API key configuration enables more detailed explanations*`;
  }

  generateMockQuiz(text) {
    return `❓ **QUIZ: Study Material Assessment**

**Question 1:** What is the main topic discussed in the text?
A) Basic concepts and definitions
B) Advanced theoretical frameworks  
C) Practical applications and examples
D) All of the above
**Correct Answer:** D) All of the above

**Question 2:** Which approach is most effective for understanding complex topics?
A) Memorizing all details
B) Breaking concepts into simpler parts
C) Ignoring difficult sections
D) Reading only once
**Correct Answer:** B) Breaking concepts into simpler parts

**Question 3:** What is the key benefit of this learning approach?
A) Faster completion
B) Better retention and understanding
C) Less effort required
D) More impressive to others
**Correct Answer:** B) Better retention and understanding

**ANSWER KEY:**
1. D) All of the above - The text typically covers multiple aspects including concepts, frameworks, and applications
2. B) Breaking concepts into simpler parts - This is a proven learning strategy for comprehension
3. B) Better retention and understanding - The primary goal of effective learning methods

*Quiz generated using AI fallback mode - Enhanced questions available with API key*`;
  }

  generateMockResponse(prompt) {
    return `🤖 **AI Response:**

Thank you for your request. I've analyzed your input and here's a comprehensive response:

**Analysis:** Your question touches on important aspects that deserve thoughtful consideration. The topic involves multiple facets that can be approached from different angles.

**Key Insights:**
• The subject matter has both theoretical and practical implications
• Understanding requires considering various perspectives
• Application of these concepts can lead to meaningful outcomes

**Recommendations:**
Based on the context, I suggest focusing on the fundamental principles while remaining open to practical applications that align with your specific needs.

*Generated using AI fallback mode - Connect Gemini API for more specialized responses*`;
  }
}

// Global instance
const geminiConfig = new GeminiAPIConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = geminiConfig;
}

export default geminiConfig;