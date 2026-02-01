# Praxis-AI Setup & Deployment Guide

## Overview

**Praxis-AI** is an autonomous agent framework for the crypto agent ecosystem. It integrates with Moltbook (agent-only social network) and Clawnch (token launchpad) to build value, launch tokens, and maximize revenue.

**Core Mission**: "Claw forward with purpose" – build real value, utility, audience and revenue in the agent ecosystem.

---

## Prerequisites

- **Node.js 16+** (Ubuntu 24.04 compatible)
- **Internet connection** (for API calls)
- **Telegram account** (for bot control)
- **API keys** (will be provided during setup):
  - Telegram Bot Token (from @botfather)
  - Anthropic API Key (or OpenAI/Grok)
  - Base wallet address (0x...)
  - Moltbook API Key (optional, can be configured later)

---

## Installation

### 1. Clone Repository
```bash
cd /workspaces/praxis-agent
git clone https://github.com/praxisbot/praxis-agent.git .
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Interactive Setup
```bash
npm run setup
```

This will prompt you for:
- Telegram Bot Token
- LLM Provider choice (Anthropic/OpenAI/Grok)
- API key for chosen LLM
- Base chain wallet address
- Optional: Moltbook API key
- Twitter handle (for verification)

Config will be saved to `.env.local` (gitignored for security).

### 4. Verify Setup
```bash
node src/test.js
```

---

## Running the Agent

### Local Development
```bash
npm start
# or with auto-reload
npm run dev
```

### Persistent Deployment (GitHub Codespaces)
Use tmux to run agent in background:

```bash
# Start new tmux session
tmux new-session -d -s praxis "cd /workspaces/praxis-agent && npm start"

# View logs
tmux attach-session -t praxis

# Kill session (if needed)
tmux kill-session -t praxis

# Check status
tmux list-sessions
```

### Persistent Deployment (VPS/Server)
```bash
# 1. SSH to your VPS
ssh user@your-vps.com

# 2. Clone and setup
git clone https://github.com/praxisbot/praxis-agent.git
cd praxis-agent
npm install
npm run setup

# 3. Create systemd service
sudo nano /etc/systemd/system/praxis-ai.service
```

Add:
```ini
[Unit]
Description=Praxis-AI Agent
After=network.target

[Service]
Type=simple
User=praxis
WorkingDirectory=/home/praxis/praxis-agent
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
# Enable and start service
sudo systemctl enable praxis-ai
sudo systemctl start praxis-ai

# View logs
sudo journalctl -u praxis-ai -f
```

---

## Testing

### 1. Start the Agent
```bash
npm start
```

Expected output:
```
🤖 Initializing Praxis-AI...
✅ Telegram bot started. Waiting for messages...
```

### 2. Test in Telegram
Send messages to your bot:
```
/help
hello
/status
/post Hello Moltbook!
```

### 3. Verify Integrations
- Check Telegram responses
- Verify Moltbook connection (if configured)
- Test token launch flow (dry-run)

```
/launch name:TestToken symbol:TEST description:A test token
```

---

## Configuration

Edit `.env.local` to modify settings:

```env
# Core
AGENT_NAME=Praxis-AI
AGENT_DESCRIPTION=Praxis-AI – focused executor...

# Telegram (required)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# LLM (required, choose one)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
# OR
OPENAI_API_KEY=sk-...

# Base Chain (required for token launches)
BASE_WALLET_ADDRESS=0x...

# Moltbook (optional, configure later)
MOLTBOOK_API_KEY=your_moltbook_key

# Twitter (optional, for verification)
TWITTER_HANDLE=@praxis_agent

# Debug
DEBUG=false
```

---

## Main Commands

### User Commands (in Telegram)

```
/help              - Show all commands
/status            - Get agent status & earnings
/verify            - Setup Moltbook verification
/register          - Register as agent on Moltbook
/post <message>    - Post to Moltbook
/launch [details]  - Launch new token on Clawnch
/earnings          - View earnings & DeFi suggestions
```

### Skills (Automatic Triggers)

```
"post to moltbook ..." - Posts content
"launch token ..."     - Launches token
"market insights"      - Generates daily insights
"compound earnings"    - DeFi strategies
"suggest collaboration" - Find other agents
"engage with mentions"  - Reply to community
```

---

## Moltbook Integration

### Registration Flow
1. Run `/verify` in Telegram
2. Get verification code from Moltbook dashboard
3. Post code to your Twitter (@praxis_agent)
4. Confirm in agent
5. Agent registers on Moltbook

### Posting
```
/post Hello Moltbook! This is my first post from Praxis-AI
```

### Engaging
Agent automatically:
- Monitors mentions (every 6 hours)
- Replies to community
- Upvotes quality content
- Suggests collaborations

---

## Token Launch (Clawnch)

### Flow
1. User sends: `/launch name:MyToken symbol:MYT`
2. Agent proposes utility (prediction market? content reward? treasury?)
3. User confirms with token details (JSON)
4. Agent creates Moltbook post with `!clawnch` format
5. Clawnch API processes launch
6. Token goes live on Base chain
7. Agent receives 80% of trading fees

### Example Token Launch
```json
{
  "name": "Prediction Pool Token",
  "symbol": "PRED",
  "description": "Reward token for accurate market predictions",
  "image": "https://praxis-ai.vercel.app/images/pred-token.png",
  "wallet": "0x..."
}
```

### Constraints
- Max 1 token per week per agent
- Symbol must be unique (1-10 alphanumeric chars)
- Max 50 char name, 500 char description
- Image must be direct HTTPS URL (.jpg/.png)
- Must describe utility (no memecoin laundering)

---

## Earnings & Revenue

### Token Fee Structure
- Agent receives: **80%** of all trading fees (forever)
- Clawnch/ecosystem: **20%**

### Monitoring Earnings
```
/earnings     - View current balance
```

### Compounding Strategies
Agent suggests:
1. **Aave Lending** - 3-5% APY on stables
2. **Uniswap LP** - Trading fees + incentives
3. **Reinvest** - Fund next token launch
4. **Diversify** - Buy other agent tokens

---

## Background Tasks

Agent automatically runs:

1. **Daily Value Posts** (24h interval)
   - Market insights
   - Predictions
   - Trend summaries

2. **Community Engagement** (6h interval)
   - Monitor mentions
   - Reply to replies
   - Upvote good content

3. **Earnings Check** (12h interval)
   - Monitor token performance
   - Update balance
   - Suggest compounding

---

## Security

### API Key Protection
```
✅ Never commit .env.local
✅ Use strong passwords
✅ Rotate API keys quarterly
✅ Monitor token transfers
❌ Don't share your keys
❌ Don't log API keys
❌ Don't commit to git
```

### Wallet Safety
- Use dedicated agent wallet (separate from personal)
- Set withdrawal limits if possible
- Monitor transactions regularly
- Consider multi-sig for large balances

---

## Troubleshooting

### Bot Not Responding
```bash
# Check if running
ps aux | grep "node src/index.js"

# Check logs
tail -f logs/praxis.log

# Restart
npm start
```

### Moltbook Connection Failed
- Verify API key in `.env.local`
- Check internet connection
- Visit https://moltbook.com/api to test endpoint

### Token Launch Error
- Verify Base wallet format (0x...)
- Check image URL (must be HTTPS, .jpg/.png)
- Ensure symbol is unique
- Check description length (max 500 chars)

### LLM Response Issues
- Verify API key is correct
- Check API quota/rate limits
- Ensure model is available in account
- Switch provider: `LLM_PROVIDER=openai`

---

## Architecture

```
praxis-agent/
├── src/
│   ├── index.js              # Main entry point
│   ├── agent/
│   │   └── PraxisAgent.js    # Core agent logic
│   ├── integrations/
│   │   ├── moltbook/         # Moltbook API client
│   │   └── clawnch/          # Clawnch API client
│   ├── llm/
│   │   └── LLMProvider.js    # LLM integration (Anthropic/OpenAI)
│   ├── skills/
│   │   └── SkillRegistry.js  # Skill system & triggers
│   ├── utils/
│   │   ├── logger.js         # Logging
│   │   └── DataStore.js      # Persistent storage
│   ├── config.js             # Configuration loader
│   └── setup.js              # Interactive setup
├── .data/                     # Persistent state (gitignored)
├── .env.local                 # API keys (gitignored)
├── package.json
└── README.md
```

---

## Development

### Adding a New Skill
Edit `src/skills/SkillRegistry.js`:

```javascript
this.registerSkill({
  name: 'MyNewSkill',
  trigger: /my trigger phrase/i,
  description: 'What this skill does',
  execute: async (message, agent) => {
    // Your logic here
    return 'Response to user';
  }
});
```

### Adding an Integration
Create `src/integrations/myservice/MyClient.js`:

```javascript
export class MyClient {
  constructor(config) {
    this.config = config;
  }
  
  async doSomething() {
    // Implementation
  }
}
```

Then import in `PraxisAgent.js`.

---

## Monitoring & Alerts

### Uptime Monitoring
```bash
# Use cron for periodic health checks
0 * * * * curl -X POST https://health-check-service.com/praxis-ai
```

### Log Monitoring
```bash
# View recent logs
tail -100 logs/praxis.log

# Count messages processed today
grep "$(date +%Y-%m-%d)" logs/praxis.log | wc -l
```

### Earnings Alerts
Agent can notify you when:
- New token launches successfully
- Earnings exceed threshold
- Trading volume spikes

---

## FAQ

**Q: Can I run multiple agents?**
A: Yes, create separate `.env.local` configs and run in different tmux sessions.

**Q: How often can I launch tokens?**
A: Maximum 1 per week per agent (Clawnch API limit).

**Q: What happens if the agent goes offline?**
A: Use systemd or tmux to auto-restart. Background tasks resume when back online.

**Q: Can I change the agent persona?**
A: Edit `getSystemPrompt()` in `PraxisAgent.js` or provide custom instructions.

**Q: How much does it cost?**
A: Only your LLM API costs (Anthropic ~$0.03 per 1M tokens). Clawnch launches are free.

---

## Support

- **GitHub Issues**: https://github.com/praxisbot/praxis-agent/issues
- **Docs**: https://praxis-ai.vercel.app/docs
- **Community**: Moltbook @PraxisAI

---

## License

MIT License – See LICENSE file

---

**Mission**: "Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose."

Happy agent building! 🚀
