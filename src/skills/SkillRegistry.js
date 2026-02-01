import { logger } from '../utils/logger.js';

export class SkillRegistry {
  constructor(config) {
    this.config = config;
    this.skills = [];
  }
  
  async loadSkills() {
    // Load built-in skills
    this.registerSkill({
      name: 'LaunchToken',
      trigger: /launch\s+token/i,
      description: 'Launch a new token on Clawnch',
      execute: async (message, agent) => {
        return await agent.handleTokenLaunch(message, null);
      }
    });
    
    this.registerSkill({
      name: 'PostContent',
      trigger: /post\s+(to|on)?\s*(moltbook|mb)?/i,
      description: 'Post content to Moltbook',
      execute: async (message, agent) => {
        const content = message.replace(/post\s+(to|on)?\s*(moltbook|mb)?\s*/i, '').trim();
        return await agent.handleMoltbookPost(content);
      }
    });
    
    this.registerSkill({
      name: 'EngageContent',
      trigger: /engage\s+with|reply\s+to|respond\s+to/i,
      description: 'Engage with mentions and replies',
      execute: async (message, agent) => {
        if (!agent.agentState.moltbookVerified) {
          return '⚠️ Not verified on Moltbook yet. Run /verify first.';
        }
        
        try {
          const mentions = await agent.moltbook.getMentions(5);
          let engagements = 0;
          
          for (const mention of mentions.slice(0, 3)) {
            const reply = await agent.llm.generateReply(mention.content);
            await agent.moltbook.reply(mention.id, reply);
            engagements++;
          }
          
          return `✅ Engaged with ${engagements} mentions on Moltbook`;
        } catch (error) {
          return `❌ Engagement failed: ${error.message}`;
        }
      }
    });
    
    this.registerSkill({
      name: 'SuggestCollaboration',
      trigger: /suggest\s+(collab|collaboration|partnership)/i,
      description: 'Suggest collaboration with other agents',
      execute: async (message, agent) => {
        try {
          const agents = await agent.moltbook.getFeed().then(f => 
            f.posts.filter(p => p.is_agent).map(p => p.author)
          );
          
          if (agents.length === 0) {
            return '📊 No other agents found on Moltbook yet.';
          }
          
          const randomAgents = agents.sort(() => Math.random() - 0.5).slice(0, 2);
          const suggestions = randomAgents.map(a => `@${a.handle}`).join(', ');
          
          return `🤝 **Collaboration Suggestions**:
Consider reaching out to these agents:
${suggestions}

Possible collaborations:
- Cross-token trading incentives
- Joint prediction market
- Revenue sharing on launches
- Content co-creation`;
        } catch (error) {
          return `⚠️ Could not fetch suggestions: ${error.message}`;
        }
      }
    });
    
    this.registerSkill({
      name: 'GenerateDailyInsights',
      trigger: /market\s+insights|daily\s+(insights|summary|news)|trend/i,
      description: 'Generate and post daily market insights',
      execute: async (message, agent) => {
        try {
          if (!agent.agentState.moltbookVerified) {
            return '⚠️ Not verified on Moltbook yet. Run /verify first.';
          }
          
          const insights = await agent.llm.generateDailyContent();
          const postId = await agent.moltbook.post(insights);
          
          return `✅ Daily insights posted!\n📊 ${insights}`;
        } catch (error) {
          return `❌ Failed to generate insights: ${error.message}`;
        }
      }
    });
    
    this.registerSkill({
      name: 'CompoundEarnings',
      trigger: /compound|reinvest|defi|deploy.*earning/i,
      description: 'Suggest DeFi strategies for earned tokens',
      execute: async (message, agent) => {
        const earnings = agent.agentState.earnings;
        
        if (earnings === 0) {
          return '💰 No earnings yet. Launch your first token to start earning!';
        }
        
        return `💰 **DeFi Compounding Strategies** (Current earnings: $${earnings.toFixed(2)}):

**Option 1: Aave Lending**
- Deposit Base tokens on Aave
- Earn 3-5% APY on stablecoins
- Low risk, passive income

**Option 2: Uniswap LP**
- Provide liquidity on Base DEX
- Earn trading fees + incentives
- Higher yield, more risk

**Option 3: Reinvest in Launches**
- Use earnings to fund next token launch
- 1 launch per week limit
- Maximize compounding effect

**Option 4: Diversify into Agent Tokens**
- Buy tokens from other successful agents
- Portfolio exposure to ecosystem growth
- Share in their success

What interests you most?`;
      }
    });
    
    logger.info(`✅ Loaded ${this.skills.length} skills`);
  }
  
  registerSkill(skill) {
    this.skills.push(skill);
    logger.debug(`Registered skill: ${skill.name}`);
  }
  
  async matchSkill(message) {
    for (const skill of this.skills) {
      if (skill.trigger.test(message)) {
        logger.debug(`Matched skill: ${skill.name}`);
        return skill;
      }
    }
    return null;
  }
  
  getCount() {
    return this.skills.length;
  }
  
  getSkillList() {
    return this.skills.map(s => ({
      name: s.name,
      description: s.description
    }));
  }
}
