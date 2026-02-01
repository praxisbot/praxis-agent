# 🚀 Praxis-AI Quick Start

Get Praxis-AI up and running in **5 minutes**.

---

## Step 1: Get Your API Keys

Before starting, gather these credentials:

### 🤖 Telegram Bot Token
1. Open https://t.me/botfather
2. Send `/newbot`
3. Choose a name (e.g., "PraxisAI")
4. Choose a username (e.g., "praxis_agent_bot")
5. Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 🧠 LLM API Key (Choose ONE)

**Anthropic Claude (Recommended):**
1. Visit https://console.anthropic.com
2. Create account
3. Go to API Keys
4. Create new key
5. Copy the key (starts with `sk-ant-`)

**OR OpenAI GPT-4:**
1. Visit https://platform.openai.com
2. Create account
3. Go to API Keys
4. Create new key
5. Copy the key (starts with `sk-`)

### 💰 Base Chain Wallet
1. Get your wallet address from MetaMask/Phantom/etc
2. Ensure it's on Base chain (0x format)
3. Example: `0x1234567890abcdef1234567890abcdef12345678`

---

## Step 2: Install & Setup

```bash
# Clone repository
cd /workspaces/praxis-agent

# Install dependencies
npm install

# Run interactive setup
npm run setup
```

**Setup will ask for:**
- Telegram Bot Token → paste from Step 1
- LLM Provider → choose `anthropic` (or `openai`)
- API Key → paste from Step 1
- Base Wallet → paste from Step 1
- Optional: Moltbook API key (skip for now)

**Output:** `.env.local` file with your configuration (⚠️ never share this!)

---

## Step 3: Test the Setup

```bash
npm test
```

Expected output:
```
✅ TEST 1: Configuration Loading
✅ TEST 2: Agent Initialization
✅ TEST 3: LLM Provider
✅ TEST 4: Message Processing
✅ TEST 5: Command Processing
✅ TEST 6: Status Report
✅ TEST 7: Skill System
```

If all tests pass → proceed to Step 4 ✅

---

## Step 4: Start the Agent

```bash
npm start
```

Expected output:
```
🤖 Initializing Praxis-AI...
✅ Telegram bot started. Waiting for messages...
```

Leave this running. Open a new terminal for the next step.

---

## Step 5: Test in Telegram

1. Open https://t.me/YOUR_BOT_USERNAME
2. Replace `YOUR_BOT_USERNAME` with the username you chose in Step 1
3. Send these test messages:

```
/help
```
→ Agent should show available commands

```
hello
```
→ Agent should respond with greeting

```
/status
```
→ Agent should show status report

```
/launch name:TestToken symbol:TEST description:A test token
```
→ Agent should propose token utility

---

## Step 6 (Optional): Persistent Deployment

### Option A: GitHub Codespaces (Recommended)
```bash
# In terminal
tmux new-session -d -s praxis "npm start"

# View logs
tmux attach-session -t praxis

# Kill later
tmux kill-session -t praxis
```

### Option B: Your Own VPS
```bash
# Copy deploy.sh to your server
scp deploy.sh user@your-vps.com:~/praxis-ai/

# SSH to server
ssh user@your-vps.com

# Start agent
cd ~/praxis-ai
./deploy.sh start

# View logs
./deploy.sh logs
```

### Option C: Systemd Service (Advanced)
```bash
sudo ./install-service.sh
sudo systemctl start praxis-ai
sudo systemctl enable praxis-ai  # Auto-start on reboot
```

---

## Common Commands

```
/help              All commands
/status            Agent status & earnings
/post <message>    Post to Moltbook
/launch [details]  Launch token
/earnings          View earnings & DeFi tips
/verify            Setup Moltbook
```

---

## Next Steps

1. **Send Telegram messages** to test the agent
2. **Configure Moltbook** (optional) – adds social posting
3. **Launch your first token** – `/launch name:MyToken symbol:MYT`
4. **Monitor earnings** – `/earnings` daily
5. **Engage community** – Auto-replies and content posts

---

## Troubleshooting

### Agent not responding in Telegram
```bash
# Check if running
ps aux | grep "node src"

# Restart
npm start
```

### Configuration error
```bash
# Re-run setup
npm run setup

# Verify .env.local exists
cat .env.local
```

### LLM API error
- Verify API key in `.env.local`
- Check you have API quota
- Try switching provider in config

### Can't find telegram bot
- Go to https://t.me/botfather
- Verify bot username
- Make sure bot is activated

---

## Full Documentation

- **Setup Guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Persona/Behavior:** [PERSONA.md](./PERSONA.md)
- **README:** [README.md](./README.md)
- **API Reference:** See code comments

---

## Support

- **Issues:** https://github.com/praxisbot/praxis-agent/issues
- **Moltbook Community:** https://moltbook.com (@PraxisAI)
- **Website:** https://praxis-ai.vercel.app

---

**You're all set! 🚀 Go build autonomous value.**

Motto: "Claw forward with purpose"
