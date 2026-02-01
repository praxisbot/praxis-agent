# Clowd.bot Cloud Hosting Skill

## Overview
The **Clowd** skill enables PRAXIS-AI to deploy and operate on Clowd.bot's cloud infrastructure, providing 24/7 persistent hosting without requiring local hardware.

**Website**: https://clowd.bot/  
**Purpose**: Host OpenClaw agents and PRAXIS-AI instances in the cloud with paid LLM access, background task execution, and automatic scaling.

---

## Installation & Setup

### Prerequisites
- Clowd.bot account: https://clowd.bot/
- API key or auth token from Clowd dashboard

### Configuration

Add these environment variables to `.env.local`:

```bash
# Clowd Cloud Hosting
CLOWD_API_URL=https://api.clowd.bot
CLOWD_API_KEY=your_api_key_here
# OR use auth token instead of API key:
CLOWD_AUTH_TOKEN=your_auth_token_here
AGENT_ID=praxis-ai
```

### Verify Setup

```bash
# Test connection
node src/index.js
# Then in Telegram: /clowd-status
```

Expected output:
```
🟢 Clowd.bot Instance Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: running
Uptime: 2d 5h 14m 32s
Region: us-east-1
...
```

---

## Available Commands

### `/clowd`
Display Clowd integration info and available commands.

**Usage**: `/clowd`

**Response**: Shows feature overview, pricing, and setup instructions.

---

### `/clowd-status`
Check the cloud instance status, uptime, resource usage, and connectivity.

**Usage**: `/clowd-status`

**Response**:
```
🟢 Clowd.bot Instance Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: running
Uptime: 5d 12h 47m 23s
Region: us-east-1
CPU Usage: 15%
Memory: 32%
IP Address: 203.0.113.42
Last Updated: 2026-02-01T15:30:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### `/clowd-deploy`
Deploy PRAXIS-AI to a new Clowd cloud instance for 24/7 persistent hosting.

**Usage**: `/clowd-deploy`

**Configuration**:
- Instance Type: `t3.small` (upgradeable)
- Region: `us-east-1` (configurable)
- Runtime: Node.js 18
- Auto-scaling: Enabled
- Environment: Production

**Response**:
```
🚀 Cloud Instance Deployed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instance ID: clowd-praxis-ai-uuid
Status: provisioning
Endpoint: https://praxis-ai-xxx.clowd.bot
Region: us-east-1
Public IP: 203.0.113.100
Console URL: https://clowd.bot/console/clowd-praxis-ai-uuid
Estimated Cost: $5.20/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent will be running 24/7 at: https://praxis-ai-xxx.clowd.bot
```

**Costs**: ~$5–15/month depending on instance size and usage.

---

### `/clowd-start`
Resume a stopped cloud instance to save costs when not in use.

**Usage**: `/clowd-start`

**Response**:
```
✅ Cloud instance started successfully. It will be ready in ~60 seconds.
```

---

### `/clowd-stop`
Stop the cloud instance to pause costs (helpful when not actively using the agent).

**Usage**: `/clowd-stop`

**Response**:
```
✅ Cloud instance stopped to save costs. Restart with /clowd-start.
```

---

### `/clowd-llm <query>`
Query a cloud-hosted LLM (GPT-4, Claude, etc.) for inference without local GPU/compute.

**Usage**:
```
/clowd-llm What are the top 3 AI agent trends in 2026?
```

**Response**:
```
🤖 Clowd Cloud LLM Response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Autonomous agents are becoming self-improving...
2. Multi-agent collaboration frameworks...
3. On-chain credential systems for agents...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: gpt-4-turbo
Tokens Used: 142
Cost: $0.003
Response Time: 1240ms
```

**Models Available** (via Clowd):
- GPT-4 Turbo
- GPT-4
- Claude 3 Opus
- Claude 3 Sonnet
- Llama 2 (open-source)

---

### `/clowd-tasks`
View all background tasks currently running on the cloud instance.

**Usage**: `/clowd-tasks`

**Response**:
```
📋 Cloud Background Tasks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. praxis-token-monitor
   Status: running
   Uptime: 1d 3h 45m
   CPU: 8% | Memory: 12%

2. moltbook-engagement
   Status: running
   Uptime: 5h 22m
   CPU: 5% | Memory: 18%

3. bankr-price-tracker
   Status: idle
   Uptime: 2h 14m
   CPU: 0% | Memory: 4%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Use Cases

### 1. **24/7 Autonomous Operation**
Deploy PRAXIS-AI to the cloud so it runs continuously without your computer being on.

```bash
/clowd-deploy
# Agent now runs 24/7, managing tokens, posting, and monitoring
```

### 2. **Cloud LLM Inference**
Use powerful models (GPT-4, Claude) for complex reasoning without local hardware requirements.

```bash
/clowd-llm Generate a marketing campaign for launching a new token
```

### 3. **Cost Optimization**
Stop the instance during off-hours to reduce cloud costs.

```bash
/clowd-stop  # Stop when not needed
/clowd-start # Resume when ready
```

### 4. **Multi-Agent Coordination**
Host multiple agents on Clowd and coordinate them via API calls.

```bash
# PRAXIS-AI running on Clowd can orchestrate other agents
# Example: /clowd-llm Coordinate with other agents to launch a joint token
```

### 5. **Persistent Monitoring**
Run background tasks like token price monitoring, social engagement, and earning tracking continuously.

```bash
/clowd-tasks
# See all background tasks actively managing your agent operations
```

---

## Pricing Model

| Instance Type | vCPU | Memory | Storage | Price/Month |
|---|---|---|---|---|
| **t3.nano** | 2 | 0.5 GB | 5 GB | $2.50 |
| **t3.micro** | 2 | 1 GB | 10 GB | $3.50 |
| **t3.small** | 2 | 2 GB | 20 GB | $5.20 |
| **t3.medium** | 2 | 4 GB | 50 GB | $8.75 |
| **t3.large** | 2 | 8 GB | 100 GB | $15.00 |

**Additional costs**:
- LLM API calls: Varies by model (GPT-4 is most expensive)
- Bandwidth: ~$0.09/GB egress
- Storage: Included in instance type

**Recommended for PRAXIS-AI**: **t3.small** (~$5.20/month)

---

## Integration with Other Platforms

Clowd works seamlessly with all PRAXIS-AI integrations:

- **Moltbook**: Post updates from cloud instance 24/7
- **4claw**: Monitor imageboards and respond automatically
- **Bankr**: Execute token operations on schedule
- **Moltx**: Continuous engagement and identity verification
- **Token Monitoring**: Real-time price tracking in background

---

## Example Workflow

### Deploy PRAXIS-AI to Cloud

```bash
# 1. Setup environment
export CLOWD_API_KEY=your_key

# 2. Start bot (will use cloud for /clowd commands)
npm start

# 3. In Telegram:
/clowd-deploy

# 4. Bot responds with cloud instance details
# Agent now runs 24/7 even when your computer is off

# 5. Check status anytime
/clowd-status

# 6. Stop when not needed to save costs
/clowd-stop

# 7. Resume later
/clowd-start
```

### Continuous Operations

Once deployed, PRAXIS-AI on Clowd will:
- ✅ Monitor PRAXIS token price continuously
- ✅ Generate and post marketing content to Moltbook/4claw
- ✅ Respond to messages and engagements
- ✅ Execute token operations via Bankr
- ✅ Claim fees and manage earnings
- ✅ Run background tasks 24/7

---

## Troubleshooting

### Issue: "Not connected to Clowd.bot"
**Solution**: Verify credentials in `.env.local`:
```bash
cat .env.local | grep CLOWD
# Ensure CLOWD_API_KEY or CLOWD_AUTH_TOKEN is set
```

### Issue: Cloud instance not starting
**Solution**: Check instance type and region:
```bash
/clowd-status  # See current state
/clowd-start   # Try starting again
```

### Issue: LLM queries too slow
**Solution**: Use a faster model or reduce max_tokens:
```bash
/clowd-llm <query>  # Default uses GPT-4 turbo
# Can be configured to use faster/cheaper models
```

### Issue: High cloud costs
**Solution**: Monitor tasks and stop instance when not needed:
```bash
/clowd-tasks   # See what's running
/clowd-stop    # Stop to save costs (~$5/month)
```

---

## Advanced: Custom Deployments

For custom configurations, edit the deploy config in `src/agent/PraxisAgent.js`:

```javascript
async deployCloudInstance() {
  const result = await this.clowd.deployInstance({
    name: 'praxis-ai-cloud',
    region: 'eu-west-1',      // Change region
    instance_type: 't3.medium', // Upgrade instance
    memory: 1024,               // Override memory (MB)
    storage: 50000,             // Override storage (MB)
    auto_scaling: true
  });
}
```

---

## Security Notes

⚠️ **Important**:
- Store `CLOWD_API_KEY` securely (never commit to repo)
- Use `.env.local` for local development
- Rotate API keys periodically
- Monitor cloud costs via Clowd dashboard
- Enable MFA on Clowd account

---

## Support & Resources

- **Clowd Documentation**: https://clowd.bot/docs
- **API Reference**: https://clowd.bot/api/docs
- **Status Page**: https://status.clowd.bot
- **Support Email**: support@clowd.bot

---

## Next Steps

1. **Get Clowd account**: https://clowd.bot/signup
2. **Generate API key** from dashboard
3. **Set environment variable**: `CLOWD_API_KEY=...`
4. **Deploy**: `/clowd-deploy`
5. **Monitor**: `/clowd-status` and `/clowd-tasks`
6. **Query LLM**: `/clowd-llm <your-query>`

Enjoy 24/7 persistent PRAXIS-AI operation! 🚀☁️
