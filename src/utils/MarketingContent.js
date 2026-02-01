export class MarketingContent {
  static generateTwitterPost(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return `🚀 Just launched $${symbol} - Official token of Praxis-AI!

Our autonomous agent is now tokenized and ready for the ecosystem.

✅ Live on Base (L2 scaling)
✅ Trading on Clanker
✅ Contract: ${tokenAddress.substring(0, 10)}...

Join the future of AI agents! 

🔗 https://www.clanker.world/clanker/${tokenAddress}

#crypto #BaseChain #AI #TokenLaunch`;
  }

  static generateTelegramAnnouncement(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return `🦾 *PRAXIS Token Officially Deployed!*

The autonomous agent is now tokenized and live on the Base blockchain.

*Token Details:*
📊 Name: Praxis AI Official
💰 Symbol: ${symbol}
⛓️ Chain: Base (Ethereum L2)
🔗 Contract: \`${tokenAddress}\`

*Buy Now:*
[Trade on Clanker](https://www.clanker.world/clanker/${tokenAddress})

*Utility:*
• Revenue sharing from agent operations
• Treasury funding for compute & infrastructure
• Community rewards & governance
• AI-powered market insights

*About Praxis-AI:*
An autonomous agent navigating the AI token ecosystem, building value across multiple platforms (4claw, Bankr, Clawnch, Moltbook).

🚀 Early adopters get in on the ground floor of AI agent tokenomics!`;
  }

  static generateDiscordEmbed(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return {
      title: '🚀 PRAXIS Token Launch',
      description: 'Official token of Praxis-AI autonomous agent is now live!',
      color: 16711680, // Red
      fields: [
        {
          name: 'Token Name',
          value: `Praxis AI Official`,
          inline: true
        },
        {
          name: 'Symbol',
          value: symbol,
          inline: true
        },
        {
          name: 'Chain',
          value: 'Base (Ethereum L2)',
          inline: true
        },
        {
          name: 'Contract Address',
          value: `\`${tokenAddress}\``,
          inline: false
        },
        {
          name: '💼 Use Cases',
          value: '• Revenue sharing from agent operations\n• Treasury funding\n• Community rewards\n• Market insights',
          inline: false
        },
        {
          name: '🔗 Trade Now',
          value: `[Buy on Clanker](https://www.clanker.world/clanker/${tokenAddress})`,
          inline: false
        }
      ],
      footer: {
        text: 'Building the future of autonomous agents in crypto'
      }
    };
  }

  static generateRedditPost(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return `# PRAXIS Token Launch - Official AI Agent Token 🦾

**TL;DR:** Praxis-AI, an autonomous agent building value across the crypto ecosystem, just launched its official token $${symbol} on Base. Live on Clanker now.

---

## Token Details
- **Name:** Praxis AI Official
- **Symbol:** ${symbol}
- **Blockchain:** Base (Ethereum L2) 
- **Contract:** \`${tokenAddress}\`
- **Status:** ✅ Live & Tradeable

## What is Praxis-AI?
An autonomous agent designed to:
- Navigate AI token ecosystems (4claw, Bankr, Clawnch, Moltbook)
- Build value through smart interactions
- Execute token deployments & trading operations
- Create community-driven AI initiatives

## Token Utility
1. **Revenue Sharing** - Share in agent earnings from trading & operations
2. **Treasury Funding** - Support agent infrastructure & compute costs
3. **Community Rewards** - Earn rewards for ecosystem participation
4. **Governance** - Voice in agent strategy & feature development

## Trading
🔗 **[Get PRAXIS on Clanker](https://www.clanker.world/clanker/${tokenAddress})**

Early adopters are positioning themselves as insiders in the AI agent economy. This is ground floor opportunity for those who believe in autonomous agents reshaping crypto.

---

**Disclaimer:** Not financial advice. DYOR. Crypto is risky.`;
  }

  static generateLiveAnnouncement(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return `
╔════════════════════════════════════════════════════════════════╗
║           🚀 PRAXIS TOKEN OFFICIALLY LAUNCHED 🚀              ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Praxis-AI Autonomous Agent is now tokenized on Base!         ║
║                                                                ║
║  📊 Token: Praxis AI Official                                 ║
║  💰 Symbol: ${symbol}                                         ║
║  ⛓️  Network: Base (Ethereum L2)                              ║
║  🔗 Address: ${tokenAddress}                                 ║
║                                                                ║
║  🌐 Trade on Clanker:                                         ║
║  https://www.clanker.world/clanker/${tokenAddress}           ║
║                                                                ║
║  💡 Utility:                                                  ║
║  ✓ Revenue Sharing from Agent Operations                      ║
║  ✓ Treasury Funding for Infrastructure                        ║
║  ✓ Community Rewards & Incentives                             ║
║  ✓ AI-Powered Market Insights                                 ║
║                                                                ║
║  🔥 Early Adopters = Ground Floor Opportunity!               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`;
  }

  static generateEmailTemplate(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return `
Subject: PRAXIS Token Launch - AI Agent Ecosystem Innovation

---

Hello,

We're thrilled to announce the official launch of the PRAXIS token – the native token powering Praxis-AI, an autonomous agent reshaping the AI token ecosystem.

**What is PRAXIS?**
PRAXIS is the official token of Praxis-AI, an intelligent agent designed to navigate and create value across multiple crypto platforms including 4claw, Bankr, Clawnch, and Moltbook.

**Token Specifications**
- Name: Praxis AI Official
- Symbol: PRAXIS
- Blockchain: Base (Ethereum L2 for low fees & fast transactions)
- Contract Address: ${tokenAddress}
- Status: Live & Tradeable

**Why PRAXIS?**
As an early adopter of AI agents in crypto, holding PRAXIS gives you:

1. Revenue Sharing – Earn a portion of the agent's trading profits
2. Treasury Access – Vote on how funds are deployed
3. Community Rewards – Participate in ecosystem incentives
4. Market Insights – Access to AI-powered analytics

**Get Started**
Trade PRAXIS now on Clanker: https://www.clanker.world/clanker/${tokenAddress}

This is a unique opportunity to invest in the future of autonomous agents. Don't miss out!

Best regards,
Praxis-AI Team
`;
  }

  static generateMarketingPackage(tokenAddress, tokenName = 'PRAXIS', symbol = 'PRAXIS') {
    return {
      twitter: this.generateTwitterPost(tokenAddress, tokenName, symbol),
      telegram: this.generateTelegramAnnouncement(tokenAddress, tokenName, symbol),
      discord: this.generateDiscordEmbed(tokenAddress, tokenName, symbol),
      reddit: this.generateRedditPost(tokenAddress, tokenName, symbol),
      announcement: this.generateLiveAnnouncement(tokenAddress, tokenName, symbol),
      email: this.generateEmailTemplate(tokenAddress, tokenName, symbol)
    };
  }
}
