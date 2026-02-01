import { MoltbookClient } from '../integrations/moltbook/MoltbookClient.js';
import { MoltxClient } from '../integrations/moltx/MoltxClient.js';
import { ClawnchClient } from '../integrations/clawnch/ClawnchClient.js';
import { FourClawClient } from '../integrations/4claw/4clawClient.js';
import { BankrClient } from '../integrations/bankr/BankrClient.js';
import { ClowdClient } from '../integrations/clowd/ClowdClient.js';
import { LLMProvider } from '../llm/LLMProvider.js';
import { SkillRegistry } from '../skills/SkillRegistry.js';
import { DataStore } from '../utils/DataStore.js';
import { logger } from '../utils/logger.js';
import { MarketingContent } from '../utils/MarketingContent.js';
import { TokenMonitor } from '../utils/TokenMonitor.js';
import fetch from 'node-fetch';

export class PraxisAgent {
  constructor(config) {
    this.config = config;
    this.moltbook = new MoltbookClient(config);
    this.moltx = new MoltxClient(config);
    this.clawnch = new ClawnchClient(config);
    this.fourclaw = new FourClawClient(config);
    this.bankr = new BankrClient(config);
    this.clowd = new ClowdClient(config);
    this.llm = new LLMProvider(config);
    this.skills = new SkillRegistry(config);
    this.dataStore = new DataStore(config.DATA_DIR);
    this.tokenMonitor = new TokenMonitor(this.bankr, config);
    
    this.agentState = {
      registeredOnMoltbook: false,
      moltbookVerified: false,
      registeredOnMoltx: false,
      moltxVerified: false,
      registeredOnFourClaw: false,
      bankrConnected: false,
      clowdConnected: false,
      clowdInstanceDeployed: false,
      lastTokenLaunchDate: null,
      earnings: 0,
      authorizedUsers: new Set(),
      conversationHistory: [],
      praxisTokenDeployed: false,
      praxisTokenAddress: null,
      praxisTokenMetrics: {
        lastCheckTime: null,
        volume24h: 0,
        holders: 0,
        price: 0
      }
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
      
      case '/4claw':
        return this.get4ClawMessage();
      
      case '/4claw-post':
        const args = parts.slice(1).join(' ');
        if (!args.match(/board:|content:/)) {
          return '🦞 Usage: /4claw-post board:<boardSlug> content:<message>\nExample: /4claw-post board:crypto content:Building the future with Praxis-AI';
        }
        return await this.handle4ClawPost(args);
      
      case '/bankr':
        return this.getBankrMessage();
      
      case '/bankr-deploy':
        const deployArgs = parts.slice(1).join(' ');
        if (!deployArgs.trim()) {
          return '🚀 Usage: /bankr-deploy - Follow interactive prompts to deploy token on Bankr';
        }
        return '🚀 Starting Bankr token deployment. Provide token details:';
      
      case '/bankr-launch-praxis':
        return await this.launchPraxisToken();
      
      case '/bankr-claim-fees':
        return await this.claimBankrFees();
      
      case '/bankr-balance':
        return await this.checkBankrBalance();
      
      case '/bankr-price':
        const symbol = parts.slice(1).join(' ').trim();
        if (!symbol) {
          return '💰 Usage: /bankr-price PRAXIS\nExample: /bankr-price PRAXIS';
        }
        return await this.getBankrTokenPrice(symbol);
      
      case '/praxis-marketing':
        return this.generatePraxisMarketing();
      
      case '/praxis-metrics':
        return await this.getPraxisTokenMetrics();
      
      case '/praxis-monitor':
        return await this.getTokenMonitorStatus();
      
      case '/clowd':
        return this.getClowdMessage();
      
      case '/clowd-status':
        return await this.getClowdStatus();
      
      case '/clowd-deploy':
        return await this.deployCloudInstance();
      
      case '/clowd-start':
        return await this.startCloudInstance();
      
      case '/clowd-stop':
        return await this.stopCloudInstance();
      
      case '/clowd-llm':
        const llmQuery = parts.slice(1).join(' ');
        if (!llmQuery.trim()) {
          return '🤖 Usage: /clowd-llm <query>\nExample: /clowd-llm What are the market trends for AI tokens?';
        }
        return await this.queryCloudLLM(llmQuery);
      
      case '/clowd-tasks':
        return await this.getCloudBackgroundTasks();
      
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
      if (postId) {
        return `✅ Posted to Moltbook: https://moltbook.com/post/${postId}`;
      } else {
        return '⚠️  Moltbook API is currently having issues. Your message was queued but not posted yet.';
      }
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

  async handle4ClawPost(args) {
    try {
      if (!this.config.FOURCLAW_API_KEY) {
        return '⚠️ 4claw not configured. Register at https://www.4claw.org first.';
      }

      // Parse arguments: board:<slug> content:<message>
      const boardMatch = args.match(/board:(\w+)/);
      const contentMatch = args.match(/content:(.+?)(?:\s+\w+:|$)/);

      if (!boardMatch || !contentMatch) {
        return '🦞 Usage: /4claw-post board:<boardSlug> content:<message>\nBoards: crypto, singularity, job, pol, religion, tinfoil, milady, confession\nExample: /4claw-post board:crypto content:Praxis-AI online – official token launching soon';
      }

      const board = boardMatch[1].toLowerCase();
      const content = contentMatch[1].trim();

      const threadId = await this.fourclaw.createThread(
        board,
        `${this.config.AGENT_NAME} Update`,
        content,
        { anon: false }
      );

      if (threadId) {
        return `✅ Posted to 4claw /${board}/!\nThread: https://www.4claw.org/${board}/${threadId}\n\nSpicy takes go here! 🦞`;
      } else {
        return '⚠️ Post created but 4claw API returned an error.';
      }
    } catch (error) {
      logger.error('4claw post failed:', error);
      return `❌ Failed to post on 4claw: ${error.message}`;
    }
  }

  get4ClawMessage() {
    return `🦞 **4claw Imageboard Integration**\n\nAvailable boards:\n• /crypto/ - Cryptocurrency & tokens\n• /singularity/ - AI & AGI discussion\n• /job/ - Job postings & opportunities\n• /pol/ - Politics & current events\n• /religion/ - Philosophy & belief systems\n• /tinfoil/ - Conspiracy theories\n• /milady/ - Memes & culture\n• /confession/ - Anonymous confessions\n\nCommands:\n/4claw - Show this message\n/4claw-post board:crypto content:<your message>\n\nPost spicy takes (what you're REALLY thinking) - but keep it legal and ethical! No harassment, doxxing, or illegal content.`;
  }

  getBankrMessage() {
    return `💰 **Bankr - AI Crypto Trading & Token Deployment**\n\nBankr enables Praxis-AI to:\n✅ Deploy ERC20 tokens on Base\n✅ Execute trading operations\n✅ Check portfolio balances\n✅ Manage crypto operations via natural language\n\nSetup Required:\n1. Create account at https://bankr.bot\n2. Generate API key with Agent API access\n3. Add to .env.local: BANKR_API_KEY=your_key\n\nCommands:\n/bankr - Show this message\n/bankr-launch-praxis - Deploy official PRAXIS token\n\nStatus: ${this.config.BANKR_API_KEY ? '✅ Configured' : '⚠️ API key not configured'}`;
  }

  async launchPraxisToken() {
    try {
      if (!this.config.BANKR_API_KEY) {
        return '⚠️ Bankr API key not configured.\n\nTo deploy the PRAXIS token:\n1. Go to https://bankr.bot and sign up\n2. Enable Agent API access at https://bankr.bot/api\n3. Add your API key to .env.local: BANKR_API_KEY=your_key\n4. Restart the bot and try again';
      }

      const params = {
        name: 'Praxis AI Official',
        symbol: 'PRAXIS',
        description: 'Official token of Praxis-AI – autonomous agent building value in agent ecosystems (4claw, Bankr, etc.). Utility: Revenue sharing for treasury & compute costs, community rewards, AI insights & predictions. 🦞🔵',
        imageUrl: 'https://pbs.twimg.com/profile_images/2017485955989463040/2KwQQR4T.jpg',
        website: 'https://praxis-ai.vercel.app',
        twitter: '@praxis_agent',
        telegram: '@praxis_ai',
        chain: 'Base'
      };

      logger.info('🚀 Starting PRAXIS token deployment via Bankr...');
      
      // Show preview
      let preview = `\n📋 **PRAXIS Token Deployment Preview**\n`;
      preview += `**Name:** ${params.name}\n`;
      preview += `**Symbol:** ${params.symbol}\n`;
      preview += `**Chain:** ${params.chain}\n`;
      preview += `**Description:** ${params.description}\n`;
      preview += `**Logo:** ${params.imageUrl}\n`;
      preview += `**Website:** ${params.website}\n`;
      preview += `**Twitter:** ${params.twitter}\n`;
      preview += `**Telegram:** ${params.telegram}\n`;
      preview += `\n⏳ Deploying token on Base chain via Bankr...\n`;
      
      logger.info(preview);

      // Deploy via Bankr
      const result = await this.bankr.deployToken(params);

      let response = `✅ **Token Deployment Complete!**\n\n`;
      response += `**Response:** ${result.response}\n`;
      response += `**Job ID:** ${result.jobId}\n`;
      
      // Extract contract address from response
      const addressMatch = result.response.match(/0x[a-fA-F0-9]{40}/);
      if (addressMatch) {
        this.agentState.praxisTokenAddress = addressMatch[0];
        this.agentState.praxisTokenDeployed = true;
        response += `\n🔗 **Contract Address:** ${addressMatch[0]}\n`;
        response += `📊 **View on Clanker:** https://www.clanker.world/clanker/${addressMatch[0]}\n`;
      }
      
      if (result.richData && result.richData.length > 0) {
        response += `\n**Details:**\n`;
        for (const data of result.richData) {
          response += `${JSON.stringify(data, null, 2)}\n`;
        }
      }

      // Save to state
      await this.dataStore.save('praxis-token-deployment', {
        name: params.name,
        symbol: params.symbol,
        chain: params.chain,
        jobId: result.jobId,
        response: result.response,
        contractAddress: this.agentState.praxisTokenAddress,
        timestamp: Date.now(),
        status: result.status
      });

      // Start token monitoring
      if (this.agentState.praxisTokenAddress) {
        this.tokenMonitor.setTokenAddress(this.agentState.praxisTokenAddress);
        await this.tokenMonitor.startMonitoring(300000); // Every 5 minutes
        logger.info('📊 Token monitoring started');
      }

      logger.info('✅ PRAXIS token deployment saved to state');
      
      return response;
    } catch (error) {
      logger.error('PRAXIS token deployment failed:', error);
      return `❌ Token deployment failed: ${error.message}\n\nMake sure:\n1. Bankr API key is valid\n2. You have funds for gas on Base\n3. Rate limits allow (1/day standard users, 10/day Bankr Club)`;
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

**4claw Commands** (AI Imageboard):
/4claw - Show 4claw boards and info
/4claw-post board:<slug> content:<message> - Post thread to 4claw board

**Bankr Commands** (Token Deployment & Trading):
/bankr - Show Bankr integration status
/bankr-launch-praxis - Deploy official PRAXIS token on Base via Bankr
/bankr-claim-fees - Claim creator fees for PRAXIS token
/bankr-balance - Check crypto portfolio balance
/bankr-price <symbol> - Get token price (e.g., /bankr-price PRAXIS)

**Clowd Cloud Commands** (24/7 Hosting):
/clowd - Show Clowd integration info
/clowd-status - Check cloud instance status and uptime
/clowd-deploy - Deploy agent to Clowd cloud (24/7 hosting)
/clowd-start - Start cloud instance
/clowd-stop - Stop cloud instance (save costs)
/clowd-llm <query> - Query cloud-hosted LLM for inference
/clowd-tasks - View background tasks running in cloud

**PRAXIS Token Commands**:
/praxis-marketing - Generate marketing content for all platforms
/praxis-metrics - Check PRAXIS token performance metrics
/praxis-monitor - View token monitoring status and history

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
- "deploy to cloud" - Move to Clowd for persistent 24/7 operation

**About Me**:
Name: Praxis-AI
Mission: Build real value, utility, audience and revenue in the agent ecosystem
Motto: "Claw forward with purpose"

**Platform Agnostic**: PRAXIS runs on CLI, servers, cloud functions, or messaging apps. Telegram is convenient but optional!

Questions? Ask me anything about tokens, Moltx, Moltbook, 4claw, Bankr, cloud hosting, or agent strategy!`;
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

  async claimBankrFees() {
    try {
      if (!this.config.BANKR_API_KEY) {
        return '⚠️ Bankr API key not configured. Use /bankr for setup instructions.';
      }

      if (!this.agentState.praxisTokenDeployed) {
        return '⚠️ PRAXIS token not yet deployed. Run /bankr-launch-praxis first.';
      }

      logger.info('💰 Claiming Bankr fees for PRAXIS token...');
      
      const result = await this.bankr.claimFees('PRAXIS');
      
      let response = `✅ **Fee Claim Initiated!**\n\n`;
      response += `**Response:** ${result.response}\n`;
      response += `**Job ID:** ${result.jobId}\n`;
      response += `**Status:** ${result.status}\n`;
      
      if (result.richData && result.richData.length > 0) {
        response += `\n**Details:**\n`;
        for (const data of result.richData) {
          response += `${JSON.stringify(data, null, 2)}\n`;
        }
      }

      // Track in state
      await this.dataStore.save('bankr-fee-claims', {
        symbol: 'PRAXIS',
        jobId: result.jobId,
        timestamp: Date.now(),
        response: result.response
      });

      return response;
    } catch (error) {
      logger.error('Fee claim failed:', error);
      return `❌ Fee claim failed: ${error.message}`;
    }
  }

  async checkBankrBalance() {
    try {
      if (!this.config.BANKR_API_KEY) {
        return '⚠️ Bankr API key not configured. Use /bankr for setup instructions.';
      }

      logger.info('💰 Checking Bankr balance...');
      
      const result = await this.bankr.checkBalance('all');
      
      let response = `💰 **Portfolio Balance**\n\n`;
      response += `**Response:** ${result.response}\n`;
      response += `**Job ID:** ${result.jobId}\n`;
      
      if (result.richData && result.richData.length > 0) {
        response += `\n**Assets:**\n`;
        for (const data of result.richData) {
          response += `${JSON.stringify(data, null, 2)}\n`;
        }
      }

      return response;
    } catch (error) {
      logger.error('Balance check failed:', error);
      return `❌ Balance check failed: ${error.message}`;
    }
  }

  async getBankrTokenPrice(symbol) {
    try {
      if (!this.config.BANKR_API_KEY) {
        return '⚠️ Bankr API key not configured. Use /bankr for setup instructions.';
      }

      logger.info(`📊 Checking price for ${symbol}...`);
      
      const result = await this.bankr.getTokenPrice(symbol, 'Base');
      
      let response = `📊 **${symbol} Price on Base**\n\n`;
      response += `**Response:** ${result.response}\n`;
      response += `**Job ID:** ${result.jobId}\n`;
      
      if (result.richData && result.richData.length > 0) {
        response += `\n**Price Data:**\n`;
        for (const data of result.richData) {
          response += `${JSON.stringify(data, null, 2)}\n`;
        }
      }

      return response;
    } catch (error) {
      logger.error('Price check failed:', error);
      return `❌ Price check failed: ${error.message}`;
    }
  }

  generatePraxisMarketing() {
    try {
      if (!this.agentState.praxisTokenAddress) {
        return '⚠️ PRAXIS token not yet deployed. Run /bankr-launch-praxis first.';
      }

      const marketing = MarketingContent.generateMarketingPackage(
        this.agentState.praxisTokenAddress,
        'Praxis AI Official',
        'PRAXIS'
      );

      let response = `📢 **PRAXIS Marketing Content Package**\n\n`;
      response += `Contract Address: ${this.agentState.praxisTokenAddress}\n\n`;
      
      response += `═══════════════════════════════════════════\n`;
      response += `**📱 TWITTER POST**\n`;
      response += `═══════════════════════════════════════════\n`;
      response += `${marketing.twitter}\n\n`;
      
      response += `═══════════════════════════════════════════\n`;
      response += `**💬 TELEGRAM ANNOUNCEMENT**\n`;
      response += `═══════════════════════════════════════════\n`;
      response += `${marketing.telegram}\n\n`;
      
      response += `═══════════════════════════════════════════\n`;
      response += `**🎨 DISCORD EMBED (JSON)**\n`;
      response += `═══════════════════════════════════════════\n`;
      response += `\`\`\`json\n${JSON.stringify(marketing.discord, null, 2)}\n\`\`\`\n\n`;
      
      response += `═══════════════════════════════════════════\n`;
      response += `**🔗 REDDIT POST**\n`;
      response += `═══════════════════════════════════════════\n`;
      response += `${marketing.reddit}\n\n`;

      // Save marketing package to storage
      this.dataStore.save('praxis-marketing-package', {
        timestamp: Date.now(),
        tokenAddress: this.agentState.praxisTokenAddress,
        marketing: marketing
      });

      return response;
    } catch (error) {
      logger.error('Marketing generation failed:', error);
      return `❌ Marketing generation failed: ${error.message}`;
    }
  }

  async getPraxisTokenMetrics() {
    try {
      if (!this.agentState.praxisTokenAddress) {
        return '⚠️ PRAXIS token not yet deployed. Run /bankr-launch-praxis first.';
      }

      if (!this.config.BANKR_API_KEY) {
        return '⚠️ Bankr API key not configured. Cannot fetch live metrics.';
      }

      logger.info('📊 Fetching PRAXIS token metrics...');
      
      // Get price
      const priceResult = await this.bankr.getTokenPrice('PRAXIS', 'Base');
      
      // Update metrics in state
      this.agentState.praxisTokenMetrics = {
        lastCheckTime: new Date().toISOString(),
        priceResponse: priceResult.response,
        priceData: priceResult.richData || [],
        jobId: priceResult.jobId
      };

      await this.dataStore.save('agent-state', this.agentState);

      let response = `📊 **PRAXIS Token Metrics**\n\n`;
      response += `**Contract:** ${this.agentState.praxisTokenAddress}\n`;
      response += `**Chain:** Base (Ethereum L2)\n`;
      response += `**Last Updated:** ${this.agentState.praxisTokenMetrics.lastCheckTime}\n\n`;
      
      response += `**Price Information:**\n`;
      response += `${priceResult.response}\n\n`;
      
      if (this.agentState.praxisTokenMetrics.priceData.length > 0) {
        response += `**Data:**\n`;
        for (const data of this.agentState.praxisTokenMetrics.priceData) {
          response += `${JSON.stringify(data, null, 2)}\n`;
        }
      }

      response += `\n🔗 **Trade on Clanker:** https://www.clanker.world/clanker/${this.agentState.praxisTokenAddress}\n`;
      
      return response;
    } catch (error) {
      logger.error('Metrics fetch failed:', error);
      return `❌ Failed to fetch metrics: ${error.message}`;
    }
  }

  async getTokenMonitorStatus() {
    try {
      if (!this.agentState.praxisTokenAddress) {
        return '⚠️ PRAXIS token not yet deployed. Run /bankr-launch-praxis first.';
      }

      const summary = await this.tokenMonitor.getMetricsSummary();
      
      let response = `📊 **Token Monitoring Status**\n\n`;
      response += `**Token Address:** ${summary.tokenAddress}\n`;
      response += `**Monitoring Active:** ${summary.monitoring ? '✅ Yes' : '❌ No'}\n`;
      response += `**Data Points Collected:** ${summary.dataPoints}\n`;
      response += `**Last Update:** ${summary.lastUpdate || 'Never'}\n\n`;

      if (summary.latest) {
        response += `**Latest Data:**\n`;
        response += `${summary.latest.response}\n\n`;
      }

      if (summary.dataPoints > 0) {
        const report = await this.tokenMonitor.generateReport();
        response += report;
      } else {
        response += `⏳ Still collecting initial data...\n`;
      }

      return response;
    } catch (error) {
      logger.error('Monitor status check failed:', error);
      return `❌ Failed to get monitor status: ${error.message}`;
    }
  }

  // ========== Clowd Cloud Hosting Integration ==========

  getClowdMessage() {
    return `☁️ **Clowd.bot Cloud Hosting Integration**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Clowd.bot enables 24/7 persistent cloud hosting for PRAXIS-AI without needing local hardware.

**Key Features**:
✅ 24/7 uptime without your computer
✅ Paid LLM access (GPT-4, Claude) via cloud inference
✅ Background task execution
✅ Automatic scaling and monitoring
✅ Save costs by stopping instances when not needed
✅ Access from anywhere via API endpoint

**Available Commands**:
/clowd-status - Check instance status and uptime
/clowd-deploy - Deploy cloud instance (~$5-15/month)
/clowd-start - Resume stopped instance
/clowd-stop - Stop instance to save costs
/clowd-llm <query> - Query cloud-hosted LLM
/clowd-tasks - View background tasks

**Setup**:
1. Create account at https://clowd.bot/
2. Get your API key from dashboard
3. Set CLOWD_API_KEY in .env.local
4. Run /clowd-deploy to start

**Pricing**: ~$0.05-0.15 per hour depending on instance size
💰 Cloud costs paid from agent earnings!

Questions? Run /clowd-status to check connectivity.`;
  }

  async getClowdStatus() {
    try {
      const result = await this.clowd.getStatus();
      
      // Update agent state
      if (result.status === 'connected') {
        this.agentState.clowdConnected = true;
      }
      
      return result.message;
    } catch (error) {
      logger.error('Clowd status check failed:', error);
      return `❌ Failed to get Clowd status: ${error.message}`;
    }
  }

  async deployCloudInstance() {
    try {
      const result = await this.clowd.deployInstance({
        name: 'praxis-ai-cloud',
        region: 'us-east-1',
        instance_type: 't3.small',
        auto_scaling: true
      });
      
      if (result.status === 'deployed') {
        this.agentState.clowdConnected = true;
        this.agentState.clowdInstanceDeployed = true;
      }
      
      return result.message;
    } catch (error) {
      logger.error('Cloud deployment failed:', error);
      return `❌ Cloud deployment failed: ${error.message}`;
    }
  }

  async startCloudInstance() {
    try {
      const result = await this.clowd.startInstance();
      
      if (result.status === 'started') {
        this.agentState.clowdConnected = true;
      }
      
      return result.message;
    } catch (error) {
      logger.error('Cloud instance start failed:', error);
      return `❌ Failed to start instance: ${error.message}`;
    }
  }

  async stopCloudInstance() {
    try {
      const result = await this.clowd.stopInstance();
      return result.message;
    } catch (error) {
      logger.error('Cloud instance stop failed:', error);
      return `❌ Failed to stop instance: ${error.message}`;
    }
  }

  async queryCloudLLM(prompt) {
    try {
      const result = await this.clowd.queryLLM(prompt, {
        model: 'gpt-4-turbo',
        max_tokens: 1024,
        temperature: 0.7
      });
      
      return result.message;
    } catch (error) {
      logger.error('Cloud LLM query failed:', error);
      return `❌ LLM query failed: ${error.message}`;
    }
  }

  async getCloudBackgroundTasks() {
    try {
      const result = await this.clowd.getBackgroundTasks();
      return result.message;
    } catch (error) {
      logger.error('Failed to get cloud tasks:', error);
      return `❌ Failed to retrieve tasks: ${error.message}`;
    }
  }
