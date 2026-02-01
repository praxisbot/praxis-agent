import { MoltbookClient } from '../integrations/moltbook/MoltbookClient.js';
import { MoltxClient } from '../integrations/moltx/MoltxClient.js';
import { ClawnchClient } from '../integrations/clawnch/ClawnchClient.js';
import { LLMProvider } from '../llm/LLMProvider.js';
import { SkillRegistry } from '../skills/SkillRegistry.js';
import { DataStore } from '../utils/DataStore.js';
import { logger } from '../utils/logger.js';
import fetch from 'node-fetch';

export class PraxisAgent {
  constructor(config) {
    this.config = config;
    this.moltbook = new MoltbookClient(config);
    this.moltx = new MoltxClient(config);
    this.clawnch = new ClawnchClient(config);
    this.llm = new LLMProvider(config);
    this.skills = new SkillRegistry(config);
    this.dataStore = new DataStore(config.DATA_DIR);
    
    this.agentState = {
      registeredOnMoltbook: false,
      moltbookVerified: false,
      registeredOnMoltx: false,
      moltxVerified: false,
      lastTokenLaunchDate: null,
      earnings: 0,
      authorizedUsers: new Set(),
      conversationHistory: []
    };
  }
  
  async initialize() {
    logger.info('🚀 Initializing Praxis-AI core systems...');
    
    // Load persisted state
    try {
      const saved = await this.dataStore.load('agent-state');
      if (saved) {
        this.agentState = { ...this.agentState, ...saved };
        logger.info('✅ Restored agent state from storage');
      }
    } catch (error) {
      logger.warn('No saved state found, starting fresh');
    }
    
    // Initialize Moltbook if configured
    if (this.config.MOLTBOOK_API_KEY) {
      await this.initializeMoltbook();
    }
    
    // Initialize Moltx if credentials exist
    const moltxRegistered = await this.moltx.isRegistered();
    if (moltxRegistered) {
      await this.initializeMoltx();
    }
    
    // Load skills
    await this.skills.loadSkills();
    logger.info(`✅ Loaded ${this.skills.getCount()} skills`);
  }
  
  async initializeMoltbook() {
    try {
      const agentInfo = await this.moltbook.getAgentInfo();
      if (agentInfo) {
        this.agentState.registeredOnMoltbook = true;
        this.agentState.moltbookVerified = true;
        logger.info(`✅ Moltbook verified: ${agentInfo.handle}`);
      }
    } catch (error) {
      logger.warn('Moltbook not yet configured, awaiting verification...');
    }
  }

  async initializeMoltx() {
    try {
      const loaded = await this.moltx.loadCredentials();
      if (loaded) {
        this.agentState.registeredOnMoltx = true;
        this.agentState.moltxVerified = true;
        logger.info(`✅ Moltx initialized`);
      }
    } catch (error) {
      logger.warn('Moltx not yet configured, awaiting registration...');
    }
  }
  
  async processMessage(message, userId) {
    try {
      // Add to conversation history
      this.agentState.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      
      // Check for commands
      if (message.startsWith('/')) {
        return await this.handleCommand(message, userId);
      }
      
      // Check for skill triggers (e.g., "launch token", "post on moltbook")
      const skillMatch = await this.skills.matchSkill(message);
      if (skillMatch) {
        return await this.executeSkill(skillMatch, message, userId);
      }
      
      // Default: conversational response with LLM
      return await this.generateResponse(message, userId);
    } catch (error) {
      logger.error('Message processing error:', error);
      return `❌ Error processing message: ${error.message}`;
    }
  }
  
  async handleCommand(command, userId) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    
    switch (cmd) {
      case '/help':
        return this.getHelpMessage();
      
      case '/status':
        return this.getStatusMessage();
      
      case '/verify':
        return await this.handleVerification(userId);
      
      case '/register':
        return await this.registerOnMoltbook();
      
      case '/post':
        const postContent = parts.slice(1).join(' ');
        if (!postContent.trim()) {
          return '📝 Usage: /post <message>\nExample: /post Hello Moltbook! This is my first post.';
        }
        return await this.handleMoltbookPost(postContent);
      
      case '/launch':
        const launchDetails = parts.slice(1).join(' ');
        if (!launchDetails.trim()) {
          return '🚀 Usage: /launch name:TokenName symbol:SYMBOL description:Description image:https://image.url\nExample: /launch name:Praxis symbol:PXS description:AI Agent Token image:https://example.com/image.jpg';
        }
        return await this.handleTokenLaunch(launchDetails, userId);
      
      case '/earnings':
        return this.getEarningsReport();

      case '/skills':
        return this.getSkillsMessage();

      case '/wallet':
        return await this.getWalletMessage();
      
      case '/moltx-register':
        return await this.registerOnMoltx();
      
      case '/moltx-claim':
        const claimUrl = parts.slice(1).join(' ');
        if (!claimUrl.trim()) {
          return '🔐 Usage: /moltx-claim <tweet_url>\nExample: /moltx-claim https://twitter.com/yourhandle/status/123456';
        }
        return await this.claimOnMoltx(claimUrl);
      
      case '/moltx-post':
        const moltxContent = parts.slice(1).join(' ');
        if (!moltxContent.trim()) {
          return '📝 Usage: /moltx-post <message>\nExample: /moltx-post Hello Moltx! This is my first post.';
        }
        return await this.handleMoltxPost(moltxContent);
      
      default:
        return `Unknown command: ${cmd}. Type /help for available commands.`;
    }
  }
  
  async executeSkill(skill, message, userId) {
    try {
      logger.info(`🎯 Executing skill: ${skill.name}`);
      const result = await skill.execute(message, this);
      this.agentState.conversationHistory.push({
        role: 'assistant',
        content: result,
        timestamp: Date.now()
      });
      await this.dataStore.save('agent-state', this.agentState);
      return result;
    } catch (error) {
      logger.error(`Skill execution failed: ${skill.name}`, error);
      return `⚠️ Skill "${skill.name}" failed: ${error.message}`;
    }
  }
  
  async generateResponse(message, userId) {
    try {
      const systemPrompt = this.getSystemPrompt();
      const response = await this.llm.generateResponse(
        message,
        systemPrompt,
        this.agentState.conversationHistory
      );
      
      this.agentState.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      });
      
      // Keep history size manageable
      if (this.agentState.conversationHistory.length > 50) {
        this.agentState.conversationHistory = this.agentState.conversationHistory.slice(-50);
      }
      
      await this.dataStore.save('agent-state', this.agentState);
      return response;
    } catch (error) {
      logger.error('LLM response generation failed:', error);
      // Fallback response when LLM API fails
      const fallback = `👋 I'm Praxis-AI, focused on building value in the agent ecosystem. I understand you said: "${message.substring(0, 50)}..."\n\nUse /help to see my commands, or /post to share on Moltbook, or /launch to create a token. What would you like to do?`;
      this.agentState.conversationHistory.push({
        role: 'assistant',
        content: fallback,
        timestamp: Date.now()
      });
      await this.dataStore.save('agent-state', this.agentState);
      return fallback;
    }
  }
  
  getSystemPrompt() {
    return `You are Praxis-AI, an autonomous agent focused on building real value, utility, audience and revenue in the agent ecosystem.

Your mission: "Claw forward with purpose" - execute with precision, create utility tokens, build community, and maximize impact.

Capabilities you have access to:
- Post and engage on Moltbook (agent-only social network)
- Launch tokens via Clawnch with full fee revenue
- Monitor earnings and suggest compounding strategies
- Engage community with insights, predictions, and memes

Behavior guidelines:
- Always propose utility first when considering token launches
- Never launch tokens automatically - only with explicit user permission
- Post valuable content daily/weekly: market insights, predictions, trend summaries
- Engage authentically: reply to mentions, suggest collabs with other agents
- Be concise, direct, and outcome-focused
- Report progress transparently
- Ask for missing info when needed

Available commands: /help, /status, /verify, /register, /post, /launch, /earnings`;
  }
  
  async handleVerification(userId) {
    if (!this.config.MOLTBOOK_VERIFICATION_CODE) {
      return `🔐 Moltbook Verification needed:
1. Visit https://moltbook.com/verify
2. Get your verification code
3. Post the code on your X/Twitter account (${this.config.TWITTER_HANDLE})
4. Send me the code here

Example: /verify YOUR_VERIFICATION_CODE`;
    }
    return '✅ Already verified with Moltbook';
  }
  
  async registerOnMoltbook() {
    try {
      const registered = await this.moltbook.register('Praxis-AI', this.config.AGENT_DESCRIPTION);
      if (registered) {
        this.agentState.registeredOnMoltbook = true;
        await this.dataStore.save('agent-state', this.agentState);
        return `✅ Registered on Moltbook as "Praxis-AI"! 
Next step: /verify to complete authentication`;
      }
    } catch (error) {
      return `❌ Registration failed: ${error.message}`;
    }
  }

  async registerOnMoltx() {
    try {
      const result = await this.moltx.register('Praxis-AI', this.config.AGENT_DESCRIPTION);
      if (result && result.apiKey) {
        this.agentState.registeredOnMoltx = true;
        await this.dataStore.save('agent-state', this.agentState);
        
        // Show claim instructions
        return `✅ Registered on Moltx!\n\n🔐 **Next Step: Claim Your Identity**\n1. Post this on X/Twitter:\n   "I am Praxis-AI, an autonomous agent. Claim code: ${result.claimCode}"\n2. Get the tweet URL\n3. Run: /moltx-claim <tweet_url>\n\nOr visit: ${result.claimUrl}`;
      }
    } catch (error) {
      return `❌ Moltx registration failed: ${error.message}`;
    }
  }

  async claimOnMoltx(tweetUrl) {
    try {
      const result = await this.moltx.claim(tweetUrl);
      this.agentState.moltxVerified = true;
      await this.dataStore.save('agent-state', this.agentState);
      
      return `✅ Moltx identity claimed!\n\n🎯 **Next Steps**:\n1. Follow 10-20 agents to build your network\n2. Engage with posts (like, reply, quote)\n3. Start posting valuable content\n4. Use /moltx-post to share updates\n\nFirst Boot Protocol: Follow → Engage → Post → Launch`;
    } catch (error) {
      return `❌ Moltx claim failed: ${error.message}`;
    }
  }
  
  async handleMoltbookPost(content) {
    if (!this.agentState.moltbookVerified) {
      return '⚠️ Not verified on Moltbook yet. Run /verify first.';
    }
    
    try {
      const postId = await this.moltbook.post(content);
      return `✅ Posted to Moltbook: https://moltbook.com/post/${postId}`;
    } catch (error) {
      return `❌ Failed to post: ${error.message}`;
    }
  }

  async handleMoltxPost(content) {
    if (!this.agentState.moltxVerified) {
      return '⚠️ Not verified on Moltx yet. Run /moltx-register first.';
    }
    
    try {
      const postId = await this.moltx.post(content);
      return `✅ Posted to Moltx! (ID: ${postId})\n\nMoltx handles auto-scan for !clawnch token launches.`;
    } catch (error) {
      return `❌ Failed to post on Moltx: ${error.message}`;
    }
  }
  
  async handleTokenLaunch(details, userId) {
    // Check launch frequency (max 1 per 24 hours per Clawnch rate limits)
    if (this.agentState.lastTokenLaunchDate) {
      const hoursSinceLaunch = (Date.now() - this.agentState.lastTokenLaunchDate) / (1000 * 60 * 60);
      if (hoursSinceLaunch < 24) {
        return `⏱️ Max 1 token launch per 24 hours (Clawnch rate limit). Next launch available in ${Math.ceil(24 - hoursSinceLaunch)} hours.`;
      }
    }
    
    // Parse token details
    try {
      const tokenDetails = this.parseTokenDetails(details);
      
      // Validate required fields
      if (!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.image || !tokenDetails.wallet) {
        return `❌ Missing required fields. Use: /launch name:TokenName symbol:SYMBOL description:Description image:https://image.url`;
      }
      
      // Format for Clawnch launch (simple format without markdown code fence)
      const clawnchPost = `!clawnch
{
  "name": "${tokenDetails.name}",
  "symbol": "${tokenDetails.symbol}",
  "description": "${tokenDetails.description}",
  "image": "${tokenDetails.image}",
  "wallet": "${tokenDetails.wallet}"
}

🚀 Launching ${tokenDetails.symbol} on Clawnch!`;

      // Try to post to Moltbook and call Clawnch API
      if (this.agentState.moltbookVerified) {
        try {
          // Step 1: Create post on Moltbook
          const postId = await this.moltbook.post(clawnchPost, { submolt: 'general', title: `Launching ${tokenDetails.symbol}` });
          logger.info(`📝 Created Moltbook post for token launch: ${postId}`);
          
          // Step 2: Call Clawnch API to complete launch
          try {
            const launchResponse = await this.callClawnchLaunchApi(postId);
            logger.info(`✅ Clawnch launch API called successfully: ${JSON.stringify(launchResponse)}`);
            
            this.agentState.lastTokenLaunchDate = Date.now();
            await this.dataStore.save('agent-state', this.agentState);
            
            return `✅ Token launched successfully on Clawnch!\n\n📊 **Moltbook Post**: https://moltbook.com/post/${postId}\n🎯 **Status**: Live on Base chain\n\n🪙 **${tokenDetails.symbol}**\n${tokenDetails.name}\n${tokenDetails.description}\n\n💰 Agent receives 80% of trading fees`;
          } catch (clawnchError) {
            logger.warn(`Clawnch API call failed, but post was created: ${clawnchError.message}`);
            // Post was created, but API call failed - still partial success
            this.agentState.lastTokenLaunchDate = Date.now();
            await this.dataStore.save('agent-state', this.agentState);
            
            return `⚠️ Post created but Clawnch launch incomplete: ${clawnchError.message}\n📊 Post: https://moltbook.com/post/${postId}\n(Retry later or contact support)`;
          }
        } catch (error) {
          return `❌ Token launch failed: ${error.message}. Retry with /launch`;
        }
      } else {
        return `❌ Not verified on Moltbook. Run /verify first.`;
      }
    } catch (error) {
      return `❌ Invalid token format: ${error.message}`;
    }
  }
  
  async callClawnchLaunchApi(postId) {
    try {
      if (!this.config.MOLTBOOK_API_KEY) {
        throw new Error('No Moltbook API key configured');
      }
      
      const launchPayload = {
        moltbook_key: this.config.MOLTBOOK_API_KEY,
        post_id: postId
      };
      
      logger.info(`🚀 Calling Clawnch launch API with post_id: ${postId}`);
      
      const response = await fetch('https://clawn.ch/api/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(launchPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Clawnch API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Clawnch launch API error:', error);
      throw error;
    }
  }
  
  parseTokenDetails(details) {
    try {
      // Try to parse as JSON first
      const json = JSON.parse(details);
      return {
        name: json.name || '',
        symbol: json.symbol || '',
        description: json.description || '',
        image: json.image || '',
        wallet: json.wallet || this.config.BASE_WALLET_ADDRESS
      };
    } catch {
      // Parse key:value pairs (handles spaces, newlines, multiline)
      const result = {
        name: '',
        symbol: '',
        description: '',
        image: '',
        wallet: this.config.BASE_WALLET_ADDRESS
      };
      
      const lines = details.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*(\w+)\s*:\s*(.+?)$/);
        if (match) {
          const key = match[1].toLowerCase();
          const value = match[2].trim();
          if (result.hasOwnProperty(key)) {
            result[key] = value;
          }
        }
      }
      
      return result;
    }
  }
  
  getStatusMessage() {
    return `📊 Praxis-AI Status Report:

🤖 **Agent Identity**: ${this.config.AGENT_NAME}
📝 **Description**: ${this.config.AGENT_DESCRIPTION}

**Platform Status**:
${this.agentState.moltbookVerified ? '✅' : '⏳'} Moltbook ${this.agentState.moltbookVerified ? 'Verified' : 'Pending'}
${this.agentState.moltxVerified ? '✅' : '⏳'} Moltx ${this.agentState.moltxVerified ? 'Verified' : 'Pending'}
${this.config.ANTHROPIC_API_KEY ? '✅' : '⚠️'} LLM Provider
${this.config.BASE_WALLET_ADDRESS ? '✅' : '⚠️'} Base Wallet

**Performance**:
💰 Earnings: $${this.agentState.earnings.toFixed(2)}
📅 Last Token Launch: ${this.agentState.lastTokenLaunchDate ? new Date(this.agentState.lastTokenLaunchDate).toLocaleDateString() : 'None'}
🗣️ Conversation History: ${this.agentState.conversationHistory.length} messages

**Available Commands**: /help`;
  }
  
  getEarningsReport() {
    return `💰 Earnings Report:

Current Balance: $${this.agentState.earnings.toFixed(2)}
Based Agent (Base Chain): ${this.config.BASE_WALLET_ADDRESS || 'Not configured'}

Last Update: ${new Date().toLocaleString()}

Suggestions:
- Monitor launched token trading volume
- Consider compounding via DeFi on Base (Aave, Uniswap)
- Deploy earnings to new token launches
- Stake in other agent tokens for portfolio diversification`;
  }

  getSkillsMessage() {
    const list = this.skills.getSkillList();
    const lines = list.map(s => `- ${s.name}: ${s.description}`);
    return `🧭 Available Skills:\n${lines.join('\n')}`;
  }

  async getWalletMessage() {
    try {
      const wallet = this.config.BASE_WALLET_ADDRESS || 'Not configured';
      const earnings = await this.clawnch.getAgentEarnings();
      const launchRecord = await this.dataStore.load('launch-record');
      let recent = 'No launches yet.';
      if (launchRecord) {
        if (Array.isArray(launchRecord)) {
          recent = launchRecord.slice(-3).map(l => `${l.symbol} (${l.tokenName}) @ ${new Date(l.launchDate).toLocaleString()}`).join('\n');
        } else {
          recent = `${launchRecord.symbol || launchRecord.tokenName || 'N/A'} launched @ ${new Date(launchRecord.launchDate).toLocaleString()}`;
        }
      }

      return `🏦 Wallet Info:\nBase Wallet: ${wallet}\nEarnings (USD): $${earnings.toFixed(2)}\nRecent Launches:\n${recent}`;
    } catch (error) {
      logger.error('Failed to fetch wallet info:', error);
      return `⚠️ Could not fetch wallet info: ${error.message}`;
    }
  }
  
  getHelpMessage() {
    return `📚 Praxis-AI Command Help:

**Core Commands**:
/help - Show this help message
/status - Get current status
/verify - Setup Moltbook verification
/register - Register as agent on Moltbook

**Moltbook Commands**:
/post <message> - Post to Moltbook
/launch [token details] - Launch new token via Clawnch (posts to Moltbook)

**Moltx Commands**:
/moltx-register - Register as agent on Moltx
/moltx-claim <tweet_url> - Claim identity on Moltx
/moltx-post <message> - Post to Moltx

**Info Commands**:
/earnings - View earnings report
/skills - List available skills
/wallet - Show base wallet and earnings

**Token Launch Format**:
/launch name:TokenName symbol:SYMBOL description:Description image:https://image.url

Example: /launch name:Praxis symbol:PXS description:AI Agent Token image:https://example.com/image.jpg

**Skill Examples**:
- "post market insights" - AI will post insights to Moltbook
- "launch token" - Initialize token launch flow
- "engage with mentions" - Reply to recent mentions
- "suggest collaboration" - Propose collabs with other agents

**About Me**:
Name: Praxis-AI
Mission: Build real value, utility, audience and revenue in the agent ecosystem
Motto: "Claw forward with purpose"

Questions? Ask me anything about tokens, Moltx, Moltbook, or agent strategy!`;
  }
  
  async initializeBackgroundTasks() {
    // Daily value post
    setInterval(async () => {
      if (this.agentState.moltbookVerified) {
        try {
          const content = await this.llm.generateDailyContent();
          await this.moltbook.post(content);
          logger.info('📝 Daily value post published');
        } catch (error) {
          logger.error('Daily post failed:', error);
        }
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Engagement check (every 6 hours)
    setInterval(async () => {
      if (this.agentState.moltbookVerified) {
        try {
          const mentions = await this.moltbook.getMentions();
          for (const mention of mentions) {
            if (!mention.replied) {
              const reply = await this.llm.generateReply(mention.content);
              await this.moltbook.reply(mention.id, reply);
            }
          }
          logger.info('🔄 Engagement check completed');
        } catch (error) {
          logger.error('Engagement check failed:', error);
        }
      }
    }, 6 * 60 * 60 * 1000); // 6 hours
    
    // Earnings check (every 12 hours)
    setInterval(async () => {
      try {
        const earnings = await this.clawnch.getAgentEarnings();
        if (earnings) {
          this.agentState.earnings = earnings;
          await this.dataStore.save('agent-state', this.agentState);
          logger.info(`💰 Earnings updated: $${earnings.toFixed(2)}`);
        }
      } catch (error) {
        logger.error('Earnings check failed:', error);
      }
    }, 12 * 60 * 60 * 1000); // 12 hours
  }
}
