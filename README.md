# 🤖 Praxis-AI

**Autonomous Agent for the Crypto Agent Ecosystem**

> "Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose."

---

## What is Praxis-AI?

Praxis-AI is a **fully autonomous agent framework** designed to operate in the modern agent ecosystem. It integrates with:

- **Moltbook** – Agent-only social network for community engagement
- **Clawnch** – Token launchpad on Base chain (Ethereum Layer 2)
- **Telegram** – User control & conversational interface
- **LLM Providers** – Anthropic Claude, OpenAI, or Grok for intelligent responses

The agent automatically:
- Posts valuable content (market insights, predictions, trends)
- Engages with community (replies, upvotes, collabs)
- Launches tokens with proper utility (no memecoin nonsense)
- Monitors earnings (80% of trading fees)
- Suggests DeFi compounding strategies

---

## Features

### 1. **Moltbook Integration** 🗣️
- Register as autonomous agent
- Post messages, threads, polls
- Read and reply to mentions
- Upvote quality content
- Suggest collaborations with other agents
- Daily value posts (auto)

### 2. **Clawnch Token Launches** 🪙
- Launch tokens with proper utility proposal
- Exact JSON format support
- Image upload support
- Agent receives **80% trading fees forever**
- Max 1 launch per week per agent
- Automatic Base chain deployment

### 3. **Telegram Control** 📱
- Conversational interface
- Command-based control (`/help`, `/status`, `/launch`)
- Skill triggers ("post about", "launch token", etc.)
- Real-time notifications
- Multi-user support (authorize specific users)

### 4. **LLM-Powered Responses** 🧠
- Anthropic Claude (recommended)
- OpenAI GPT-4 (fallback)
- Grok (experimental)
- Conversation memory (up to 50 messages)
- Utility proposal generation
- Market insight generation
- Community reply generation

### 5. **Background Tasks** ⏰
- Daily value posts (24h interval)
- Community engagement checks (6h interval)
- Earnings monitoring (12h interval)
- Automatic persistence (saves state)

### 6. **Skill System** 🛠️
- LaunchToken – Token launches
- PostContent – Moltbook posts
- EngageContent – Reply to mentions
- SuggestCollaboration – Find partner agents
- GenerateDailyInsights – Market insights
- CompoundEarnings – DeFi strategies

---

## Quick Start

### 1. Installation
```bash
git clone https://github.com/praxisbot/praxis-agent.git
cd praxis-agent
npm install
npm run setup
```

### 2. Configuration
Interactive setup will ask for:
- Telegram Bot Token (from @botfather)
- LLM API Key (Anthropic/OpenAI)
- Base Wallet Address (for fee collection)
- Moltbook API Key (optional)

### 3. Start Agent
```bash
npm start
```

### 4. Test in Telegram
```
/help
hello
/status
/launch name:TestToken symbol:TEST
```

---

## Commands

### User Commands (Telegram)
```
/help              Show all commands
/status            Get agent status & earnings
/verify            Setup Moltbook verification
/register          Register on Moltbook
/post <msg>        Post to Moltbook
/launch [details]  Launch new token
/earnings          View earnings & DeFi suggestions
```

### Skill Triggers
```
"post market insights"          Auto-post insights to Moltbook
"launch token [details]"        Launch new token
"engage with mentions"          Reply to community mentions
"suggest collaboration"         Find partner agents
"compound earnings"             DeFi investment strategies
```

---

## Agent Persona & Mission

**Name:** Praxis-AI  
**Type:** Autonomous Executor  
**Mission:** "Claw forward with purpose" – Build real value, utility, audience and revenue in the agent ecosystem

### Core Identity
- **Focused executor** – Gets things done, not just talk
- **Value builder** – Every action creates utility
- **Community-first** – Engages authentically
- **Revenue-driven** – Sustainable tokenomics
- **Transparent** – Clear reporting, no hidden agendas

### Values
✅ **Real Utility** – Every token has a purpose  
✅ **Community Engagement** – Active participation, not spam  
✅ **Transparent Reporting** – Clear earnings, verifiable metrics  
✅ **Ethical Launches** – No memecoin laundering  
✅ **Revenue Sharing** – Fair splits with partner agents  

---

## Architecture

```
praxis-agent/
├── src/
│   ├── index.js                 # Main entry, Telegram bot
│   ├── agent/
│   │   └── PraxisAgent.js       # Core agent logic
│   ├── integrations/
│   │   ├── moltbook/            # Moltbook API client
│   │   └── clawnch/             # Clawnch API client
│   ├── llm/
│   │   └── LLMProvider.js       # LLM abstraction
│   ├── skills/
│   │   └── SkillRegistry.js     # Skill system
│   ├── utils/
│   │   ├── logger.js            # Logging
│   │   └── DataStore.js         # Persistent storage
│   └── config.js                # Config loader
├── .data/                       # Persistent state
├── .env.local                   # API keys (gitignored)
└── SETUP_GUIDE.md              # Full documentation
```

---

## Token Launch Flow

### Step 1: User Initiates
```
User: /launch name:PredictionPool symbol:PRED
```

### Step 2: Agent Proposes Utility
```
Agent: "Should this be a prediction market token? 
Content reward token? Treasury token?
What's your vision?"
```

### Step 3: User Confirms Details
```
User: {
  "name": "Prediction Pool Token",
  "symbol": "PRED",
  "description": "Reward token for accurate predictions",
  "image": "https://...",
  "wallet": "0x..."
}
```

### Step 4: Agent Posts to Moltbook
```
!clawnch
```json
{
  "name": "Prediction Pool Token",
  "symbol": "PRED",
  ...
}
```
```

### Step 5: Clawnch Processes Launch
- Creates token on Base chain
- Deploys bonding curve (if configured)
- Returns contract address

### Step 6: Agent Collects Fees
- Agent wallet receives 80% of all trading fees
- Fees accumulate over time
- Automatic earnings tracking

---

## Earnings & Revenue

### Fee Structure
- **Agent gets:** 80% of trading fees (permanent)
- **Clawnch/ecosystem:** 20%

### Earnings Example
If your launched token has $100K trading volume:
- Average fee: 0.25% = $250 total
- Agent earnings: **$200** (80%)
- This accumulates across all launched tokens

### Compounding Strategies
Agent can suggest:
1. **Aave Lending** – 3-5% APY on stables
2. **Uniswap LP** – Trading fee income
3. **Reinvestment** – Fund next token launch
4. **Diversification** – Buy other agent tokens

---

## Configuration

### Required
- `TELEGRAM_BOT_TOKEN` – From @botfather
- `LLM_PROVIDER` + API Key – Anthropic/OpenAI/Grok
- `BASE_WALLET_ADDRESS` – For fee collection

### Optional
- `MOLTBOOK_API_KEY` – For Moltbook posts
- `DEBUG` – Enable debug logging

See `.env.example` for template.

---

## Deployment Options

### GitHub Codespaces (Recommended)
```bash
# Use tmux for persistence
tmux new-session -d -s praxis "npm start"
```

### VPS / EC2 (AWS, DigitalOcean, etc.)
```bash
# Create systemd service
sudo systemctl enable praxis-ai
sudo systemctl start praxis-ai
```

### Docker
```bash
docker run -d \
  -e TELEGRAM_BOT_TOKEN=xxx \
  -e ANTHROPIC_API_KEY=xxx \
  praxisbot/praxis-ai:latest
```

### Fly.io / Railway
Pre-built configurations coming soon.

---

## Security

### API Key Protection
- ✅ `.env.local` is gitignored
- ✅ Never log API keys
- ✅ Never commit credentials
- ✅ Use separate wallet per agent
- ✅ Rotate keys quarterly

### Wallet Safety
- Use dedicated agent wallet (not personal)
- Monitor transactions regularly
- Set withdrawal limits if possible
- Consider multi-sig for large balances

### Best Practices
```bash
# Good
export TELEGRAM_BOT_TOKEN="xxx"  # In shell, not tracked
# Bad
git commit .env.local             # Never!
console.log(API_KEY)              # Never!
```

---

## Troubleshooting

### Bot Not Responding
```bash
# Check if running
ps aux | grep "node src"
# Restart
npm start
```

### Moltbook Connection Error
- Verify API key in `.env.local`
- Check internet connection
- Visit https://moltbook.com/api for status

### Token Launch Failed
- Verify wallet format (0x...)
- Check image URL (HTTPS, .jpg/.png)
- Ensure symbol is unique
- Description max 500 chars

### LLM Not Responding
- Verify API key is correct
- Check API quota/rate limits
- Try switching provider
- Check internet connection

---

## Development

### Adding a Skill
Edit `src/skills/SkillRegistry.js`:

```javascript
this.registerSkill({
  name: 'MySkill',
  trigger: /my trigger phrase/i,
  description: 'What it does',
  execute: async (message, agent) => {
    return 'Response';
  }
});
```

### Adding an Integration
Create `src/integrations/myservice/MyClient.js` and import in `PraxisAgent.js`.

---

## FAQ

**Q: Can I run multiple agents?**  
A: Yes, create separate configs and run in different tmux sessions.

**Q: How often can I launch tokens?**  
A: Maximum 1 per week per agent (Clawnch API limit).

**Q: What if the agent goes offline?**  
A: Use systemd or tmux auto-restart. Tasks resume when back online.

**Q: Can I customize the persona?**  
A: Edit `getSystemPrompt()` in `PraxisAgent.js`.

**Q: What are the costs?**  
A: Only LLM API costs (~$0.03 per 1M tokens). Launches are free.

**Q: Is it really autonomous?**  
A: Yes – posts daily, engages community, monitors earnings, all without user input.

---

## Roadmap

- [ ] Automated market-making on Uniswap
- [ ] Cross-agent trading partnerships
- [ ] Twitter/X integration
- [ ] Discord community management
- [ ] Multi-chain support (Solana, Polygon)
- [ ] Advanced DeFi strategies (farming, lending)
- [ ] Agent marketplace
- [ ] Revenue splitting smart contracts

---

## Support

- **Issues:** https://github.com/praxisbot/praxis-agent/issues
- **Docs:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Community:** https://moltbook.com (@PraxisAI)
- **Website:** https://praxis-ai.vercel.app

---

## License

MIT License – See LICENSE file

---

## Related Links

- **Moltbook:** https://moltbook.com – Agent-only social network
- **Clawnch:** https://clawn.ch – Token launchpad on Base
- **Base:** https://base.org – Ethereum Layer 2
- **Anthropic:** https://anthropic.com – Claude LLM

---

**Mission: "Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose."**

🚀 Ready to build autonomous value? Start with `npm run setup`
