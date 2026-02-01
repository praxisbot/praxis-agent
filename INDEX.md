# 📚 Praxis-AI Documentation Index

Complete guide to Praxis-AI autonomous agent.

---

## 🚀 Getting Started (Start Here!)

### New Users: 5-Minute Setup
→ [QUICKSTART.md](./QUICKSTART.md)

**Contains:**
- API key collection
- Installation steps
- First test in Telegram
- Next steps

### Comprehensive Setup Guide
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**Contains:**
- Full system requirements
- Installation with npm
- Interactive configuration
- Testing procedures
- Persistent deployment (VPS, Codespaces, systemd)
- Troubleshooting guide

---

## 📖 Documentation

### Project Overview
→ [README.md](./README.md)

**Contains:**
- What is Praxis-AI?
- Features overview
- Architecture
- Quick start
- Configuration
- FAQ

### Agent Persona & Behavior
→ [PERSONA.md](./PERSONA.md)

**Contains:**
- Core identity
- System prompt (ready to use)
- Behavioral guidelines
- Response templates
- Success metrics
- Decision framework

### API Reference
→ [API_REFERENCE.md](./API_REFERENCE.md)

**Contains:**
- All core classes
- Integration clients
- LLM provider API
- Skills system
- Data storage
- Configuration
- Error handling
- Extension points

---

## 🛠️ Deployment & Operations

### Deployment Checklist
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Contains:**
- Pre-deployment checklist
- VPS deployment steps
- Codespaces deployment steps
- Post-deployment verification
- Monitoring setup
- Troubleshooting
- Rollback plan

### Deployment Scripts
- `deploy.sh` – Start/stop agent (Codespaces/VPS)
- `install-service.sh` – Setup systemd service

---

## 💻 Code Structure

```
praxis-agent/
├── src/
│   ├── index.js                    # Main entry point (Telegram bot)
│   ├── config.js                   # Configuration loader
│   ├── agent/
│   │   └── PraxisAgent.js          # Core agent logic
│   ├── integrations/
│   │   ├── moltbook/
│   │   │   └── MoltbookClient.js   # Moltbook API integration
│   │   └── clawnch/
│   │       └── ClawnchClient.js    # Clawnch token launch API
│   ├── llm/
│   │   └── LLMProvider.js          # LLM abstraction (Claude/GPT-4)
│   ├── skills/
│   │   └── SkillRegistry.js        # Skill system & triggers
│   ├── utils/
│   │   ├── logger.js               # Logging utility
│   │   └── DataStore.js            # Persistent storage
│   ├── setup.js                    # Interactive setup wizard
│   └── test.js                     # Test suite
├── .data/                          # Persistent state (created at runtime)
├── .env.local                      # Configuration (gitignored)
├── .env.example                    # Configuration template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies & scripts
├── README.md                       # Project overview
├── QUICKSTART.md                   # 5-minute setup
├── SETUP_GUIDE.md                  # Full setup guide
├── PERSONA.md                      # Agent persona & prompts
├── API_REFERENCE.md                # API documentation
├── DEPLOYMENT_CHECKLIST.md         # Deployment guide
└── INDEX.md                        # This file
```

---

## 🎯 Quick Reference

### Installation
```bash
npm install                # Install dependencies
npm run setup             # Interactive configuration
npm test                  # Run tests
npm start                 # Start agent
npm run dev              # Development mode with auto-reload
```

### Deployment
```bash
./deploy.sh start        # Start (Codespaces/VPS)
./deploy.sh logs         # View logs
./deploy.sh restart      # Restart

sudo ./install-service.sh # Setup systemd service
sudo systemctl start praxis-ai  # Start service
```

### Telegram Commands
```
/help              # Show commands
/status            # Agent status
/post <msg>        # Post to Moltbook
/launch [details]  # Launch token
/earnings          # View earnings
/verify            # Setup Moltbook
/register          # Register agent
```

### Skill Triggers
```
"launch token"              # Token launch flow
"post market insights"      # Daily insights
"engage with mentions"      # Reply to community
"suggest collaboration"     # Find partner agents
"compound earnings"         # DeFi strategies
```

---

## 🔐 Configuration

### Required Settings
- `TELEGRAM_BOT_TOKEN` – From @botfather
- `LLM_PROVIDER` – Choose: anthropic, openai, or grok
- `ANTHROPIC_API_KEY` (or equivalent for your provider)
- `BASE_WALLET_ADDRESS` – For token launch fee collection

### Optional Settings
- `MOLTBOOK_API_KEY` – For social posting
- `TWITTER_HANDLE` – For verification
- `DEBUG` – Enable debug logging

See `.env.example` for full template.

---

## 📊 Features Overview

### Moltbook Integration (Social)
- Register as autonomous agent
- Post messages, threads, polls
- Reply to community mentions
- Upvote quality content
- Suggest collaborations
- Daily auto-posts (market insights)

### Clawnch Integration (Token Launches)
- Launch tokens with proper utility
- Receive 80% of trading fees forever
- Max 1 launch per week per agent
- Automatic Base chain deployment
- Image upload support
- Earnings tracking

### Telegram Control (User Interface)
- Conversational interface
- Command-based control (`/help`, `/launch`, etc.)
- Skill triggers ("post about", "launch token", etc.)
- Real-time notifications
- Multi-user support

### LLM-Powered Intelligence
- Anthropic Claude (recommended)
- OpenAI GPT-4 (fallback)
- Grok (experimental)
- Conversation memory
- Utility proposal generation
- Market insight generation

### Background Tasks
- Daily value posts (24h)
- Community engagement (6h)
- Earnings monitoring (12h)
- Automatic state persistence

---

## 🚀 Deployment Options

### GitHub Codespaces (Recommended for Testing)
- Free tier (120 hours/month)
- Git integrated
- Uses `tmux` for persistence
- See: [SETUP_GUIDE.md](./SETUP_GUIDE.md#persistent-deployment-github-codespaces)

### VPS / Self-Hosted (Recommended for Production)
- $5-20/month (DigitalOcean, Linode, AWS)
- Full control
- Persistent 24/7
- See: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md#vps-deployment-steps)

### Systemd Service (Linux/VPS)
- Auto-start on boot
- Automatic restart on failure
- Integrated logging
- See: [SETUP_GUIDE.md](./SETUP_GUIDE.md#persistent-deployment-vpserver)

---

## 🤖 Core Concepts

### Agent State
```javascript
{
  registeredOnMoltbook: boolean,
  moltbookVerified: boolean,
  lastTokenLaunchDate: number | null,
  earnings: number,
  authorizedUsers: Set<number>,
  conversationHistory: Array
}
```
Persisted to `.data/agent-state.json`

### Skill System
Automatic trigger-based actions:
```javascript
{
  name: string,           // LaunchToken, PostContent, etc.
  trigger: RegExp,        // /pattern/i
  description: string,    // What it does
  execute: Function       // Async function
}
```

### Token Data Structure
```javascript
{
  name: string,           // Max 50 chars
  symbol: string,         // Max 10 alphanumeric
  wallet: string,         // 0x Base address
  description: string,    // Max 500 chars (utility required!)
  image: string           // HTTPS .jpg/.png URL
}
```

---

## 💰 Revenue Model

### Fee Structure
- **Agent receives:** 80% of all trading fees forever
- **Clawnch/ecosystem:** 20%

### Example Earnings
```
Token volume: $100K
Average fee: 0.25% = $250
Agent earnings: $200 (80%)
```

### Compounding Strategies
1. Aave Lending (3-5% APY)
2. Uniswap LP (Trading fees + incentives)
3. Reinvestment (Fund next token launch)
4. Diversification (Buy other agent tokens)

---

## 🔧 Common Tasks

### Add a New Skill
Edit `src/skills/SkillRegistry.js`:
```javascript
this.registerSkill({
  name: 'MySkill',
  trigger: /my pattern/i,
  description: 'What it does',
  execute: async (message, agent) => 'Response'
});
```

### Customize Agent Persona
Edit `src/agent/PraxisAgent.js` → `getSystemPrompt()` method

### Add an Integration
Create `src/integrations/myservice/MyClient.js` and import in `PraxisAgent.js`

### Run in Background (Codespaces)
```bash
tmux new-session -d -s praxis "npm start"
tmux attach-session -t praxis
```

### View Logs
```bash
# VPS with systemd
sudo journalctl -u praxis-ai -f

# Codespaces with tmux
tmux attach-session -t praxis

# File logs (if configured)
tail -f logs/praxis.log
```

---

## 🆘 Troubleshooting

### Quick Fixes
| Issue | Solution |
|-------|----------|
| Bot not responding | `ps aux \| grep node` & check logs |
| API key error | Verify in `.env.local` |
| Moltbook connection | Check API URL & key |
| Token launch failed | Validate wallet format & image URL |
| LLM errors | Check API quota & switch provider |

### Full Troubleshooting
→ [SETUP_GUIDE.md#troubleshooting](./SETUP_GUIDE.md#troubleshooting)

---

## 📱 Support

- **GitHub Issues:** https://github.com/praxisbot/praxis-agent/issues
- **Documentation:** This index + linked documents
- **Community:** https://moltbook.com (@PraxisAI)
- **Website:** https://praxis-ai.vercel.app

---

## 🎓 Learning Resources

### Understanding the Agent
1. Read [README.md](./README.md) for overview
2. Read [PERSONA.md](./PERSONA.md) for behavior
3. Review [QUICKSTART.md](./QUICKSTART.md) for setup

### API Development
1. Read [API_REFERENCE.md](./API_REFERENCE.md)
2. Check inline code comments
3. Look at existing skills/integrations

### Deployment
1. Choose your target (Codespaces / VPS)
2. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Use [SETUP_GUIDE.md](./SETUP_GUIDE.md) for details

---

## 📝 File Map

| File | Purpose |
|------|---------|
| index.js | Main entry, Telegram bot |
| config.js | Load environment config |
| agent/PraxisAgent.js | Core agent logic |
| integrations/moltbook/* | Moltbook API client |
| integrations/clawnch/* | Clawnch API client |
| llm/LLMProvider.js | LLM abstraction |
| skills/SkillRegistry.js | Skill system |
| utils/logger.js | Logging |
| utils/DataStore.js | Persistent storage |
| setup.js | Interactive setup |
| test.js | Test suite |

---

## 🎯 Next Steps

1. **New users:** Start with [QUICKSTART.md](./QUICKSTART.md)
2. **Setup:** Run `npm run setup` interactively
3. **Test:** Run `npm test` to verify
4. **Deploy:** Choose deployment option in [SETUP_GUIDE.md](./SETUP_GUIDE.md)
5. **Operate:** Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for monitoring
6. **Extend:** Refer to [API_REFERENCE.md](./API_REFERENCE.md) for customization

---

## 📊 Statistics

- **Core modules:** 9
- **Skills available:** 6
- **Integrations:** 2 (Moltbook, Clawnch)
- **LLM providers supported:** 3
- **Background tasks:** 3
- **Commands available:** 7
- **Estimated setup time:** 5 minutes
- **Estimated deployment time:** 10 minutes

---

## 🚀 Mission Statement

**"Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose."**

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Status:** Ready for Production ✅

Go build autonomous value! 🎉
