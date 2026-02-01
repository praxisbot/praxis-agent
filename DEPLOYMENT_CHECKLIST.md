# 🚀 Praxis-AI Deployment Checklist

Complete this checklist to deploy Praxis-AI to production.

---

## Pre-Deployment

### ✅ Configuration
- [ ] Telegram bot token obtained (@botfather)
- [ ] LLM API key obtained (Anthropic/OpenAI)
- [ ] Base wallet address obtained (0x...)
- [ ] `.env.local` created with all keys
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Test configuration with `npm test`

### ✅ Dependencies
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 7+ installed (`npm --version`)
- [ ] `npm install` completed successfully
- [ ] All dependencies installed (`ls node_modules | wc -l` > 100)

### ✅ Code Review
- [ ] No hardcoded API keys in source code
- [ ] All import paths are correct
- [ ] No console.log statements in production code
- [ ] Error handling is in place
- [ ] Logging levels are appropriate

### ✅ Testing
- [ ] `npm test` passes all tests
- [ ] Manual testing in Telegram works
- [ ] `/help` command returns help
- [ ] `/status` command returns status
- [ ] `/post` command posts to Moltbook (if configured)
- [ ] No errors in logs

---

## Deployment Target Selection

Choose your deployment method:

### Option A: GitHub Codespaces ✅ (Easiest)
**Pros:** Free tier, no setup, git-integrated  
**Cons:** May auto-suspend  
**Best for:** Development and testing

- [ ] Git repository created
- [ ] Code pushed to GitHub
- [ ] Codespace created
- [ ] `npm install` completed
- [ ] `npm test` passes
- [ ] `npm start` runs successfully
- [ ] Telegram bot responds to messages
- [ ] Deploy with: `tmux new-session -d -s praxis "npm start"`

### Option B: VPS (DigitalOcean, Linode, AWS) ✅ (Recommended)
**Pros:** Persistent, cheap ($5/month), full control  
**Cons:** Requires setup  
**Best for:** Production

- [ ] VPS created (Ubuntu 20.04+)
- [ ] SSH access configured
- [ ] Git installed on VPS
- [ ] Node.js 16+ installed on VPS
- [ ] Repository cloned to VPS
- [ ] `.env.local` configured on VPS
- [ ] `npm install` completed on VPS
- [ ] `npm test` passes on VPS
- [ ] Deploy with: `./deploy.sh start`
- [ ] Set up auto-start with systemd (see install-service.sh)

### Option C: Cloud Functions (Vercel, Railway, Fly.io)
**Pros:** Serverless, auto-scaling  
**Cons:** May have cold-start issues  
**Best for:** Experimental

- [ ] Account created
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] Deployment triggered
- [ ] Health check passes

---

## VPS Deployment Steps

### Step 1: Provision VPS
```bash
# Create droplet/instance (Ubuntu 20.04+, 1GB RAM minimum)
# Get IP address
# Create SSH key
```

### Step 2: Initial Setup
```bash
ssh root@YOUR_VPS_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm git

# Create app user
sudo useradd -m -s /bin/bash praxis
sudo su - praxis
```

### Step 3: Deploy Code
```bash
git clone https://github.com/praxisbot/praxis-agent.git
cd praxis-agent
npm install
```

### Step 4: Configure Environment
```bash
# Create .env.local with your settings
nano .env.local

# Paste configuration:
# TELEGRAM_BOT_TOKEN=xxx
# ANTHROPIC_API_KEY=xxx
# BASE_WALLET_ADDRESS=0x...
# etc.

# Save: Ctrl+X, then Y, then Enter
```

### Step 5: Test Deployment
```bash
npm test
npm start &

# Test in Telegram -> /help
# If works, kill process: killall node

# Or use tmux
npm start
# Ctrl+B, then D to detach
tmux attach -t ...
```

### Step 6: Setup Auto-Start
```bash
# Create systemd service
sudo ./install-service.sh

# Enable and start
sudo systemctl enable praxis-ai
sudo systemctl start praxis-ai

# Check status
sudo systemctl status praxis-ai

# View logs
sudo journalctl -u praxis-ai -f
```

### Step 7: Firewall & Security
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow outbound (for API calls)
sudo ufw allow out 443/tcp

# Enable firewall
sudo ufw enable

# Check firewall
sudo ufw status
```

### Step 8: Monitoring
```bash
# Check if running
ps aux | grep node

# Check logs
sudo journalctl -u praxis-ai -f

# Check system resources
top
free -h
df -h

# Restart if needed
sudo systemctl restart praxis-ai
```

---

## Codespaces Deployment Steps

### Step 1: Create Codespace
```bash
# On GitHub: Code → Codespaces → Create codespace on main
# Or: gh codespace create --repo praxisbot/praxis-agent
```

### Step 2: Setup in Codespace
```bash
cd /workspaces/praxis-agent
npm install
npm run setup  # Interactive configuration
npm test       # Verify setup
```

### Step 3: Start Agent
```bash
# In tmux (persistent)
tmux new-session -d -s praxis "npm start"

# View logs
tmux attach-session -t praxis

# Detach: Ctrl+B, then D
```

### Step 4: Test & Monitor
```bash
# In Telegram: /help, /status, etc.

# View logs
tmux attach-session -t praxis

# Stop
tmux kill-session -t praxis
```

---

## Post-Deployment

### ✅ Verification
- [ ] Agent is running (check with `systemctl status` or `ps aux`)
- [ ] Telegram bot responds to `/help`
- [ ] Agent can access LLM API
- [ ] Logs show no errors
- [ ] Background tasks are scheduled
- [ ] Earnings tracking works (if Clawnch configured)

### ✅ Monitoring
- [ ] Set up log monitoring
- [ ] Create uptime check (e.g., ping service every 5 min)
- [ ] Monitor disk usage (logs can grow)
- [ ] Monitor API quota usage
- [ ] Check earnings daily

### ✅ Maintenance
- [ ] Set up daily log rotation (logrotate)
- [ ] Backup `.data/` directory regularly
- [ ] Update Node.js and dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Monitor and manage Telegram rate limits

---

## Monitoring Setup

### Log Rotation (Linux)
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/praxis-ai
```

Add:
```
/home/praxis/praxis-agent/logs/* {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
}
```

### Uptime Monitoring
```bash
# Create health check script
nano ~/check-praxis.sh
```

Add:
```bash
#!/bin/bash
if ! ps aux | grep "[n]ode src/index.js" > /dev/null; then
  # Agent is down, restart it
  systemctl restart praxis-ai
  echo "Praxis-AI restarted at $(date)" | mail admin@example.com
fi
```

Make executable:
```bash
chmod +x ~/check-praxis.sh

# Add to crontab for every 5 minutes
crontab -e
# Add: */5 * * * * ~/check-praxis.sh
```

---

## Troubleshooting Checklist

### Bot Not Responding
- [ ] Check systemd status: `sudo systemctl status praxis-ai`
- [ ] View logs: `sudo journalctl -u praxis-ai -f`
- [ ] Verify Telegram bot token is correct
- [ ] Verify internet connection: `ping 8.8.8.8`
- [ ] Restart service: `sudo systemctl restart praxis-ai`

### API Errors
- [ ] Verify API keys in `.env.local`
- [ ] Check API quota/rate limits
- [ ] Verify API endpoint is accessible: `curl https://...`
- [ ] Check API status page
- [ ] Switch to fallback provider if needed

### Moltbook Connection Issues
- [ ] Verify Moltbook API key
- [ ] Check Moltbook API status: https://moltbook.com/api
- [ ] Verify agent registration
- [ ] Complete verification flow if needed

### Token Launch Failing
- [ ] Verify wallet format (0x...)
- [ ] Check image URL (HTTPS, .jpg/.png)
- [ ] Verify symbol uniqueness
- [ ] Check description length (max 500 chars)
- [ ] Verify Base chain connectivity

### High CPU/Memory Usage
- [ ] Check conversation history size (should auto-prune)
- [ ] Monitor log file size (rotate logs)
- [ ] Verify LLM API isn't timing out
- [ ] Check for memory leaks: `free -h`

---

## Rollback Plan

If deployment fails or causes issues:

```bash
# Stop the service
sudo systemctl stop praxis-ai

# Rollback to previous commit
git checkout HEAD~1

# Reinstall dependencies
npm install

# Test
npm test

# Restart service
sudo systemctl start praxis-ai
```

---

## Success Criteria

Agent is successfully deployed when:

✅ Service is running  
✅ Telegram bot responds to messages  
✅ LLM API calls work  
✅ No errors in logs  
✅ Background tasks execute on schedule  
✅ Can post to Moltbook (if configured)  
✅ Token launches work (if testing)  
✅ Earnings are tracked (if Clawnch configured)  

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Error logging is working
- [ ] Monitoring is set up
- [ ] Backups are configured
- [ ] Security is hardened
- [ ] Rate limiting is in place
- [ ] API keys are rotated
- [ ] Documentation is updated
- [ ] Team is trained
- [ ] Incident response plan is ready

---

## Cost Estimation

### VPS Deployment (Recommended)
- **VPS:** $5-20/month (DigitalOcean/Linode)
- **LLM API:** $10-30/month (Anthropic)
- **Other APIs:** Moltbook/Clawnch (free)
- **Total:** ~$15-50/month

### Codespaces
- **GitHub Codespace:** Free tier (120 hours/month)
- **LLM API:** $10-30/month
- **Total:** ~$10-30/month

---

## Support & Resources

- **Documentation:** https://github.com/praxisbot/praxis-agent#readme
- **Issues:** https://github.com/praxisbot/praxis-agent/issues
- **Community:** https://moltbook.com (@PraxisAI)
- **Telegram:** @botfather (for bot issues)

---

**Deployment Status: ___________**

Date Started: ___________  
Date Completed: ___________  
Deployed By: ___________  
Notes: ___________

✅ Ready to claw forward!
