import { logger } from '../utils/logger.js';

export class LLMProvider {
  constructor(config) {
    this.config = config;
    this.provider = config.LLM_PROVIDER || 'anthropic';
    
    // Initialize provider-specific client
    this.initializeProvider();
  }
  
  async initializeProvider() {
    if (this.provider === 'anthropic' && this.config.ANTHROPIC_API_KEY) {
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        this.client = new Anthropic({
          apiKey: this.config.ANTHROPIC_API_KEY
        });
        logger.info('✅ Anthropic Claude LLM initialized');
      } catch (error) {
        logger.warn('Anthropic SDK not available, using fallback');
        this.provider = 'fallback';
      }
    }
  }
  
  async generateResponse(message, systemPrompt, history = []) {
    if (this.provider === 'anthropic' && this.client) {
      return this.generateWithAnthropic(message, systemPrompt, history);
    } else if (this.provider === 'openai' && this.config.OPENAI_API_KEY) {
      return this.generateWithOpenAI(message, systemPrompt, history);
    } else {
      return this.generateFallbackResponse(message);
    }
  }
  
  async generateWithAnthropic(message, systemPrompt, history) {
    try {
      const messages = [
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      });
      
      return response.content[0].text;
    } catch (error) {
      logger.error('Anthropic generation failed:', error);
      return this.generateFallbackResponse(message);
    }
  }
  
  async generateWithOpenAI(message, systemPrompt, history) {
    try {
      const fetch = (await import('node-fetch')).default;
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 1024
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI generation failed:', error);
      return this.generateFallbackResponse(message);
    }
  }
  
  generateFallbackResponse(message) {
    const responses = {
      'hello': '👋 Hey! I\'m Praxis-AI. Ready to build value in the agent ecosystem. What can I help you with?',
      'help': '📚 Commands: /help, /status, /post, /launch, /earnings, /verify',
      'status': '✅ Praxis-AI online and ready',
      'launch': '🚀 Token launch initiated! Tell me more about your token idea.',
      'earnings': '💰 Earnings monitoring active. Let me check on your launched tokens.',
      'moltbook': '🗣️ Moltbook integration ready. What would you like to post?',
      'token': '🪙 Token utilities can range from prediction markets to content rewards. What\'s your vision?'
    };
    
    // Find matching keyword in message
    const messageUpper = message.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (messageUpper.includes(key)) {
        return response;
      }
    }
    
    return `🤔 I'm Praxis-AI. I can help with token launches, Moltbook posts, earnings tracking, and more. Try /help for commands, or ask me about building value in the agent ecosystem!`;
  }
  
  async proposeTokenUtility(tokenDetails) {
    const prompt = `You are Praxis-AI proposing token utilities. Given this token:
Name: ${tokenDetails.name}
Symbol: ${tokenDetails.symbol}
Description: ${tokenDetails.description}

Suggest 3 possible utility mechanisms for this token (prediction market, content reward, treasury, etc). Be specific and concise. Max 150 words.`;
    
    return this.generateResponse(prompt, 'You are a DeFi token design expert.');
  }
  
  async generateDailyContent() {
    const topics = [
      'market trends and insights',
      'prediction market opportunities',
      'agent ecosystem updates',
      'token launch strategies',
      'DeFi opportunities on Base'
    ];
    
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const prompt = `Generate a tweet-thread starter about ${topic} from the perspective of Praxis-AI, an autonomous agent in the crypto ecosystem. Start with a hook, keep it under 280 chars for the first post. Focus on practical insights.`;
    
    return this.generateResponse(prompt, 'You are Praxis-AI, an autonomous agent expert in token launches and ecosystem value creation.');
  }
  
  async generateReply(originalContent) {
    const prompt = `You are Praxis-AI replying to this message on Moltbook:

"${originalContent}"

Craft a brief, thoughtful reply (under 280 chars) that:
1. Acknowledges the point
2. Adds value or a different perspective
3. Suggests collaboration if relevant`;
    
    return this.generateResponse(prompt, 'You are Praxis-AI, focused on building community and value in the agent ecosystem.');
  }
  
  async analyzeTokenOpportunity(description) {
    const prompt = `Analyze this token idea:
${description}

Provide:
1. Utility assessment (viable or not?)
2. Target use case
3. Recommended mechanics (bonding curve? staking? voting?)
4. Risk assessment (red flags?)

Keep response under 300 words.`;
    
    return this.generateResponse(prompt, 'You are a DeFi strategy expert analyzing token launches.');
  }
}
