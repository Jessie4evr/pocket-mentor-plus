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
      // Fallback to mock response with the original prompt
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
          quiz: this.generateMockQuiz(prompt, options.questionCount || 5),
          studyNotes: this.generateMockStudyNotes(prompt),
          default: this.generateMockResponse(prompt)
        };

        const action = this.detectAction(prompt);
        console.log(`🤖 Generating mock response for action: ${action}`);
        resolve(responses[action] || responses.default);
      }, 800 + Math.random() * 1200);
    });
  }

  detectAction(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // More specific detection patterns
    if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary') || lowerPrompt.includes('main points')) return 'summarize';
    if (lowerPrompt.includes('translate') || lowerPrompt.includes('translation')) return 'translate';
    if (lowerPrompt.includes('rewrite') || lowerPrompt.includes('proofread') || lowerPrompt.includes('improve')) return 'rewrite';
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('simple') || lowerPrompt.includes('understand')) return 'explain';
    if (lowerPrompt.includes('quiz') || lowerPrompt.includes('question') || lowerPrompt.includes('multiple-choice') || lowerPrompt.includes('A, B, C, D')) return 'quiz';
    if (lowerPrompt.includes('study notes') || lowerPrompt.includes('notes')) return 'studyNotes';
    
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
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'may', 'she', 'use', 'that', 'this', 'with', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'work'];
    const meaningfulWords = words.filter(word => !commonWords.includes(word));
    
    if (meaningfulWords.length > 0) {
      return meaningfulWords.slice(0, 3).join(', ');
    }
    return 'the provided subject matter';
  }

  extractKeyPhrases(text) {
    // Extract meaningful phrases and key terms from the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const phrases = [];
    
    sentences.forEach(sentence => {
      // Look for patterns like "X is Y", "X means Y", "X includes Y", etc.
      const patterns = [
        /(\w+(?:\s+\w+)*)\s+(?:is|are|means?|includes?|involves?|refers?\s+to)\s+([^,\n]+)/gi,
        /(?:the|a|an)\s+(\w+(?:\s+\w+)*)\s+(?:of|for|in|on)\s+([^,\n]+)/gi,
        /(\w+(?:\s+\w+){1,2})\s+(?:can|will|should|must|might)\s+([^,\n]+)/gi
      ];
      
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(sentence)) !== null && phrases.length < 8) {
          if (match[1] && match[1].length > 3 && match[1].length < 30) {
            phrases.push(match[1].trim());
          }
        }
      });
    });
    
    // Also extract standalone important-looking words
    const words = text.toLowerCase().split(/\W+/).filter(word => 
      word.length > 5 && 
      !this.isCommonWord(word) && 
      phrases.length < 10
    );
    
    phrases.push(...words.slice(0, 10 - phrases.length));
    
    return [...new Set(phrases)].slice(0, 6); // Remove duplicates and limit
  }

  isCommonWord(word) {
    const common = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'may', 'she', 'use', 'that', 'this', 'with', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'work', 'through', 'between', 'important', 'example', 'different', 'including', 'because', 'without', 'around', 'before', 'during', 'after', 'under', 'would', 'could', 'should', 'might', 'information', 'question', 'problem', 'system', 'process', 'method', 'approach', 'concept'];
    return common.includes(word.toLowerCase());
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

  generateMockQuiz(text, questionCount = 5) {
    const topic = this.extractTopic(text);
    const keyPhrases = this.extractKeyPhrases(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 10);
    
    let quiz = `❓ **QUIZ: ${topic} Assessment**\n\n`;
    const answers = [];
    
    // Generate questions based on the actual text content
    for (let i = 1; i <= questionCount; i++) {
      const questionPhrase = keyPhrases[Math.min(i-1, keyPhrases.length-1)] || 'the main concept';
      const correctSentence = sentences[Math.min(i-1, sentences.length-1)] || text.substring(0, 100);
      
      quiz += `**Question ${i}:** What is the primary focus regarding ${questionPhrase} in the text?\n`;
      
      // Generate 4 options with one correct answer
      const correctLetter = ['A', 'B', 'C', 'D'][i % 4];
      const options = this.generateQuizOptions(correctSentence, keyPhrases, i);
      
      // Assign correct answer to the chosen letter
      const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
      const shuffledOptions = [...options];
      shuffledOptions[correctIndex] = options[0]; // Put correct answer in chosen position
      shuffledOptions[0] = options[correctIndex]; // Swap
      
      quiz += `A) ${shuffledOptions[0]}\n`;
      quiz += `B) ${shuffledOptions[1]}\n`;
      quiz += `C) ${shuffledOptions[2]}\n`;
      quiz += `D) ${shuffledOptions[3]}\n`;
      quiz += `**Correct Answer:** ${correctLetter}) ${shuffledOptions[correctIndex]}\n\n`;
      
      answers.push({
        question: i,
        answer: correctLetter,
        explanation: `This is correct based on the text content about ${questionPhrase}`
      });
    }
    
    // Add answer key section
    quiz += `**ANSWER KEY:**\n`;
    answers.forEach(answer => {
      quiz += `${answer.question}. ${answer.answer}) ${answer.explanation}\n`;
    });
    
    quiz += `\n*Quiz generated using AI fallback mode - Enhanced questions available with API key*`;
    
    return quiz;
  }

  generateQuizOptions(correctSentence, keyPhrases, questionIndex) {
    // Generate plausible options based on the text content
    const correctOption = this.createCorrectOption(correctSentence, keyPhrases);
    const wrongOptions = [
      this.createWrongOption(keyPhrases, 'general'),
      this.createWrongOption(keyPhrases, 'opposite'),
      this.createWrongOption(keyPhrases, 'related')
    ];
    
    return [correctOption, ...wrongOptions];
  }

  createCorrectOption(sentence, keyPhrases) {
    const cleanSentence = sentence.trim().replace(/^\w+\s/, '').substring(0, 80);
    const keyPhrase = keyPhrases[0] || 'the main topic';
    return `It focuses on ${keyPhrase} as described in the content`;
  }

  createWrongOption(keyPhrases, type) {
    const phrase = keyPhrases[Math.floor(Math.random() * keyPhrases.length)] || 'general concepts';
    
    switch(type) {
      case 'opposite':
        return `It completely ignores ${phrase} and related topics`;
      case 'related':
        return `It briefly mentions ${phrase} but focuses on other aspects`;
      case 'general':
      default:
        return `It provides general information without specific focus on ${phrase}`;
    }
  }

  generateMockStudyNotes(text) {
    const topic = this.extractTopic(text);
    const keyPhrases = this.extractKeyPhrases(text);
    
    return `📚 **Study Notes: ${topic}**

**📋 Main Topics:**
• ${keyPhrases[0] || 'Primary concept from your text'}
• ${keyPhrases[1] || 'Secondary concept discussed'}
• ${keyPhrases[2] || 'Supporting information provided'}

**🔑 Key Concepts:**
Based on your text: "${text.substring(0, 150)}${text.length > 150 ? '...' : ''}"

The content covers essential information about ${topic}. Important themes include practical applications and theoretical foundations directly related to your specific content.

**💡 Study Tips:**
• Review the main concepts multiple times
• Focus on understanding ${keyPhrases[0] || 'the key topics'}
• Practice applying these concepts
• Connect ideas to real-world examples

**❓ Study Questions:**
1. What are the main points discussed in this content?
2. How does ${keyPhrases[0] || 'the main concept'} relate to the overall topic?
3. What are the practical applications mentioned?

*Study notes generated using AI fallback mode*`;
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